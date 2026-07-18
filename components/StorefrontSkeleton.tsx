import React from 'react';

const ProductSkeleton = () => (
  <div className="bg-neutral-white border border-neutral-gray-200/60 rounded-xl p-4 flex flex-col items-center text-center relative animate-pulse">
    <div className="w-36 h-36 bg-neutral-gray-50/50 rounded-lg border border-neutral-gray-200 mb-3 flex items-center justify-center animate-pulse">
      <div className="w-20 h-20 bg-neutral-gray-200 rounded-md" />
    </div>
    <div className="h-5 bg-neutral-gray-200 rounded w-1/3 mb-2.5 animate-pulse" />
    <div className="w-full flex flex-col items-center space-y-1.5 mb-2.5 min-h-[40px]">
      <div className="h-3.5 bg-neutral-gray-200 rounded w-5/6 animate-pulse" />
      <div className="h-3.5 bg-neutral-gray-200 rounded w-2/3 animate-pulse" />
    </div>
    <div className="h-3 bg-neutral-gray-200 rounded w-1/4 mb-3.5 animate-pulse" />
    <div className="h-5 bg-neutral-gray-200/70 rounded w-16 mt-auto animate-pulse" />
  </div>
);

const BrandSkeleton = () => (
  <div className="border border-neutral-gray-200/60 rounded-xl p-4 flex flex-col items-center justify-center animate-pulse bg-neutral-white">
    <div className="w-16 h-16 rounded-full bg-neutral-gray-200 border border-neutral-gray-200 flex items-center justify-center mb-2 shrink-0 animate-pulse" />
    <div className="h-3.5 bg-neutral-gray-200 rounded w-12 animate-pulse" />
  </div>
);

export default function StorefrontSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto h-[calc(100vh-65px)] bg-neutral-white">
      <div className="flex min-w-0">
        {/* Sidebar Skeleton */}
        <aside className="bg-neutral-white border-b border-r border-neutral-gray-200/50 flex flex-col shrink-0 overflow-y-auto scrollbar-none py-4 w-64 hidden md:block">
          <div className="px-3 pb-4 border-b border-neutral-gray-100 space-y-3">
            <div className="h-9 bg-neutral-gray-200/20 rounded-xl animate-pulse w-full" />
            <div className="h-9 bg-neutral-gray-200/20 rounded-xl animate-pulse w-full" />
            <div className="h-9 bg-neutral-gray-200/20 rounded-xl animate-pulse w-full" />
          </div>
          <div className="flex-1 px-3 py-5">
            <div className="h-4 bg-neutral-gray-200/20 rounded w-24 mb-4 animate-pulse" />
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl">
                  <div className="h-4 bg-neutral-gray-200/20 rounded w-2/3 animate-pulse" />
                  <div className="h-3 bg-neutral-gray-200/20 rounded w-3 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <main className="flex-1 min-w-0 p-6 space-y-10">
          {/* Top Selling Products Skeleton */}
          <div className="bg-gradient-to-br from-primary-50/25 via-neutral-white to-neutral-white border border-neutral-gray-200/50 p-5 md:p-6 shadow-sm">
            <div className="h-4 bg-neutral-gray-55/30 rounded w-48 mb-5 animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          </div>

          {/* Brands Skeleton */}
          <div>
            <div className="h-4 bg-neutral-gray-55/30 rounded w-36 mb-5 animate-pulse" />
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
              {[...Array(7)].map((_, i) => (
                <BrandSkeleton key={i} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
