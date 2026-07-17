'use client';

import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { SearchPageContent } from '@/app/search/page';
import Footer from '@/components/Footer';

export default function DiscountedProductsPage() {
  return (
    <div className="w-full min-h-[calc(100vh-65px)] overflow-y-auto bg-neutral-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="animate-spin text-primary-600 mb-3" size={24} />
            <p className="text-sm text-neutral-gray-600">Loading discounted products...</p>
          </div>
        }>
          <SearchPageContent defaultDataFrom="discounted_products" />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
