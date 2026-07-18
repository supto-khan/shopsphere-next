'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Loader2, Phone, Clipboard, CheckCircle, Package, Truck, Smile, MapPin, Calendar, CreditCard } from 'lucide-react';
import Footer from '@/components/Footer';
import { resolveStorageImage } from '@/lib/order-utils';

interface OrderDetailItem {
  id: number;
  qty: number;
  price: number;
  variation?: string | Record<string, any>;
  product_details?: {
    id: number;
    name: string;
    thumbnail_full_url?: {
      path?: string;
    };
    [key: string]: any;
  };
  order?: {
    id: number;
    order_status: string;
    payment_status: string;
    payment_method: string;
    created_at: string;
    order_amount: number;
    shipping_address_data?: string | Record<string, any>;
  };
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<OrderDetailItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !phoneNumber) return;
    setLoading(true);
    setError(null);
    setDetails([]);
    setHasSearched(false);

    try {
      const res = await api.trackOrder(Number(orderId), phoneNumber);
      if (Array.isArray(res) && res.length > 0) {
        setDetails(res);
        setHasSearched(true);
      } else {
        setError('Invalid Order ID or Phone Number. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to track order. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStepIndex = (status: string) => {
    const statuses = ['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered'];
    return statuses.indexOf(status.toLowerCase());
  };

  const getOrderStatusDisplay = (status: string) => {
    const map: Record<string, string> = {
      pending: 'Order Placed',
      confirmed: 'Order Confirmed',
      processing: 'Packaging',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      canceled: 'Canceled',
      returned: 'Returned',
      failed: 'Failed'
    };
    return map[status.toLowerCase()] || status;
  };

  const firstDetail = details[0];
  const orderInfo = firstDetail?.order;

  // Shipping address parser
  const shippingAddress = (() => {
    if (!orderInfo?.shipping_address_data) return null;
    try {
      return typeof orderInfo.shipping_address_data === 'string'
        ? JSON.parse(orderInfo.shipping_address_data)
        : orderInfo.shipping_address_data;
    } catch {
      return null;
    }
  })();

  const timelineSteps = [
    { label: 'Order Placed', statusKey: 'pending', icon: Clipboard },
    { label: 'Confirmed', statusKey: 'confirmed', icon: CheckCircle },
    { label: 'Packaging', statusKey: 'processing', icon: Package },
    { label: 'Out for Delivery', statusKey: 'out_for_delivery', icon: Truck },
    { label: 'Delivered', statusKey: 'delivered', icon: Smile },
  ];

  const currentStatusIndex = orderInfo ? getStatusStepIndex(orderInfo.order_status) : -1;

  return (
    <div className="w-full min-h-[calc(100vh-65px)] overflow-y-auto bg-neutral-gray-50/50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

        {/* Search Card */}
        <div className="bg-neutral-white border border-neutral-gray-200/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-neutral-gray-100/30 mb-8">
          <div className="text-center max-w-md mx-auto mb-8">
            <h2 className="text-2xl font-black text-neutral-gray-900 tracking-tight">Track Your Order</h2>
            <p className="text-xs text-neutral-gray-500 font-semibold mt-1">
              Enter your Order ID and the phone number used at checkout to get real-time delivery updates.
            </p>
          </div>

          <form onSubmit={handleTrack} className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-gray-400 text-xs font-bold uppercase tracking-wider">ID</span>
              <input
                type="number"
                placeholder="Order ID"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border border-neutral-gray-250/70 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-600/30 focus:border-primary-500 bg-neutral-gray-50/50"
              />
            </div>

            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-gray-400">
                <Phone size={14} />
              </span>
              <input
                type="tel"
                placeholder="Phone Number"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 border border-neutral-gray-250/70 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-600/30 focus:border-primary-500 bg-neutral-gray-50/50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3.5 bg-primary-600 hover:bg-primary-800 disabled:opacity-50 text-neutral-white text-xs font-bold rounded-2xl cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary-600/10 active:scale-95 shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Tracking...</span>
                </>
              ) : (
                <span>Track Order</span>
              )}
            </button>
          </form>

          {error && (
            <div className="max-w-2xl mx-auto mt-4 px-4 py-3 bg-red-50 border border-red-100 text-red-500 text-xs font-bold rounded-xl text-center">
              {error}
            </div>
          )}
        </div>

        {/* Results Sections */}
        {hasSearched && orderInfo && (
          <div className="space-y-6">

            {/* Order Overview Header Card */}
            <div className="bg-neutral-white border border-neutral-gray-200/60 rounded-3xl p-6 shadow-md flex flex-wrap gap-4 items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-neutral-gray-400 uppercase tracking-widest">Order Reference</span>
                <h3 className="text-lg font-black text-neutral-gray-900 mt-0.5">#{orderInfo.id}</h3>
              </div>

              <div className="flex gap-6 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-neutral-gray-50 border border-neutral-gray-200/40 flex items-center justify-center text-neutral-gray-600">
                    <Calendar size={15} />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-neutral-gray-400 uppercase tracking-wider block">Order Date</span>
                    <span className="text-xs font-bold text-neutral-gray-800">
                      {new Date(orderInfo.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-neutral-gray-50 border border-neutral-gray-200/40 flex items-center justify-center text-neutral-gray-600">
                    <CreditCard size={15} />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-neutral-gray-400 uppercase tracking-wider block">Total Amount</span>
                    <span className="text-xs font-extrabold text-neutral-gray-900">৳{orderInfo.order_amount}</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-neutral-gray-400 uppercase tracking-widest block mb-1">Status</span>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  orderInfo.order_status === 'delivered' ? 'bg-green-100/70 text-green-800 border-green-200' :
                  orderInfo.order_status === 'canceled' ? 'bg-red-50 text-red-600 border-red-100' :
                  'bg-primary-100/70 text-primary-800 border-primary-200'
                }`}>
                  {getOrderStatusDisplay(orderInfo.order_status)}
                </span>
              </div>
            </div>

            {/* Tracking Progress Timeline Card */}
            {orderInfo.order_status !== 'canceled' && orderInfo.order_status !== 'failed' && (
              <div className="bg-neutral-white border border-neutral-gray-200/60 rounded-3xl p-6 sm:p-8 shadow-md">
                <h4 className="text-sm font-black text-neutral-gray-900 uppercase tracking-wider mb-8">Delivery Timeline</h4>

                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-0 mt-4">
                  {/* Timeline progress line background (for desktop) */}
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-neutral-gray-100 -translate-y-1/2 hidden md:block z-0" />

                  {timelineSteps.map((step, idx) => {
                    const isCompleted = idx <= currentStatusIndex;
                    const isActive = idx === currentStatusIndex;
                    const Icon = step.icon;

                    return (
                      <div key={step.statusKey} className="relative z-1 flex md:flex-col items-center gap-4 md:gap-3 flex-1 text-left md:text-center w-full">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-500 shrink-0 ${
                          isCompleted
                            ? 'bg-primary-600 border-primary-600 text-neutral-white shadow-lg shadow-primary-600/20'
                            : 'bg-neutral-white border-neutral-gray-200 text-neutral-gray-400'
                        } ${isActive ? 'ring-4 ring-primary-100' : ''}`}>
                          <Icon size={16} />
                        </div>
                        <div>
                          <span className={`text-xs font-bold block ${
                            isCompleted ? 'text-primary-600' : 'text-neutral-gray-500'
                          } ${isActive ? 'font-extrabold text-neutral-gray-900' : ''}`}>
                            {step.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Items Summary & Delivery Info Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Shipping Address Column */}
              <div className="md:col-span-1 bg-neutral-white border border-neutral-gray-200/60 rounded-3xl p-6 shadow-md space-y-4">
                <h4 className="text-sm font-black text-neutral-gray-900 uppercase tracking-wider border-b border-neutral-gray-200/50 pb-2.5 flex items-center gap-1.5">
                  <MapPin size={15} className="text-neutral-gray-400" /> Shipping Info
                </h4>
                {shippingAddress ? (
                  <div className="text-xs font-semibold text-neutral-gray-700 space-y-2 leading-relaxed">
                    <p className="font-extrabold text-neutral-gray-900">{shippingAddress.contact_person_name}</p>
                    <p>{shippingAddress.address}</p>
                    <p>{shippingAddress.city}, {shippingAddress.zip}</p>
                    <p className="pt-2 text-neutral-gray-500">Phone: {shippingAddress.phone}</p>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-gray-400 italic">No shipping details available.</p>
                )}
              </div>

              {/* Items List Column */}
              <div className="md:col-span-2 bg-neutral-white border border-neutral-gray-200/60 rounded-3xl p-6 shadow-md space-y-4">
                <h4 className="text-sm font-black text-neutral-gray-900 uppercase tracking-wider border-b border-neutral-gray-200/50 pb-2.5">
                  Order Items
                </h4>
                <div className="divide-y divide-neutral-gray-150/60">
                  {details.map((item) => {
                    const src = resolveStorageImage(item?.product_details?.thumbnail_full_url?.path);
                    return (
                      <div key={item.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src || '/assets/img/placeholder.webp'}
                          alt={item.product_details?.name}
                          className="w-14 h-14 rounded-xl border border-neutral-gray-200/40 object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-bold text-neutral-gray-800 line-clamp-2 leading-snug">
                            {item.product_details?.name}
                          </h5>
                          {item.variation && (
                            <span className="text-[10px] text-neutral-gray-400 font-bold block mt-0.5">
                              {typeof item.variation === 'string' ? item.variation : JSON.stringify(item.variation)}
                            </span>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-neutral-gray-500 block">Qty: {item.qty}</span>
                          <span className="text-xs font-extrabold text-neutral-gray-900 block mt-0.5">৳{item.price}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}
