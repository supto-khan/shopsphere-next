'use client';

import React, { Suspense, useEffect, useState } from 'react';
import OrderSubShell from '@/components/OrderSubShell';
import StarRating from '@/components/StarRating';
import ChatModal from '@/components/ChatModal';
import { api } from '@/lib/api';
import { resolveStorageImage, titleCase } from '@/lib/order-utils';
import { VendorInfoSkeleton } from '@/components/profile-skeletons';
import { Loader2, Store } from 'lucide-react';

function ShopLogo({ shop, className = '' }: { shop?: any; className?: string }) {
  const src = resolveStorageImage(shop?.image_full_url);
  const [errored, setErrored] = useState(false);
  if (!src || errored) {
    return (
      <div className={`w-full h-full flex items-center justify-center text-primary-600 bg-primary-50 ${className}`}>
        <Store size={28} />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={shop?.name || 'shop'} className={`w-full h-full object-cover ${className}`} onError={() => setErrored(true)} />;
}

function VendorInfoInner() {
  return (
    <OrderSubShell activeTab="vendor">
      {({ order, items }) => <VendorCard order={order} items={items} />}
    </OrderSubShell>
  );
}

function VendorCard({ order, items }: { order: any; items: any[] }) {
  const isSeller = order?.seller_is === 'seller';
  const shop = items?.[0]?.seller?.shop || order?.seller?.shop || null;
  const sellerId = isSeller && items?.[0]?.seller?.id ? Number(items[0].seller.id) : 0;

  const [sellerInfo, setSellerInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const slug = shop?.slug;
    if (!slug) return;
    let active = true;
    setLoading(true);
    api.getSellerInfo(slug)
      .then((data) => { if (active) setSellerInfo(data); })
      .catch((err) => console.error('Failed to load seller info', err))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [shop?.slug]);

  const shopName = shop?.name || (isSeller ? 'Vendor' : 'In-house Shop');
  const closed = shop?.temporary_close === 1 || shop?.vacation_status === 1;

  return (
    <div className="mt-3">
      <div className="bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-6 shadow-xl shadow-neutral-gray-100/10 hover:shadow-2xl hover:shadow-neutral-gray-100/20 transition-all duration-300">
        <div className="flex flex-wrap items-start gap-5">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border border-neutral-gray-200 shrink-0 relative bg-neutral-gray-50 shadow-sm">
            <ShopLogo shop={shop} />
            {closed && (
              <span className="absolute inset-x-0 bottom-0 bg-red-600/90 text-neutral-white text-[9px] font-bold text-center py-0.5 uppercase tracking-wide">
                Closed
              </span>
            )}
          </div>

          <div className="flex-1 min-w-[200px]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h6 className="text-sm font-extrabold text-neutral-gray-900 capitalize mb-1">{shopName}</h6>
                {loading ? (
                  <VendorInfoSkeleton />
                ) : (
                  <>
                    <div className="flex items-center gap-1">
                      <StarRating rating={sellerInfo?.avg_rating || 0} />
                      {sellerInfo?.avg_rating > 0 && <span className="text-[10px] font-extrabold text-neutral-gray-400">({Number(sellerInfo?.avg_rating).toFixed(1)})</span>}
                    </div>
                    <div className="text-[10px] font-bold text-neutral-gray-500 mt-1">
                      {(sellerInfo?.total_review ?? 0)} reviews
                      {typeof sellerInfo?.total_product === 'number' && <> · {sellerInfo.total_product} products</>}
                    </div>
                  </>
                )}
              </div>

              <ChatModal
                type="seller"
                id={sellerId}
                title={shopName}
                subtitle={isSeller ? 'Vendor' : 'In-house Shop'}
                triggerLabel="Chat with vendor"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-[10px] font-extrabold text-neutral-400 uppercase tracking-wide flex items-center gap-2">
        <span>{isSeller ? 'Sold by vendor' : 'Sold by in-house shop'}</span>
        <span>·</span>
        <span>Order type: {titleCase(order?.order_type)}</span>
      </div>
    </div>
  );
}

export default function VendorInfoPage() {
  return (
    <Suspense fallback={<main className="flex-1 min-w-0 p-6 flex items-center justify-center"><Loader2 className="animate-spin text-primary-600" size={28} /></main>}>
      <VendorInfoInner />
    </Suspense>
  );
}
