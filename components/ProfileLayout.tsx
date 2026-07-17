'use client';

import React, { Suspense } from 'react';
import { Loader2, User, ChevronLeft } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import ProfileSidebar from '@/components/ProfileSidebar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, setLoginOpen } = useAppStore();
  const pathname = usePathname();
  const isProfileRoot = pathname === '/profile';

  if (!isLoggedIn) {
    return (
      <main className="flex-1 min-w-0 p-6 flex items-center justify-center">
        <div className="text-center bg-neutral-white border border-neutral-gray-200 rounded-xl p-10 max-w-md">
          <User size={40} className="mx-auto text-neutral-gray-600 mb-4" />
          <h2 className="text-lg font-bold text-neutral-gray-900 mb-2">Please log in</h2>
          <p className="text-sm text-neutral-gray-600 mb-6">You need to be logged in to view this section.</p>
          <button onClick={() => setLoginOpen(true)} className="px-5 py-2.5 bg-primary-600 hover:bg-primary-800 text-neutral-white rounded-lg text-sm font-semibold shadow-lg shadow-primary-600/10 transition-all active:scale-[0.98]">Login</button>
        </div>
      </main>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto h-[calc(100vh-65px)] bg-neutral-white">
      <div className="flex min-w-0">

        {/* Profile Content Viewport */}
        <main className="flex-1 min-w-0 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6">
              <ProfileSidebar />
              <div className="flex-1 min-w-0">
                {!isProfileRoot && (
                  <Link
                    href="/profile"
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-primary-600 hover:text-primary-800 transition-colors mb-4 md:hidden"
                  >
                    <ChevronLeft size={14} />
                    <span>Back to Profile</span>
                  </Link>
                )}
                <Suspense fallback={<div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-primary-600" size={28} /></div>}>
                  {children}
                </Suspense>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
