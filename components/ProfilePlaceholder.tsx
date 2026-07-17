'use client';

import React from 'react';
import { NAV_ITEMS } from '@/components/ProfileSidebar';
import { usePathname } from 'next/navigation';

export default function ProfilePlaceholder() {
  const pathname = usePathname();
  const key = pathname.split('/').filter(Boolean).pop() || 'profile';
  const item = NAV_ITEMS.find((n) => n.key === key);
  const Icon = item?.icon;

  return (
    <div className="bg-neutral-white border border-neutral-gray-200 rounded-xl p-10 text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 mb-4">
        {Icon ? <Icon size={22} /> : null}
      </div>
      <h2 className="text-lg font-bold text-neutral-gray-900 mb-2">{item?.label}</h2>
      <p className="text-sm text-neutral-gray-600">This section is not yet implemented.</p>
    </div>
  );
}
