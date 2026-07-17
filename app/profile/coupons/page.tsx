'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CouponsSkeleton } from '@/components/profile-skeletons';
import { Ticket as TicketIcon, Copy, Check } from 'lucide-react';

interface Coupon {
  id: number;
  code: string;
  coupon_type?: string;
  discount_type?: string;
  discount?: number | string;
  seller_id?: string | null;
  expire_date?: string;
  min_purchase?: number | string;
  seller?: { shop?: { name?: string; slug?: string } };
}

function formatAmount(amount?: number | string): string {
  const n = Number(amount || 0);
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api.getCoupons({ limit: 20, offset: 0 })
      .then((data) => { if (active) setCoupons(data?.coupons || []); })
      .catch((e) => console.error('Failed to load coupons', e))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const copy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 border-b border-neutral-gray-100 pb-4">
        <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
          <TicketIcon size={16} />
        </div>
        <h2 className="text-sm font-extrabold text-neutral-gray-900 tracking-tight">Active Coupons & Promos</h2>
      </div>

      {loading ? (
        <CouponsSkeleton />
      ) : coupons.length === 0 ? (
        <div className="bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-12 text-center shadow-xl shadow-neutral-gray-100/10 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-4 border border-primary-100"><TicketIcon size={20} /></div>
          <h2 className="text-sm font-extrabold text-neutral-gray-900 mb-1.5">No Coupons Available</h2>
          <p className="text-xs text-neutral-500">Check back later for exclusive deals and checkout discounts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {coupons.map((c) => {
            const isFree = c.coupon_type === 'free_delivery';
            const isPercent = c.discount_type === 'percentage';
            const shopName = c.seller_id === '0' || c.seller_id == null
              ? 'All Stores'
              : (c.seller?.shop?.name || 'Store');
            return (
              <div key={c.id} className="flex border border-neutral-gray-200/50 rounded-3xl overflow-hidden shadow-xl shadow-neutral-gray-100/10 hover:shadow-2xl hover:shadow-neutral-gray-100/20 transition-all duration-300 bg-neutral-white group h-32">
                {/* Left Face */}
                <div className="w-[38%] bg-primary-50/40 border-r-2 border-dashed border-primary-200/60 flex flex-col items-center justify-center p-3 text-center shrink-0">
                  <span className="text-xs font-extrabold text-primary-700 leading-tight uppercase">
                    {isFree ? 'Free Ship' : (isPercent ? `${c.discount}% OFF` : `৳${formatAmount(c.discount)}`)}
                  </span>
                  {!isFree && <span className="text-[9px] font-bold text-primary-600 mt-0.5">Discount</span>}
                  <span className="text-[9px] font-extrabold text-neutral-gray-600 mt-2 truncate max-w-full bg-neutral-white border border-neutral-gray-200/40 px-2 py-0.5 rounded-full">{shopName}</span>
                </div>
                {/* Right Face */}
                <div className="w-[62%] p-4 flex flex-col justify-center gap-1.5 min-w-0">
                  <button
                    onClick={() => copy(c.code)}
                    className="self-start inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-600 text-neutral-white text-xs font-extrabold hover:bg-primary-800 transition-all duration-300 shadow-md shadow-primary-600/10 cursor-pointer active:scale-95 group-hover:-translate-y-0.5"
                  >
                    {copied === c.code ? <Check size={12} strokeWidth={3.5} /> : <Copy size={12} />}
                    <span className="font-mono tracking-wider">{c.code}</span>
                  </button>
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    <p className="text-[10px] font-semibold text-neutral-gray-500">Min purchase: <strong className="text-neutral-gray-700">৳{formatAmount(c.min_purchase)}</strong></p>
                    <p className="text-[10px] font-semibold text-neutral-gray-500">Expires: {c.expire_date ? new Date(c.expire_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never'}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
