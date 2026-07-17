import React from 'react';

function Shimmer({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-neutral-gray-200 rounded ${className}`} />;
}

/* ---------------- Profile info ---------------- */
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-neutral-white border border-neutral-gray-200 rounded-xl p-6">
        <Shimmer className="h-5 w-40 mb-5" />
        <div className="flex items-center gap-4 mb-6">
          <Shimmer className="w-20 h-20 rounded-full" />
          <Shimmer className="h-3 w-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Shimmer className="h-3 w-24" />
              <Shimmer className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
        <Shimmer className="h-10 w-32 rounded-lg mt-4" />
      </div>
      <div className="bg-neutral-white border border-neutral-gray-200 rounded-xl p-6">
        <Shimmer className="h-5 w-40 mb-5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="space-y-2">
              <Shimmer className="h-3 w-24" />
              <Shimmer className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
        <Shimmer className="h-10 w-36 rounded-lg mt-4" />
      </div>
    </div>
  );
}

/* ---------------- Orders list ---------------- */
export function OrdersListSkeleton() {
  return (
    <div className="space-y-4">
      <Shimmer className="h-6 w-28" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-neutral-white border border-neutral-gray-200 rounded-xl p-4 flex items-center gap-4">
          <Shimmer className="w-12 h-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <Shimmer className="h-4 w-16" />
              <Shimmer className="h-4 w-20 rounded-full" />
            </div>
            <Shimmer className="h-3 w-32" />
          </div>
          <Shimmer className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

/* ---------------- Restock ---------------- */
export function RestockSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Shimmer className="h-6 w-36" />
        <Shimmer className="h-5 w-16" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border border-neutral-gray-200 rounded-xl p-3 flex gap-3">
            <Shimmer className="w-20 h-20 rounded-lg" />
            <div className="flex-1 space-y-2 py-1">
              <Shimmer className="h-4 w-3/4" />
              <Shimmer className="h-3 w-1/2" />
              <Shimmer className="h-3 w-2/3" />
              <Shimmer className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Wishlist ---------------- */
export function WishlistSkeleton() {
  return (
    <div className="space-y-4">
      <Shimmer className="h-6 w-28" />
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="border border-neutral-gray-200 rounded-xl p-3 flex gap-3">
            <Shimmer className="w-20 h-20 rounded-lg" />
            <div className="flex-1 space-y-2 py-1">
              <Shimmer className="h-4 w-3/4" />
              <Shimmer className="h-3 w-1/2" />
              <Shimmer className="h-3 w-2/3" />
              <Shimmer className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Inbox ---------------- */
export function InboxSkeleton() {
  return (
    <div className="flex flex-col h-[calc(100vh-65px-1.5rem)]">
      <div className="flex border-b border-neutral-gray-200 mb-3">
        <Shimmer className="h-8 w-20 mx-2" />
        <Shimmer className="h-8 w-28 mx-2" />
      </div>
      <div className="flex flex-1 min-h-0 border border-neutral-gray-200 rounded-xl overflow-hidden">
        <div className="w-full sm:w-80 shrink-0 border-r border-neutral-gray-200 p-3 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Shimmer className="w-11 h-11 rounded-full" />
              <div className="flex-1 space-y-2">
                <Shimmer className="h-3 w-2/3" />
                <Shimmer className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
        <div className="hidden sm:flex flex-1 flex-col">
          <div className="flex-1 space-y-3 p-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`flex ${i % 2 ? 'justify-end' : 'justify-start'}`}>
                <Shimmer className={`h-12 ${i % 2 ? 'w-1/3' : 'w-2/3'} rounded-xl`} />
              </div>
            ))}
          </div>
          <div className="border-t border-neutral-gray-200 p-3">
            <Shimmer className="h-11 w-full rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Address ---------------- */
export function AddressSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Shimmer className="h-6 w-28" />
        <Shimmer className="h-9 w-28 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border border-neutral-gray-200 rounded-xl p-4 space-y-2">
            <div className="flex justify-between">
              <Shimmer className="h-4 w-24" />
              <Shimmer className="h-4 w-8" />
            </div>
            {[0, 1, 2, 3, 4, 5].map((j) => (
              <Shimmer key={j} className="h-3 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Support ticket ---------------- */
export function SupportSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Shimmer className="h-6 w-36" />
        <Shimmer className="h-9 w-28 rounded-lg" />
      </div>
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="border border-neutral-gray-200 rounded-xl p-4 space-y-2">
            <Shimmer className="h-4 w-1/2" />
            <div className="flex gap-2">
              <Shimmer className="h-4 w-16 rounded-full" />
              <Shimmer className="h-4 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Coupons ---------------- */
export function CouponsSkeleton() {
  return (
    <div className="space-y-4">
      <Shimmer className="h-6 w-28" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex border border-neutral-gray-200 rounded-xl overflow-hidden">
            <div className="w-2/5 space-y-2 p-4">
              <Shimmer className="h-4 w-3/4" />
              <Shimmer className="h-3 w-1/2" />
            </div>
            <div className="w-3/5 p-4 space-y-2">
              <Shimmer className="h-7 w-24 rounded-lg" />
              <Shimmer className="h-3 w-full" />
              <Shimmer className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Track order ---------------- */
export function TrackSkeleton() {
  return (
    <div className="space-y-4">
      <Shimmer className="h-6 w-28" />
      <div className="bg-neutral-white border border-neutral-gray-200 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <Shimmer className="h-10 w-full rounded-lg" />
          <Shimmer className="h-10 w-full rounded-lg" />
          <Shimmer className="h-10 w-full rounded-lg" />
        </div>
      </div>
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="border border-neutral-gray-200 rounded-xl p-4 flex gap-3">
            <Shimmer className="w-16 h-16 rounded-lg" />
            <div className="flex-1 space-y-2 py-1">
              <Shimmer className="h-4 w-3/4" />
              <Shimmer className="h-3 w-1/2" />
              <Shimmer className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Track order results (guest) ---------------- */
export function TrackResultsSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="border border-neutral-gray-200 rounded-xl p-4 flex gap-3">
          <Shimmer className="w-16 h-16 rounded-lg" />
          <div className="flex-1 min-w-0 space-y-2 py-1">
            <Shimmer className="h-4 w-3/4" />
            <Shimmer className="h-3 w-1/2" />
            <Shimmer className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Chat messages (inbox panel) ---------------- */
export function ChatMessagesSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-primary-50/30">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={`flex ${i % 2 ? 'justify-end' : 'justify-start'}`}>
          <Shimmer className={`h-12 ${i % 2 ? 'w-1/3' : 'w-2/3'} rounded-xl`} />
        </div>
      ))}
    </div>
  );
}

/* ---------------- Support ticket conversation ---------------- */
export function TicketConversationSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-primary-50/20">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={`flex ${i % 3 === 0 ? 'justify-start' : 'justify-end'}`}>
          <Shimmer className={`h-16 ${i % 3 === 0 ? 'w-1/3' : 'w-1/2'} rounded-xl`} />
        </div>
      ))}
    </div>
  );
}

/* ---------------- Order track timeline ---------------- */
export function TrackHistorySkeleton() {
  return (
    <ol className="relative border-l-2 border-neutral-gray-200 ml-5">
      {[0, 1, 2, 3, 4].map((i) => (
        <li key={i} className="mb-8 last:mb-0 ml-6">
          <span className="absolute -left-[21px] flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-gray-50">
            <Shimmer className="w-5 h-5 rounded" />
          </span>
          <div className="space-y-2 pt-1.5">
            <Shimmer className="h-4 w-40" />
            <Shimmer className="h-3 w-24" />
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ---------------- Vendor info (seller rating) ---------------- */
export function VendorInfoSkeleton() {
  return (
    <div className="space-y-1.5">
      <Shimmer className="h-3 w-28" />
      <Shimmer className="h-3 w-20" />
    </div>
  );
}

/* ---------------- Order detail (summary) shell ---------------- */
export function OrderDetailSkeleton() {
  return (
    <div className="flex-1 flex min-w-0">
      <main className="flex-1 min-w-0 p-6 bg-neutral-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-60 shrink-0">
              <Shimmer className="h-64 w-full rounded-xl" />
            </div>
            <div className="flex-1 min-w-0 space-y-4">
              <div className="flex items-center justify-between">
                <Shimmer className="h-5 w-40" />
                <Shimmer className="h-9 w-36 rounded-lg" />
              </div>
              <Shimmer className="h-6 w-48" />
              <Shimmer className="h-10 w-full rounded-lg" />
              <div className="border border-neutral-gray-200 rounded-xl p-4 space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Shimmer className="w-12 h-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Shimmer className="h-3 w-1/2" />
                      <Shimmer className="h-3 w-1/3" />
                    </div>
                    <Shimmer className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
