'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';
import OrderDetailsNav, { OrderDetailsTab } from '@/components/OrderDetailsNav';
import { OrderDetailSkeleton } from '@/components/profile-skeletons';
import { orderStatusClasses, orderStatusLabel, formatOrderDateTime, titleCase } from '@/lib/order-utils';
import { Loader2, User, ShoppingBag, Download, ArrowLeft } from 'lucide-react';

export interface OrderShellContext {
  order: any;
  items: any[];
  orderId: number;
  reload: () => Promise<void>;
}

interface OrderSubShellProps {
  activeTab: OrderDetailsTab;
  children: (ctx: OrderShellContext) => React.ReactNode;
}

// Shared layout for every order detail sub-page: sidebar, back button, download
// invoice, order header (# / Edited / status / date) and the tab navbar.
export default function OrderSubShell({ activeTab, children }: OrderSubShellProps) {
  const { isLoggedIn, setLoginOpen } = useAppStore();
  const router = useRouter();
  const params = useParams();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const orderId = Number(rawId);

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getOrderDetails(orderId);
      const list: any[] = Array.isArray(data) ? data : (data?.details || []);
      setItems(list);
      const base = list[0]?.order || null;
      // Attach details so downstream helpers (nav visibility etc.) can inspect them.
      setOrder(base ? { ...base, details: list } : null);
      setNotFound(!list.length);
    } catch (err) {
      console.error('Failed to load order details', err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!isLoggedIn || !orderId) return;
    reload();
  }, [isLoggedIn, orderId, reload]);

  const downloadInvoice = async () => {
    if (!orderId) return;
    setDownloading(true);
    try {
      const bytes = await api.getOrderInvoice(orderId);
      const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Invoice download failed', err);
      alert('Failed to download invoice');
    } finally {
      setDownloading(false);
    }
  };

  const centered = (node: React.ReactNode) => (
    <main className="flex-1 min-w-0 p-6 flex items-center justify-center">{node}</main>
  );

  if (!isLoggedIn) {
    return centered(
      <div className="text-center bg-neutral-white border border-neutral-gray-200 rounded-xl p-10 max-w-md">
        <User size={40} className="mx-auto text-neutral-gray-600 mb-4" />
        <h2 className="text-lg font-bold text-neutral-gray-900 mb-2">Please log in</h2>
        <p className="text-sm text-neutral-gray-600 mb-6">You need to be logged in to view this order.</p>
        <button onClick={() => setLoginOpen(true)} className="px-5 py-2.5 bg-primary-600 hover:bg-primary-800 text-neutral-white rounded-lg text-sm font-semibold shadow-lg shadow-primary-600/10 transition-all active:scale-[0.98]">Login</button>
      </div>
    );
  }

  if (loading) {
    return <OrderDetailSkeleton />;
  }

  if (notFound || !order) {
    return centered(
      <div className="text-center bg-neutral-white border border-neutral-gray-200 rounded-xl p-10 max-w-md">
        <ShoppingBag size={40} className="mx-auto text-neutral-gray-600 mb-4" />
        <h2 className="text-lg font-bold text-neutral-gray-900 mb-2">Order not found</h2>
        <p className="text-sm text-neutral-gray-600 mb-6">We couldn&apos;t find the order you&apos;re looking for.</p>
        <button onClick={() => router.push('/profile?tab=orders')} className="px-5 py-2.5 bg-primary-600 hover:bg-primary-800 text-neutral-white rounded-lg text-sm font-semibold shadow-lg shadow-primary-600/10 transition-all active:scale-[0.98]">Back to my orders</button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex min-w-0">
      <main className="flex-1 min-w-0 p-6 bg-neutral-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => router.push('/profile?tab=orders')}
                  className="flex items-center gap-2 text-sm font-medium text-neutral-gray-600 hover:text-primary-600 transition-colors"
                >
                  <ArrowLeft size={18} />
                  Back to orders
                </button>
                <button
                  onClick={downloadInvoice}
                  disabled={downloading}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-800 text-neutral-white rounded-lg text-sm font-semibold shadow-lg shadow-primary-600/10 transition-all active:scale-[0.98] disabled:opacity-60"
                >
                  {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  <span>Download invoice</span>
                </button>
              </div>

              <div className="mb-4">
                <h1 className="text-xl font-bold text-neutral-gray-900 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="w-1.5 h-6 bg-primary-600 rounded" />
                  <span>Order #{order.id}</span>
                  {order.edited_status === 1 && (
                    <span className="text-sm font-medium text-neutral-gray-600">(Edited)</span>
                  )}
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${orderStatusClasses(order.order_status)}`}>
                    {orderStatusLabel(order.order_status)}
                  </span>
                </h1>
                {order.created_at && (
                  <div className="text-xs font-semibold text-neutral-gray-600 mt-2 ml-3.5">
                    {formatOrderDateTime(order.created_at)}
                  </div>
                )}
              </div>

              <OrderDetailsNav orderId={order.id} order={order} activeTab={activeTab} />

              {children({ order, items, orderId, reload })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export { titleCase };
