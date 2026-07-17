'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { UserCircle, ShoppingBag, BellRing, Heart, Inbox, MapPin, LifeBuoy, Ticket, Truck, User } from 'lucide-react';

export const NAV_ITEMS = [
  { key: 'profile', label: 'Profile Info', icon: UserCircle, href: '/profile' },
  { key: 'orders', label: 'My Orders', icon: ShoppingBag, href: '/profile/orders' },
  { key: 'restock', label: 'Restock Requests', icon: BellRing, href: '/profile/restock' },
  { key: 'wishlist', label: 'Wish List', icon: Heart, href: '/profile/wishlist' },
  { key: 'inbox', label: 'Inbox Messages', icon: Inbox, href: '/profile/inbox' },
  { key: 'address', label: 'My Addresses', icon: MapPin, href: '/profile/address' },
  { key: 'support', label: 'Support Tickets', icon: LifeBuoy, href: '/profile/support' },
  { key: 'coupons', label: 'My Coupons', icon: Ticket, href: '/profile/coupons' },
  { key: 'track', label: 'Track Order', icon: Truck, href: '/profile/track' },
];

export default function ProfileSidebar() {
  const pathname = usePathname();
  const { customerName, customerImage } = useAppStore();

  const isActive = (href: string) => (href === '/profile' ? pathname === '/profile' : pathname.startsWith(href));

  const isProfileRoot = pathname === '/profile';

  return (
    <aside className={`md:w-64 shrink-0 ${isProfileRoot ? 'space-y-5 w-full block' : 'hidden md:block md:space-y-5'}`}>
      {/* Premium Profile Card Header */}
      <div className="bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-5 flex flex-col items-center text-center shadow-xl shadow-neutral-gray-100/20">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary-200 bg-primary-50 flex items-center justify-center mb-3 ring-4 ring-primary-50">
          {customerImage ? (
            <img src={customerImage} alt="user avatar" className="w-full h-full object-cover" />
          ) : (
            <User size={24} className="text-primary-600" />
          )}
        </div>
        <h3 className="text-sm font-extrabold text-neutral-gray-900 tracking-tight truncate max-w-full">
          {customerName || 'Premium Account'}
        </h3>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 bg-primary-50 text-[10px] font-extrabold rounded-full text-primary-600 border border-primary-100 uppercase tracking-wide">
          Active Member
        </span>
      </div>

      {/* Navigation Card */}
      <nav className="bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-2.5 space-y-1 shadow-xl shadow-neutral-gray-100/20">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                active 
                  ? 'bg-primary-50 text-primary-600 border-l-2 border-primary-600 pl-3' 
                  : 'text-neutral-gray-600 hover:bg-neutral-gray-50'
              }`}
            >
              <Icon size={16} className={active ? 'text-primary-600' : 'text-neutral-gray-500'} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
