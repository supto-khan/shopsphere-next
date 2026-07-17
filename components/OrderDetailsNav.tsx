'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export type OrderDetailsTab = 'summary' | 'vendor' | 'delivery' | 'reviews' | 'track';

interface OrderDetailsNavProps {
  orderId: number;
  order: any;
  activeTab: OrderDetailsTab;
}

// Mirrors the tab menu in
// resources/themes/default/web-views/users-profile/account-details/partial.blade.php
// (Order summary / Vendor info / Delivery man info / Reviews / Track order).
export default function OrderDetailsNav({ orderId, order, activeTab }: OrderDetailsNavProps) {
  const router = useRouter();

  const isPos = order?.order_type === 'POS' || order?.order_type === 'pos';

  // Order is "only digital" when none of its items is a physical product.
  const isOrderOnlyDigital = React.useMemo(() => {
    const details: any[] = order?.details || [];
    if (!details.length) return true;
    return !details.some((detail) => {
      let product: any = detail?.product_details;
      if (typeof product === 'string') {
        try { product = JSON.parse(product); } catch { product = null; }
      }
      return product?.product_type === 'physical';
    });
  }, [order]);

  const tabs: { key: OrderDetailsTab; label: string; href: string; show: boolean }[] = [
    { key: 'summary', label: 'Order summary', href: `/profile/orders/${orderId}`, show: true },
    { key: 'vendor', label: 'Vendor info', href: `/profile/orders/${orderId}/vendor-info`, show: true },
    { key: 'delivery', label: 'Delivery man info', href: `/profile/orders/${orderId}/delivery-man-info`, show: !isPos && !isOrderOnlyDigital },
    { key: 'reviews', label: 'Reviews', href: `/profile/orders/${orderId}/reviews`, show: !isPos },
    { key: 'track', label: 'Track order', href: `/profile/orders/${orderId}/track`, show: !isPos },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 bg-neutral-gray-50 border border-neutral-gray-200/50 rounded-2xl mb-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {tabs.filter((t) => t.show).map((tab) => {
        const active = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            onClick={() => !active && router.push(tab.href)}
            className={`whitespace-nowrap px-4 py-2 text-xs font-bold capitalize transition-all duration-300 rounded-xl cursor-pointer ${
              active
                ? 'bg-neutral-white text-primary-600 shadow-sm border border-neutral-gray-200/40'
                : 'text-neutral-gray-500 hover:text-primary-600'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
