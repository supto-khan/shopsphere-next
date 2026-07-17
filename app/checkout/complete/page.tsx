'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Footer from '@/components/Footer';
import { CheckCircle, ShoppingBag, Eye, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function CompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderIds = searchParams.get('order_ids') || '';

  return (
    <div className="w-full min-h-screen bg-neutral-gray-50 flex flex-col justify-between">
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-10 flex-1 flex flex-col items-center justify-center">
        {/* Progress indicators */}
        <div className="flex items-center justify-between w-full max-w-xl mx-auto mb-16 text-xs sm:text-sm font-bold text-neutral-gray-500">
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
            <div className="w-6 h-6 rounded-full bg-primary-50 flex items-center justify-center border border-primary-200">3</div>
            <span>Payment</span>
          </div>
          <ChevronRight size={14} />
          <div className="flex items-center gap-1.5 text-primary-600">
            <div className="w-6 h-6 rounded-full bg-primary-600 text-neutral-white flex items-center justify-center">4</div>
            <span>Complete</span>
          </div>
        </div>

        {/* Success Card */}
        <div className="max-w-md w-full bg-neutral-white border border-neutral-gray-200/60 rounded-3xl p-8 text-center shadow-lg shadow-neutral-gray-100 flex flex-col items-center justify-center gap-5">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-2">
            <CheckCircle size={40} strokeWidth={2} className="animate-scale-up" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-extrabold text-neutral-gray-900 tracking-tight">Order Placed Successfully!</h1>
            <p className="text-xs text-neutral-gray-500 font-semibold leading-relaxed">
              Thank you for shopping with us! Your order has been placed and is currently being processed.
            </p>
          </div>

          {orderIds && (
            <div className="p-4 bg-neutral-50 border border-neutral-gray-200/50 rounded-2xl w-full">
              <span className="block text-[10px] uppercase font-extrabold text-neutral-gray-400 mb-1">Your Order ID</span>
              <span className="text-sm font-extrabold text-primary-600 tracking-wide select-all">
                #{orderIds}
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
            {orderIds && (
              <Link
                href={`/track-order?order_id=${orderIds.split(',')[0]}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-neutral-50 hover:bg-neutral-100 text-neutral-gray-800 border border-neutral-gray-200 rounded-xl text-xs font-bold transition-all duration-200 active:scale-98 cursor-pointer"
              >
                <Eye size={14} />
                <span>Track Order</span>
              </Link>
            )}
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-800 text-neutral-white rounded-xl text-xs font-bold shadow-md shadow-primary-600/10 transition-all duration-200 active:scale-98 cursor-pointer"
            >
              <ShoppingBag size={14} />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
