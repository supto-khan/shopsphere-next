'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, Order } from '@/lib/api';
import { Loader2, ShoppingBag, FileText, Download } from 'lucide-react';
import { ProductThumb, formatAmount, formatOrderDate, orderStatusClasses } from '@/lib/profile-utils';
import { OrdersListSkeleton } from '@/components/profile-skeletons';

export default function OrdersListPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setOrdersLoading(true);
    (async () => {
      try {
        const data = await api.getMyOrders({ limit: 10, offset: 0 });
        if (active) setOrders(data.orders || []);
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        if (active) setOrdersLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const downloadInvoice = async (orderId: number) => {
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
    }
  };

  const viewDetails = (orderId: number) => {
    router.push(`/profile/orders/${orderId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 border-b border-neutral-gray-100 pb-4">
        <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
          <ShoppingBag size={16} />
        </div>
        <h2 className="text-sm font-extrabold text-neutral-gray-900 tracking-tight">My Purchase History</h2>
      </div>

      {ordersLoading ? (
        <OrdersListSkeleton />
      ) : orders.length === 0 ? (
        <div className="bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-12 text-center text-neutral-gray-500 shadow-xl shadow-neutral-gray-100/10">
          No orders found.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const totalQty = (order.details || []).reduce((s, d) => s + (Number(d.qty) || 0), 0);
            const thumbs = (order.details || []).slice(0, 3);
            return (
              <div key={order.id} className="bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative shadow-xl shadow-neutral-gray-100/15 hover:shadow-2xl hover:shadow-neutral-gray-100/30 transition-all duration-300">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 bg-neutral-gray-50 border border-neutral-gray-100 flex items-center justify-center">
                    <ProductThumb product={thumbs[0]?.product_details || thumbs[0]?.product} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-neutral-gray-900 text-sm tracking-tight">Order #{order.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold capitalize border ${orderStatusClasses(order.order_status)}`}>
                        {order.order_status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-neutral-gray-500 mt-1">
                      {formatOrderDate(order.created_at)} · {totalQty} item{totalQty === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3.5 w-full sm:w-auto border-t sm:border-t-0 border-neutral-gray-100 pt-3 sm:pt-0 shrink-0">
                  <div className="text-left sm:text-right pr-2">
                    <p className="font-extrabold text-neutral-gray-900 text-sm tracking-tight">{formatAmount(order.order_amount)}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => viewDetails(order.id)} 
                      title="View Details"
                      className="p-2 rounded-xl text-neutral-gray-600 hover:text-primary-600 hover:bg-primary-50/50 border border-neutral-gray-150 hover:border-primary-200/50 active:scale-95 transition-all cursor-pointer"
                    >
                      <FileText size={16} />
                    </button>
                    <button 
                      onClick={() => downloadInvoice(order.id)} 
                      title="Download Invoice"
                      className="p-2 rounded-xl text-neutral-gray-600 hover:text-primary-600 hover:bg-primary-50/50 border border-neutral-gray-150 hover:border-primary-200/50 active:scale-95 transition-all cursor-pointer"
                    >
                      <Download size={16} />
                    </button>
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
