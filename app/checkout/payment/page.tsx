'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import Footer from '@/components/Footer';
import CompanyReliability from '@/components/CompanyReliability';
import { ChevronRight, CreditCard, Check, Loader2, ArrowRight } from 'lucide-react';

export default function PaymentPage() {
  const router = useRouter();
  const { cart, clearCart, isLoggedIn } = useAppStore();

  // Local storage states
  const [shippingId, setShippingId] = useState<string | null>(null);
  const [billingId, setBillingId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'offline'>('cod');
  const [offlineMethods, setOfflineMethods] = useState<any[]>([]);
  const [selectedOfflineMethodId, setSelectedOfflineMethodId] = useState<number | null>(null);

  // Offline form values
  const [offlineFields, setOfflineFields] = useState<Record<string, string>>({});
  const [paymentNote, setPaymentNote] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Retrieve storage states
  useEffect(() => {
    const sId = localStorage.getItem('shopsphere_checkout_shipping_id');
    const bId = localStorage.getItem('shopsphere_checkout_billing_id');
    if (!sId) {
      router.push('/checkout/shipping');
      return;
    }
    setShippingId(sId);
    setBillingId(bId || sId);
    setCouponCode(localStorage.getItem('shopsphere_checkout_coupon_code') || '');
    setCouponDiscount(Number(localStorage.getItem('shopsphere_checkout_coupon_discount') || '0'));
    setShippingCost(Number(localStorage.getItem('shopsphere_checkout_shipping_cost') || '0'));
    setTax(Number(localStorage.getItem('shopsphere_checkout_tax') || '0'));
    setTotal(Number(localStorage.getItem('shopsphere_checkout_total') || '0'));
  }, [router]);

  // Load offline methods
  useEffect(() => {
    const loadOffline = async () => {
      try {
        const res = await api.getOfflinePaymentMethods();
        const methods = Array.isArray(res) ? res : (res?.methods || []);
        setOfflineMethods(methods);
        if (methods.length > 0) {
          setSelectedOfflineMethodId(methods[0].id);
        }
      } catch (err) {
        console.error('Failed to load offline methods', err);
      }
    };
    loadOffline();
  }, []);

  const getSelectedOfflineMethod = () => {
    return offlineMethods.find(m => m.id === selectedOfflineMethodId);
  };

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    setErrorMsg(null);

    try {
      // Force final cart sync with backend database
      await api.syncCart(cart);
      let res: any;
      if (paymentMethod === 'cod') {
        const payload = {
          address_id: shippingId,
          billing_address_id: billingId,
          coupon_code: couponCode,
        };
        res = await api.placeOrder(payload);
      } else {
        // Offline payment placement
        if (!selectedOfflineMethodId) {
          throw new Error('Please select an offline payment method.');
        }
        const method = getSelectedOfflineMethod();
        const inputs: Record<string, string> = {};
        if (method?.method_informations) {
          method.method_informations.forEach((info: any) => {
            const key = info.customer_input;
            inputs[key] = offlineFields[key] || '';
          });
        }

        const payload = {
          address_id: shippingId,
          billing_address_id: billingId,
          coupon_code: couponCode,
          method_id: selectedOfflineMethodId,
          method_informations: btoa(JSON.stringify(inputs)),
          payment_note: paymentNote,
          order_note: '',
        };
        res = await api.placeOfflineOrder(payload);
      }

      if (res && res.order_ids) {
        // Clear global cart & storage
        clearCart();
        localStorage.removeItem('shopsphere_checkout_shipping_id');
        localStorage.removeItem('shopsphere_checkout_billing_id');
        localStorage.removeItem('shopsphere_checkout_coupon_code');
        localStorage.removeItem('shopsphere_checkout_coupon_discount');

        const idsParam = Array.isArray(res.order_ids) ? res.order_ids.join(',') : res.order_ids;
        router.push(`/checkout/complete?order_ids=${idsParam}`);
      } else {
        throw new Error(res?.message || 'Failed to place order. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to place order. Please check address configuration.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeMethod = getSelectedOfflineMethod();

  return (
    <div className="w-full min-h-screen bg-neutral-gray-50 flex flex-col justify-between">
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-10 flex-1">
        {/* Progress indicators */}
        <div className="flex items-center justify-between max-w-xl mx-auto mb-10 text-xs sm:text-sm font-bold text-neutral-gray-500">
          <div className="flex items-center gap-1.5 text-primary-600">
            <div className="w-6 h-6 rounded-full bg-primary-50 flex items-center justify-center border border-primary-200">1</div>
            <span>Cart</span>
          </div>
          <ChevronRight size={14} />
          <div className="flex items-center gap-1.5 text-primary-600">
            <div className="w-6 h-6 rounded-full bg-primary-50 flex items-center justify-center border border-primary-200">2</div>
            <span>Shipping</span>
          </div>
          <ChevronRight size={14} />
          <div className="flex items-center gap-1.5 text-primary-600">
            <div className="w-6 h-6 rounded-full bg-primary-600 text-neutral-white flex items-center justify-center">3</div>
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
          {/* Payment Selection Area */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-neutral-white border border-neutral-gray-200/60 rounded-3xl p-6 md:p-8 shadow-sm">
              <h2 className="text-base font-extrabold text-neutral-gray-900 mb-6 uppercase tracking-wider">Choose Payment Method</h2>

              <div className="space-y-4">
                {/* Cash on Delivery Option */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`border rounded-2xl p-5 cursor-pointer transition-all flex items-center gap-4 relative ${
                    paymentMethod === 'cod'
                      ? 'border-primary-600 bg-primary-50/10'
                      : 'border-neutral-gray-200 hover:border-neutral-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'cod' ? 'border-primary-600' : 'border-neutral-gray-300'
                  }`}>
                    {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-primary-600" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-extrabold text-neutral-gray-900">Cash on Delivery (COD)</h4>
                    <p className="text-[10px] font-semibold text-neutral-gray-500 mt-0.5">Pay with cash upon delivery of your products.</p>
                  </div>
                </div>

                {/* Offline Payment Option */}
                {offlineMethods.length > 0 && (
                  <div
                    onClick={() => setPaymentMethod('offline')}
                    className={`border rounded-2xl p-5 cursor-pointer transition-all flex flex-col gap-4 relative ${
                      paymentMethod === 'offline'
                        ? 'border-primary-600 bg-primary-50/10'
                        : 'border-neutral-gray-200 hover:border-neutral-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'offline' ? 'border-primary-600' : 'border-neutral-gray-300'
                      }`}>
                        {paymentMethod === 'offline' && <div className="w-2.5 h-2.5 rounded-full bg-primary-600" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-extrabold text-neutral-gray-900">Offline Manual Payment</h4>
                        <p className="text-[10px] font-semibold text-neutral-gray-500 mt-0.5">Pay via custom mobile financial services (bKash/Nagad/Bank Transfer).</p>
                      </div>
                    </div>

                    {paymentMethod === 'offline' && (
                      <div className="mt-4 border-t border-neutral-gray-200/60 pt-4 space-y-4">
                        {/* Selector */}
                        <div>
                          <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">Select Offline Channel</label>
                          <select
                            value={selectedOfflineMethodId || ''}
                            onChange={(e) => setSelectedOfflineMethodId(Number(e.target.value))}
                            className="w-full bg-neutral-white px-4 py-3 border border-neutral-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-600/10 focus:border-primary-600 text-xs font-bold cursor-pointer"
                          >
                            {offlineMethods.map(m => (
                              <option key={m.id} value={m.id}>{m.method_name}</option>
                            ))}
                          </select>
                        </div>

                        {activeMethod && (
                          <div className="p-4 bg-neutral-50 border border-neutral-gray-200/50 rounded-2xl space-y-3">
                            <h5 className="text-xs font-bold text-neutral-gray-800">Payment Instructions:</h5>
                            {activeMethod.method_informations?.map((info: any, i: number) => (
                              <div key={i} className="text-xs text-neutral-gray-600">
                                <span className="font-bold">{info.customer_input.replace(/_/g, ' ')}:</span> {info.customer_placeholder}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Fields */}
                        {activeMethod?.method_informations?.map((info: any, i: number) => (
                          <div key={i}>
                            <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">
                              {info.customer_input.replace(/_/g, ' ')} *
                            </label>
                            <input
                              type="text"
                              value={offlineFields[info.customer_input] || ''}
                              onChange={(e) => setOfflineFields({
                                ...offlineFields,
                                [info.customer_input]: e.target.value
                              })}
                              placeholder={info.customer_placeholder || 'Enter details'}
                              className="w-full px-4 py-3 border border-neutral-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-600/10 focus:border-primary-600 text-xs font-semibold"
                              required
                            />
                          </div>
                        ))}

                        <div>
                          <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">Payment Note</label>
                          <textarea
                            value={paymentNote}
                            onChange={(e) => setPaymentNote(e.target.value)}
                            placeholder="Provide any additional comments or details."
                            rows={3}
                            className="w-full px-4 py-3 border border-neutral-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-600/10 focus:border-primary-600 text-xs font-semibold resize-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right side summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-neutral-white border border-neutral-gray-200/60 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-extrabold text-neutral-gray-900 uppercase tracking-wider pb-2 border-b border-neutral-gray-100">
                Order Review
              </h3>

              <div className="space-y-3 border-b border-neutral-gray-100 pb-4">
                <div className="flex justify-between text-xs text-neutral-gray-600 font-semibold">
                  <span>Subtotal</span>
                  <span>৳{total - shippingCost - tax + couponDiscount}</span>
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
                  <span>Grand Total</span>
                  <span className="text-primary-600">৳{total}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-600 hover:bg-primary-800 disabled:opacity-50 text-neutral-white font-bold rounded-xl text-xs shadow-lg shadow-primary-600/10 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <>
                    <CreditCard size={14} />
                    <span>Place Order (৳{total})</span>
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
