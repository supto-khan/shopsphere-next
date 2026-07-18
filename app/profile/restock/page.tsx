'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ProductThumb, resolveProductImage } from '@/lib/profile-utils';
import StarRating from '@/components/StarRating';
import { RestockSkeleton } from '@/components/profile-skeletons';
import { Loader2, Trash2, ShoppingBag } from 'lucide-react';

function formatAmount(amount?: number | string): string {
  const n = Number(amount || 0);
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Mirror the Blade logic: pick the variation price when a variant is set.
function resolveVariantPrice(product: any, variant?: string): number {
  const base = Number(product?.unit_price || 0);
  if (!variant) return base;
  try {
    const list = typeof product?.variation === 'string' ? JSON.parse(product.variation) : product?.variation;
    if (Array.isArray(list)) {
      const match = list.find((v: any) => v?.type === variant);
      if (match?.price != null) return Number(match.price);
    }
  } catch { /* ignore */ }
  return base;
}

export default function RestockPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const load = async () => {
    try {
      const data = await api.getRestockRequests({ limit: 10, offset: 0 });
      setItems(data?.data || []);
    } catch (err) {
      console.error('Failed to load restock requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeOne = async (id: number) => {
    setBusy(true);
    try {
      await api.deleteRestockRequest({ id });
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch (err) {
      console.error('Failed to delete restock request', err);
    } finally {
      setBusy(false);
    }
  };

  const clearAll = async () => {
    setBusy(true);
    try {
      await api.deleteRestockRequest({ type: 'all' });
      setItems([]);
      setConfirmClear(false);
    } catch (err) {
      console.error('Failed to clear restock requests', err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 border-b border-neutral-gray-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
            <ShoppingBag size={16} />
          </div>
          <h2 className="text-sm font-extrabold text-neutral-gray-900 tracking-tight">Restock Notifications</h2>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => setConfirmClear(true)}
            disabled={busy}
            className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {loading ? (
        <RestockSkeleton />
      ) : items.length === 0 ? (
        <div className="bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-12 text-center shadow-xl shadow-neutral-gray-100/10 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-4 border border-primary-100">
            <ShoppingBag size={20} />
          </div>
          <h2 className="text-sm font-extrabold text-neutral-gray-900 mb-1.5">No Restock Requests</h2>
          <p className="text-xs text-neutral-500">You haven't requested to be notified when any products return to stock.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {items.map((req) => {
            const product = req.product || {};
            const rating = Array.isArray(product?.rating) ? product.rating.length : 0;
            const discount = Number(product?.discount ?? 0);
            const price = resolveVariantPrice(product, req.variant);
            const productHref = product?.slug ? `/product/${product.slug}` : '#';

            // Resolve image
            const imageSrc = resolveProductImage(product) || '/placeholder.webp';

            return (
              <div
                key={req.id}
                className="bg-neutral-white border border-neutral-gray-200/60 rounded-2xl p-4 flex flex-col items-center text-center relative transition-all duration-300 hover:shadow-xl hover:border-primary-200 group shadow-lg shadow-neutral-gray-100/10"
              >
                {/* Image Wrapper */}
                <div className="w-32 h-32 relative mb-3.5 flex items-center justify-center bg-neutral-gray-50/50 rounded-xl overflow-hidden border border-neutral-gray-50/30">
                  <a href={productHref} className="w-full h-full flex items-center justify-center">
                    <img
                      src={imageSrc}
                      alt={product.name || 'Product'}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                    />
                  </a>

                  {/* Remove Button Overlay */}
                  <button
                    onClick={() => removeOne(req.id)}
                    disabled={busy}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center shadow shadow-red-100/40 cursor-pointer active:scale-90 transition-all z-10 disabled:opacity-50"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                {/* Title & Brand */}
                <div className="flex flex-col gap-1 w-full text-center flex-1">
                  <a
                    href={productHref}
                    className="text-xs font-bold text-neutral-gray-900 line-clamp-2 hover:text-primary-600 transition-colors leading-relaxed min-h-[32px]"
                  >
                    {product?.name || 'Product Name'}
                  </a>

                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <StarRating rating={rating} />
                  </div>

                  <div className="text-[10px] font-semibold text-neutral-gray-500 mt-0.5">
                    {req.variant ? (
                      <span>Variant: <span className="text-neutral-gray-900 font-bold">{req.variant}</span></span>
                    ) : product?.brand?.name ? (
                      <span>Brand: <span className="text-neutral-gray-900 font-bold">{product.brand.name}</span></span>
                    ) : null}
                  </div>
                </div>

                {/* Price tag */}
                <div className="mt-3 flex items-center justify-center gap-2 w-full pt-2.5 border-t border-neutral-gray-100">
                  {discount > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-600 text-[10px] font-extrabold border border-red-100 shrink-0">
                      -{discount}%
                    </span>
                  )}
                  <span className="font-extrabold text-neutral-gray-900 text-sm tracking-tight">৳{formatAmount(price)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-black/40 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setConfirmClear(false)}>
          <div className="bg-neutral-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-neutral-gray-200/30" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-extrabold text-neutral-gray-900 mb-2 tracking-tight">Clear all requests?</h3>
            <p className="text-xs font-semibold text-neutral-500 leading-relaxed mb-6">This will remove all stock alert requests from your account history.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmClear(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={clearAll}
                disabled={busy}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-danger hover:bg-red-800 text-neutral-white disabled:opacity-60 cursor-pointer shadow-md shadow-red-600/10 active:scale-95"
              >
                {busy ? <Loader2 size={12} className="animate-spin inline" /> : 'Clear All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
