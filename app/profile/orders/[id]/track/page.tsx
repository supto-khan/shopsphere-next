'use client';

import React, { Suspense, useEffect, useState } from 'react';
import OrderSubShell, { OrderShellContext } from '@/components/OrderSubShell';
import { TrackHistorySkeleton } from '@/components/profile-skeletons';
import { api } from '@/lib/api';
import { Loader2, Package, CheckCircle2, PackageCheck, Truck, Home, XCircle, Check } from 'lucide-react';

const TERMINAL = ['order_canceled', 'order_returned', 'order_failed'];

const STATUS_ICON: Record<string, React.ElementType> = {
  order_placed: Package,
  order_confirmed: CheckCircle2,
  preparing_for_shipment: PackageCheck,
  order_is_on_the_way: Truck,
  order_delivered: Home,
  order_canceled: XCircle,
  order_returned: XCircle,
  order_failed: XCircle,
};

const TERMINAL_MESSAGE: Record<string, string> = {
  order_canceled: 'Order has been canceled',
  order_returned: 'Order has been returned',
  order_failed: 'Order processing failed',
};

function formatTrackDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  // h:i A, d M Y  (e.g. 03:45 PM, 05 Jul 2026)
  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
  const date = d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  return `${time}, ${date}`;
}

function TrackContent({ order, orderId }: OrderShellContext) {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<Record<string, any>>({});
  const [isDigital, setIsDigital] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.getOrderTrackHistory(orderId)
      .then((data) => {
        if (!active) return;
        setHistory(data?.history || {});
        setIsDigital(!!data?.is_digital_order);
      })
      .catch((err) => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [orderId]);

  const base = isDigital
    ? ['order_placed', 'order_confirmed', 'order_delivered']
    : ['order_placed', 'order_confirmed', 'preparing_for_shipment', 'order_is_on_the_way', 'order_delivered'];

  const activeTerminal = TERMINAL.find((k) => history[k]?.status) || null;
  const statusesToShow = [...base, ...(activeTerminal ? [activeTerminal] : [])];

  // Preserve the order the API returns the history in.
  const visible = Object.entries(history).filter(([key]) => statusesToShow.includes(key));

  const isPos = order?.order_type === 'POS' || order?.order_type === 'pos';

  return (
    <div className="mt-3">
      {/* Verification code / POS badge */}
      <div className="flex flex-wrap gap-3 mb-6">
        {order?.order_type === 'default_type' && order?.verification_code && (
          <div className="bg-neutral-white border border-neutral-gray-200/50 rounded-2xl py-2.5 px-4 text-xs font-bold text-neutral-600 shadow-sm flex items-center gap-2">
            <span>🔐 Order Verification Code:</span>
            <span className="text-primary-600 font-mono tracking-wider bg-primary-50 px-2 py-0.5 rounded border border-primary-100">{order.verification_code}</span>
          </div>
        )}
        {isPos && (
          <span className="bg-primary-50 border border-primary-100 text-primary-600 rounded-2xl py-2.5 px-4 text-xs font-bold shadow-sm uppercase tracking-wide">POS Order</span>
        )}
      </div>

      {loading ? (
        <TrackHistorySkeleton />
      ) : !visible.length ? (
        <div className="bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-10 text-center shadow-xl shadow-neutral-gray-100/10">
          <Package size={36} className="mx-auto text-neutral-400 mb-3" />
          <p className="text-xs font-semibold text-neutral-500">No tracking details available yet.</p>
        </div>
      ) : (
        <div className="bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-6 md:p-8 shadow-xl shadow-neutral-gray-100/10">
          <ol className="relative border-l-2 border-neutral-gray-150 ml-5 space-y-8">
            {visible.map(([key, data]) => {
              const Icon = STATUS_ICON[key] || Package;
              const isTerminal = TERMINAL.includes(key);
              const active = !!data?.status;
              return (
                <li key={key} className="relative ml-8">
                  <span className={`absolute -left-[45px] top-0 flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-300 ${
                    active 
                      ? (isTerminal ? 'bg-red-550 border-red-200 text-red-600 shadow-sm' : 'bg-primary-600 border-primary-700 text-neutral-white shadow-md shadow-primary-600/20 scale-110') 
                      : 'bg-neutral-gray-50 border-neutral-gray-200 text-neutral-gray-400'
                  }`}>
                    <Icon size={14} className={active && !isTerminal ? 'stroke-[2.5px]' : ''} />
                  </span>
                  <div className="flex items-start justify-between gap-3 pt-0.5">
                    <div className="space-y-1">
                      <div className={`text-xs font-extrabold capitalize transition-colors ${active ? 'text-neutral-gray-900' : 'text-neutral-gray-400'}`}>
                        {data?.label || key.replace(/_/g, ' ')}
                      </div>
                      {data?.date_time && (
                        <span className="block text-[10px] font-bold text-neutral-400">{formatTrackDate(data.date_time)}</span>
                      )}
                      {key === 'order_is_on_the_way' && active && !isDigital && (
                        <span className="block text-[10px] font-extrabold text-primary-500 animate-pulse">🚚 Out for delivery - our partner is heading your way!</span>
                      )}
                      {isTerminal && active && (
                        <span className="block text-[10px] font-bold text-red-500">{TERMINAL_MESSAGE[key]}</span>
                      )}
                    </div>
                    {active && !isTerminal && (
                      <span className="mt-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-green-100/70 border border-green-200 text-green-800">
                        <Check size={11} className="stroke-[3px]" />
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<main className="flex-1 min-w-0 p-6 flex items-center justify-center"><Loader2 className="animate-spin text-primary-600" size={28} /></main>}>
      <OrderSubShell activeTab="track">
        {(ctx) => <TrackContent {...ctx} />}
      </OrderSubShell>
    </Suspense>
  );
}
