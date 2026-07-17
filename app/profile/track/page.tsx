'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { ProductThumb, formatAmount, orderStatusClasses } from '@/lib/profile-utils';
import { TrackResultsSkeleton } from '@/components/profile-skeletons';
import { Loader2, Search, Truck } from 'lucide-react';

function formatOrderDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any[] | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!orderId || !phone) {
      setError('Please enter both order ID and phone number');
      return;
    }
    setLoading(true);
    try {
      const data = await api.trackOrder(Number(orderId), phone);
      if (Array.isArray(data) && data.length > 0) {
        setResult(data);
      } else {
        setError('Invalid Order Id or Phone Number');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid Order Id or Phone Number';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 border-b border-neutral-gray-100 pb-4">
        <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
          <Truck size={16} />
        </div>
        <h2 className="text-sm font-extrabold text-neutral-gray-900 tracking-tight">Track Your Shipment</h2>
      </div>

      <form onSubmit={submit} className="bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-6 shadow-xl shadow-neutral-gray-100/10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-end">
          <div>
            <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">Order ID <span className="text-red-500">*</span></label>
            <input 
              type="number" 
              required 
              value={orderId} 
              onChange={(e) => setOrderId(e.target.value)} 
              placeholder="e.g., 1002" 
              className="w-full px-3.5 py-2.5 border border-neutral-gray-200 rounded-xl bg-neutral-gray-50/30 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
            <input 
              type="tel" 
              required 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder="Enter active phone" 
              className="w-full px-3.5 py-2.5 border border-neutral-gray-200 rounded-xl bg-neutral-gray-50/30 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600" 
            />
          </div>
          <div>
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full px-5 py-2.5 bg-primary-600 hover:bg-primary-800 text-neutral-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-60 transition-all cursor-pointer shadow-md shadow-primary-600/10 active:scale-95 hover:-translate-y-0.5 h-[41px]"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <><Search size={14} /> <span>Locate Package</span></>}
            </button>
          </div>
        </div>
        {error && <div className="mt-3 text-xs font-bold text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl">{error}</div>}
      </form>

      {loading && (
        <TrackResultsSkeleton />
      )}

      {result && (
        <div className="space-y-3.5">
          {result.map((item, idx) => {
            const product = item.product_details || {};
            const deliveryStatus = item.delivery_status || item.order?.order_status || '';
            const orderStatus = item.order?.order_status || '';
            return (
              <div key={item.id || idx} className="bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-5 flex gap-4 shadow-xl shadow-neutral-gray-100/10 hover:shadow-2xl hover:shadow-neutral-gray-100/20 hover:border-primary-200/60 transition-all duration-300 items-center">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-neutral-gray-100 shrink-0 bg-neutral-gray-50 flex items-center justify-center">
                  <ProductThumb product={product} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <h6 className="font-bold text-neutral-gray-900 text-xs line-clamp-1 leading-snug">{product.name || 'Product'}</h6>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold capitalize border ${orderStatusClasses(orderStatus)}`}>{orderStatus}</span>
                  </div>
                  <div className="text-[11px] font-bold text-neutral-gray-500">
                    Qty: {item.qty} · <strong className="text-neutral-gray-800">৳{formatAmount(item.price)}</strong>
                  </div>
                  <div className="mt-1 text-[10px] font-bold text-neutral-gray-400 flex flex-wrap items-center gap-2">
                    <span>Delivery Status: <span className="text-primary-600 capitalize">{deliveryStatus}</span></span>
                    {item.order?.created_at && <span>· {formatOrderDate(item.order.created_at)}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!result && !loading && !error && (
        <div className="text-center text-neutral-gray-400 text-xs font-semibold py-12 bg-neutral-gray-50/20 border border-dashed border-neutral-gray-200 rounded-3xl">
          Enter your order details above to trace shipment details and live status alerts.
        </div>
      )}
    </div>
  );
}
