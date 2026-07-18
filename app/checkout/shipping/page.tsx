'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import Footer from '@/components/Footer';
import CompanyReliability from '@/components/CompanyReliability';
import { ChevronRight, MapPin, Check, Loader2, ArrowRight, Gift } from 'lucide-react';

const COUNTRIES = ['Bangladesh', 'United States', 'United Kingdom', 'India', 'Canada', 'Australia', 'Germany', 'France'];
const ADDRESS_TYPES = ['home', 'office', 'permanent'];

export default function ShippingPage() {
  const router = useRouter();
  const { cart, getCartSubtotal, isLoggedIn, setLoginOpen } = useAppStore();
  const token = useAppStore((state) => state.token);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      router.push('/');
    }
  }, [cart, router]);

  // Prompt login if not logged in
  useEffect(() => {
    if (!isLoggedIn && !token) {
      localStorage.setItem('post_login_redirect', '/checkout/shipping');
      setLoginOpen(true);
    }
  }, [isLoggedIn, token, setLoginOpen]);

  // Sync in-memory cart with backend database
  useEffect(() => {
    const syncCartWithBackend = async () => {
      if ((isLoggedIn || token) && cart.length > 0) {
        try {
          await api.syncCart(cart);
        } catch (err) {
          console.error('Failed to sync cart with backend:', err);
        }
      }
    };
    syncCartWithBackend();
  }, [isLoggedIn, token, cart]);

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Address forms state
  const [selectedShippingId, setSelectedShippingId] = useState<number | null>(null);
  const [shippingForm, setShippingForm] = useState({
    contact_person_name: '',
    phone: '',
    email: '',
    address_type: 'home',
    country: 'Bangladesh',
    city: '',
    zip: '',
    address: '',
  });

  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [selectedBillingId, setSelectedBillingId] = useState<number | null>(null);
  const [billingForm, setBillingForm] = useState({
    contact_person_name: '',
    phone: '',
    address_type: 'home',
    country: 'Bangladesh',
    city: '',
    zip: '',
    address: '',
  });

  // Coupons / Totals
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCouponCode, setAppliedCouponCode] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Country dropdowns
  const [shipCountryOpen, setShipCountryOpen] = useState(false);
  const [billCountryOpen, setBillCountryOpen] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const list = await api.getAddresses();
        const arr = Array.isArray(list) ? list : [];
        setSavedAddresses(arr);

        // Pre-select first shipping / billing address if they exist
        const defaultShip = arr.find(a => Number(a.is_billing) === 0) || arr[0];
        const defaultBill = arr.find(a => Number(a.is_billing) === 1) || arr[0];

        if (defaultShip) {
          setSelectedShippingId(defaultShip.id);
          setShippingForm({
            contact_person_name: defaultShip.contact_person_name || '',
            phone: defaultShip.phone || '',
            email: defaultShip.email || '',
            address_type: defaultShip.address_type || 'home',
            country: defaultShip.country || 'Bangladesh',
            city: defaultShip.city || '',
            zip: defaultShip.zip || '',
            address: defaultShip.address || '',
          });
        }
        if (defaultBill) {
          setSelectedBillingId(defaultBill.id);
          setBillingForm({
            contact_person_name: defaultBill.contact_person_name || '',
            phone: defaultBill.phone || '',
            address_type: defaultBill.address_type || 'home',
            country: defaultBill.country || 'Bangladesh',
            city: defaultBill.city || '',
            zip: defaultBill.zip || '',
            address: defaultBill.address || '',
          });
        }
      } catch (err) {
        console.error('Failed to load saved addresses', err);
      } finally {
        setLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, [isLoggedIn]);

  // Handle coupon check
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    setCouponError(null);
    try {
      const res = await api.validateCoupon(couponCode.trim());
      if (res && res.coupon_discount !== undefined) {
        setCouponDiscount(Number(res.coupon_discount));
        setAppliedCouponCode(couponCode.trim());
      } else {
        setCouponError('Invalid or expired coupon code.');
      }
    } catch (err: any) {
      setCouponError(err?.message || 'Failed to apply coupon.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  // Calculations & Configuration States
  const [shippingCost, setShippingCost] = useState(0);
  const [tax, setTax] = useState(0);
  const subtotal = getCartSubtotal();
  const total = Math.max(0, subtotal + shippingCost + tax - couponDiscount);

  // Sync pricing from backend cart list details
  useEffect(() => {
    const fetchBackendCartPricing = async () => {
      if (!isLoggedIn && !token) return;
      try {
        // Sync cart first
        await api.syncCart(cart);
        // Get server cart details including config-based tax and shipping
        const serverCart = await api.getCartList();
        if (Array.isArray(serverCart)) {
          let calculatedTax = 0;
          let calculatedShipping = 0;
          serverCart.forEach((item) => {
            calculatedTax += Number(item.applied_tax || 0);
            calculatedShipping += Number(item.shipping_cost || 0);
          });
          setTax(calculatedTax);
          setShippingCost(calculatedShipping);
        }
      } catch (err) {
        console.error('Failed to retrieve server cart calculations:', err);
      }
    };
    fetchBackendCartPricing();
  }, [cart, isLoggedIn, token, couponDiscount]);

  // Handle Submit
  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      let finalShippingId = selectedShippingId;
      let finalBillingId = selectedBillingId;

      // 1. Save or use shipping address
      if (selectedShippingId === null) {
        // Validate manual input
        if (!shippingForm.contact_person_name || !shippingForm.phone || !shippingForm.address || !shippingForm.city || !shippingForm.zip) {
          throw new Error('Please fill in all required shipping address fields.');
        }
        // Save new shipping address
        const shipPayload = {
          ...shippingForm,
          is_billing: 0,
          latitude: 0,
          longitude: 0,
        };
        await api.addAddress(shipPayload);
        // Fetch addresses to get the newly added ID
        const currentList = await api.getAddresses();
        const latest = currentList[currentList.length - 1];
        if (latest) {
          finalShippingId = latest.id;
        }
      }

      // 2. Save or use billing address
      if (billingSameAsShipping) {
        finalBillingId = finalShippingId;
      } else if (selectedBillingId === null) {
        if (!billingForm.contact_person_name || !billingForm.phone || !billingForm.address || !billingForm.city || !billingForm.zip) {
          throw new Error('Please fill in all required billing address fields.');
        }
        const billPayload = {
          ...billingForm,
          is_billing: 1,
          latitude: 0,
          longitude: 0,
        };
        await api.addAddress(billPayload);
        const currentList = await api.getAddresses();
        const latest = currentList[currentList.length - 1];
        if (latest) {
          finalBillingId = latest.id;
        }
      }

      // Save checkout states to localStorage
      localStorage.setItem('shopsphere_checkout_shipping_id', String(finalShippingId));
      localStorage.setItem('shopsphere_checkout_billing_id', String(finalBillingId));
      localStorage.setItem('shopsphere_checkout_coupon_code', appliedCouponCode);
      localStorage.setItem('shopsphere_checkout_coupon_discount', String(couponDiscount));
      localStorage.setItem('shopsphere_checkout_shipping_cost', String(shippingCost));
      localStorage.setItem('shopsphere_checkout_tax', String(tax));
      localStorage.setItem('shopsphere_checkout_total', String(total));

      router.push('/checkout/payment');
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-neutral-gray-50 flex flex-col justify-between">
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-10 flex-1">
        {/* Checkout Steps Progress Bar */}
        <div className="flex items-center justify-between max-w-xl mx-auto mb-10 text-xs sm:text-sm font-bold text-neutral-gray-500">
          <div className="flex items-center gap-1.5 text-primary-600">
            <div className="w-6 h-6 rounded-full bg-primary-50 flex items-center justify-center border border-primary-200">1</div>
            <span>Cart</span>
          </div>
          <ChevronRight size={14} />
          <div className="flex items-center gap-1.5 text-primary-600">
            <div className="w-6 h-6 rounded-full bg-primary-600 text-neutral-white flex items-center justify-center">2</div>
            <span>Shipping</span>
          </div>
          <ChevronRight size={14} />
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-neutral-200/80 flex items-center justify-center">3</div>
            <span>Payment</span>
          </div>
          <ChevronRight size={14} />
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-neutral-200/80 flex items-center justify-center">4</div>
            <span>Complete</span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs font-semibold text-red-600">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Shipping Form Area */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. SHIPPING ADDRESS */}
            <div className="bg-neutral-white border border-neutral-gray-200/60 rounded-3xl p-6 md:p-8 shadow-sm">
              <h2 className="text-base font-extrabold text-neutral-gray-900 mb-6 uppercase tracking-wider">Shipping Address</h2>

              {/* Saved Shipping Addresses Dropdown */}
              {isLoggedIn && savedAddresses.length > 0 && (
                <div className="mb-6">
                  <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">Choose from saved addresses</label>
                  <select
                    value={selectedShippingId || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setSelectedShippingId(null);
                        setShippingForm({
                          contact_person_name: '',
                          phone: '',
                          email: '',
                          address_type: 'home',
                          country: 'Bangladesh',
                          city: '',
                          zip: '',
                          address: '',
                        });
                      } else {
                        const id = Number(val);
                        setSelectedShippingId(id);
                        const addr = savedAddresses.find(a => a.id === id);
                        if (addr) {
                          setShippingForm({
                            contact_person_name: addr.contact_person_name || '',
                            phone: addr.phone || '',
                            email: addr.email || '',
                            address_type: addr.address_type || 'home',
                            country: addr.country || 'Bangladesh',
                            city: addr.city || '',
                            zip: addr.zip || '',
                            address: addr.address || '',
                          });
                        }
                      }
                    }}
                    className="w-full bg-neutral-white px-4 py-3 border border-neutral-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-600/10 focus:border-primary-600 text-xs font-semibold appearance-none cursor-pointer"
                  >
                    {savedAddresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.contact_person_name} - {addr.address}, {addr.city} ({addr.address_type})
                      </option>
                    ))}
                    <option value="">-- Add New Address --</option>
                  </select>
                </div>
              )}

              {/* Shipping Manual Input Form (Always visible, pre-filled) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div>
                  <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">Contact Person Name *</label>
                  <input
                    type="text"
                    value={shippingForm.contact_person_name}
                    onChange={(e) => {
                      setShippingForm({ ...shippingForm, contact_person_name: e.target.value });
                      setSelectedShippingId(null);
                    }}
                    placeholder="e.g. John Doe"
                    className="w-full px-4 py-3 border border-neutral-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-600/10 focus:border-primary-600 text-xs font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">Phone *</label>
                  <input
                    type="tel"
                    value={shippingForm.phone}
                    onChange={(e) => {
                      setShippingForm({ ...shippingForm, phone: e.target.value });
                      setSelectedShippingId(null);
                    }}
                    placeholder="e.g. +8801700000000"
                    className="w-full px-4 py-3 border border-neutral-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-600/10 focus:border-primary-600 text-xs font-semibold"
                    required
                  />
                </div>
                {!isLoggedIn && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">Email *</label>
                    <input
                      type="email"
                      value={shippingForm.email}
                      onChange={(e) => {
                        setShippingForm({ ...shippingForm, email: e.target.value });
                        setSelectedShippingId(null);
                      }}
                      placeholder="e.g. john@example.com"
                      className="w-full px-4 py-3 border border-neutral-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-600/10 focus:border-primary-600 text-xs font-semibold"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">Address Type</label>
                  <div className="relative">
                    <select
                      value={shippingForm.address_type}
                      onChange={(e) => {
                        setShippingForm({ ...shippingForm, address_type: e.target.value });
                        setSelectedShippingId(null);
                      }}
                      className="w-full bg-neutral-white px-4 py-3 border border-neutral-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-600/10 focus:border-primary-600 text-xs font-semibold capitalize appearance-none cursor-pointer"
                    >
                      {ADDRESS_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">Country *</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShipCountryOpen(!shipCountryOpen)}
                      className="w-full flex justify-between items-center bg-neutral-white px-4 py-3 border border-neutral-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-600/10 focus:border-primary-600 text-xs font-semibold text-left"
                    >
                      <span>{shippingForm.country}</span>
                    </button>
                    {shipCountryOpen && (
                      <div className="absolute z-30 left-0 right-0 mt-2 bg-neutral-white border border-neutral-gray-200/80 rounded-2xl shadow-xl max-h-48 overflow-y-auto">
                        {COUNTRIES.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              setShippingForm({ ...shippingForm, country: c });
                              setSelectedShippingId(null);
                              setShipCountryOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-neutral-gray-50 text-xs font-bold text-neutral-gray-700 transition-colors"
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">City *</label>
                  <input
                    type="text"
                    value={shippingForm.city}
                    onChange={(e) => {
                      setShippingForm({ ...shippingForm, city: e.target.value });
                      setSelectedShippingId(null);
                    }}
                    placeholder="e.g. Dhaka"
                    className="w-full px-4 py-3 border border-neutral-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-600/10 focus:border-primary-600 text-xs font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">Zip Code *</label>
                  <input
                    type="text"
                    value={shippingForm.zip}
                    onChange={(e) => {
                      setShippingForm({ ...shippingForm, zip: e.target.value });
                      setSelectedShippingId(null);
                    }}
                    placeholder="e.g. 1200"
                    className="w-full px-4 py-3 border border-neutral-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-600/10 focus:border-primary-600 text-xs font-semibold"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">Full Address *</label>
                  <textarea
                    value={shippingForm.address}
                    onChange={(e) => {
                      setShippingForm({ ...shippingForm, address: e.target.value });
                      setSelectedShippingId(null);
                    }}
                    placeholder="House No, Road No, Area details"
                    rows={3}
                    className="w-full px-4 py-3 border border-neutral-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-600/10 focus:border-primary-600 text-xs font-semibold resize-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Toggle Billing Same As Shipping */}
            <div className="bg-neutral-white border border-neutral-gray-200/60 rounded-3xl p-5 flex items-center gap-3 shadow-sm select-none">
              <input
                type="checkbox"
                id="billing_same"
                checked={billingSameAsShipping}
                onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-neutral-gray-300 rounded focus:ring-primary-600"
              />
              <label htmlFor="billing_same" className="text-xs font-bold text-neutral-gray-800 cursor-pointer">
                Billing address is the same as shipping address
              </label>
            </div>

            {/* 2. BILLING ADDRESS FORM */}
            {!billingSameAsShipping && (
              <div className="bg-neutral-white border border-neutral-gray-200/60 rounded-3xl p-6 md:p-8 shadow-sm">
                <h2 className="text-base font-extrabold text-neutral-gray-900 mb-6 uppercase tracking-wider">Billing Address</h2>

                {isLoggedIn && savedAddresses.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">Choose from saved addresses</label>
                    <select
                      value={selectedBillingId || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setSelectedBillingId(null);
                          setBillingForm({
                            contact_person_name: '',
                            phone: '',
                            address_type: 'home',
                            country: 'Bangladesh',
                            city: '',
                            zip: '',
                            address: '',
                          });
                        } else {
                          const id = Number(val);
                          setSelectedBillingId(id);
                          const addr = savedAddresses.find(a => a.id === id);
                          if (addr) {
                            setBillingForm({
                              contact_person_name: addr.contact_person_name || '',
                              phone: addr.phone || '',
                              address_type: addr.address_type || 'home',
                              country: addr.country || 'Bangladesh',
                              city: addr.city || '',
                              zip: addr.zip || '',
                              address: addr.address || '',
                            });
                          }
                        }
                      }}
                      className="w-full bg-neutral-white px-4 py-3 border border-neutral-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-600/10 focus:border-primary-600 text-xs font-semibold appearance-none cursor-pointer"
                    >
                      {savedAddresses.map((addr) => (
                        <option key={addr.id} value={addr.id}>
                          {addr.contact_person_name} - {addr.address}, {addr.city} ({addr.address_type})
                        </option>
                      ))}
                      <option value="">-- Add New Billing Address --</option>
                    </select>
                  </div>
                )}

                {/* Billing Manual Input Form (Always visible, pre-filled) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div>
                    <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">Contact Person Name *</label>
                    <input
                      type="text"
                      value={billingForm.contact_person_name}
                      onChange={(e) => {
                        setBillingForm({ ...billingForm, contact_person_name: e.target.value });
                        setSelectedBillingId(null);
                      }}
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-3 border border-neutral-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-600/10 focus:border-primary-600 text-xs font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">Phone *</label>
                    <input
                      type="tel"
                      value={billingForm.phone}
                      onChange={(e) => {
                        setBillingForm({ ...billingForm, phone: e.target.value });
                        setSelectedBillingId(null);
                      }}
                      placeholder="e.g. +8801700000000"
                      className="w-full px-4 py-3 border border-neutral-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-600/10 focus:border-primary-600 text-xs font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">Address Type</label>
                    <select
                      value={billingForm.address_type}
                      onChange={(e) => {
                        setBillingForm({ ...billingForm, address_type: e.target.value });
                        setSelectedBillingId(null);
                      }}
                      className="w-full bg-neutral-white px-4 py-3 border border-neutral-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-600/10 focus:border-primary-600 text-xs font-semibold capitalize appearance-none cursor-pointer"
                    >
                      {ADDRESS_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">Country *</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setBillCountryOpen(!billCountryOpen)}
                        className="w-full flex justify-between items-center bg-neutral-white px-4 py-3 border border-neutral-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-600/10 focus:border-primary-600 text-xs font-semibold text-left"
                      >
                        <span>{billingForm.country}</span>
                      </button>
                      {billCountryOpen && (
                        <div className="absolute z-30 left-0 right-0 mt-2 bg-neutral-white border border-neutral-gray-200/80 rounded-2xl shadow-xl max-h-48 overflow-y-auto">
                          {COUNTRIES.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => {
                                setBillingForm({ ...billingForm, country: c });
                                setSelectedBillingId(null);
                                setBillCountryOpen(false);
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-neutral-gray-50 text-xs font-bold text-neutral-gray-700 transition-colors"
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">City *</label>
                    <input
                      type="text"
                      value={billingForm.city}
                      onChange={(e) => {
                        setBillingForm({ ...billingForm, city: e.target.value });
                        setSelectedBillingId(null);
                      }}
                      placeholder="e.g. Dhaka"
                      className="w-full px-4 py-3 border border-neutral-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-600/10 focus:border-primary-600 text-xs font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">Zip Code *</label>
                    <input
                      type="text"
                      value={billingForm.zip}
                      onChange={(e) => {
                        setBillingForm({ ...billingForm, zip: e.target.value });
                        setSelectedBillingId(null);
                      }}
                      placeholder="e.g. 1200"
                      className="w-full px-4 py-3 border border-neutral-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-600/10 focus:border-primary-600 text-xs font-semibold"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">Full Address *</label>
                    <textarea
                      value={billingForm.address}
                      onChange={(e) => {
                        setBillingForm({ ...billingForm, address: e.target.value });
                        setSelectedBillingId(null);
                      }}
                      placeholder="House No, Road No, Area details"
                      rows={3}
                      className="w-full px-4 py-3 border border-neutral-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-600/10 focus:border-primary-600 text-xs font-semibold resize-none"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Summary Panel */}
          <div className="lg:col-span-4 space-y-6">
            {/* Promo Code Coupon Card */}
            {isLoggedIn && (
              <div className="bg-neutral-white border border-neutral-gray-200/60 rounded-3xl p-6 shadow-sm">
                <h3 className="text-xs font-extrabold text-neutral-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Gift size={16} className="text-primary-600 animate-bounce" />
                  <span>Promo Code</span>
                </h3>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter Coupon Code"
                    disabled={!!appliedCouponCode}
                    className="flex-1 px-4 py-2.5 border border-neutral-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600/10 focus:border-primary-600 text-xs font-semibold bg-neutral-white"
                  />
                  <button
                    type="submit"
                    disabled={validatingCoupon || !!appliedCouponCode}
                    className="px-4 py-2.5 bg-primary-600 hover:bg-primary-800 disabled:bg-neutral-200 text-neutral-white font-bold rounded-xl text-xs transition-colors shrink-0 cursor-pointer"
                  >
                    {validatingCoupon ? <Loader2 className="animate-spin" size={14} /> : 'Apply'}
                  </button>
                </form>
                {couponError && <p className="text-[10px] text-red-600 mt-2 font-semibold">{couponError}</p>}
                {appliedCouponCode && (
                  <p className="text-[10px] text-green-600 mt-2 font-semibold">
                    ✓ Coupon "{appliedCouponCode}" Applied Successfully!
                  </p>
                )}
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-neutral-white border border-neutral-gray-200/60 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-extrabold text-neutral-gray-900 uppercase tracking-wider pb-2 border-b border-neutral-gray-100">
                Order Summary
              </h3>

              <div className="space-y-3">
                {cart.map((item) => {
                  const discount = item.product.discount || 0;
                  const finalPrice = item.product.discount_type === 'amount' || item.product.discount_type === 'flat'
                    ? Math.max(0, item.product.unit_price - discount)
                    : Math.max(0, item.product.unit_price - (item.product.unit_price * discount) / 100);
                  return (
                    <div key={item.product.id} className="flex gap-3 justify-between items-center text-xs font-semibold text-neutral-gray-600">
                      <span className="truncate flex-1 max-w-[200px]">{item.product.name}</span>
                      <span className="shrink-0">qty: {item.quantity}</span>
                      <span className="font-bold text-neutral-gray-800 shrink-0">৳{finalPrice * item.quantity}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-neutral-gray-100 pt-4 space-y-3">
                <div className="flex justify-between text-xs text-neutral-gray-600 font-semibold">
                  <span>Subtotal</span>
                  <span>৳{subtotal}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-xs text-green-600 font-bold">
                    <span>Coupon Discount</span>
                    <span>-৳{couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-neutral-gray-600 font-semibold">
                  <span>Shipping Cost</span>
                  <span>৳{shippingCost}</span>
                </div>
                <div className="flex justify-between text-xs text-neutral-gray-600 font-semibold">
                  <span>Tax (5%)</span>
                  <span>৳{tax}</span>
                </div>
                <div className="flex justify-between text-sm text-neutral-gray-900 font-extrabold pt-2 border-t border-neutral-gray-100">
                  <span>Total Amount</span>
                  <span className="text-primary-600">৳{total}</span>
                </div>
              </div>

              <button
                onClick={handleContinue}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-600 hover:bg-primary-800 disabled:opacity-50 text-neutral-white font-bold rounded-xl text-xs shadow-lg shadow-primary-600/10 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <>
                    <span>Continue to Payment</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
            <CompanyReliability />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
