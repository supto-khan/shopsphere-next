'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import StarRating from '@/components/StarRating';
import { resolveProductImage } from '@/lib/profile-utils';
import { WishlistSkeleton } from '@/components/profile-skeletons';
import { Heart, Loader2, Plus, Minus } from 'lucide-react';
import { useAppStore } from '@/lib/store';

function formatAmount(amount?: number | string): string {
  const n = Number(amount || 0);
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const { cart, addToCart, updateQuantity } = useAppStore();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = () => {
    api.getWishlist()
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleRemove = (productId: number) => {
    setRemovingId(productId);
    api.removeFromWishlist(productId)
      .then(() => {
        setItems((prev) => prev.filter((w) => w.product_id !== productId));
      })
      .catch(console.error)
      .finally(() => setRemovingId(null));
  };

  if (loading) {
    return <WishlistSkeleton />;
  }

  return (
    <div className="bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-5 md:p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-base font-extrabold text-neutral-gray-900 uppercase tracking-wider mb-1">My Wishlist</h2>
        <p className="text-[10px] font-bold text-neutral-gray-400 uppercase tracking-widest">
          {items.length} {items.length === 1 ? 'item' : 'items'} saved
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-gray-100 flex items-center justify-center mb-4 text-neutral-gray-400">
            <Heart size={28} />
          </div>
          <h3 className="text-sm font-bold text-neutral-gray-800 mb-1">Your wishlist is empty</h3>
          <p className="text-xs text-neutral-gray-500 max-w-[240px] leading-normal">
            Save items here to keep track of products you want to buy.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {items.map((w) => {
            const product = w.productFullInfo || {};
            const rating = Number(product?.rating?.average ?? 0);
            const reviewCount = Number(product?.reviews_count ?? product?.rating?.count ?? 0);
            const discount = Number(product?.discount ?? 0);
            const price = Number(product?.unit_price ?? 0);
            const discounted = Number(product?.discounted_unit_price ?? price);
            const productHref = product?.slug ? `/product/${product.slug}` : '#';

            // Resolve thumbnail image
            const imageSrc = resolveProductImage(product) || '/placeholder.jpg';

            const cartItem = cart.find((item) => item.product.id === product.id);
            const qty = cartItem ? cartItem.quantity : 0;
            const isHovered = hoveredId === w.id;

            return (
              <div
                key={w.id}
                onMouseEnter={() => setHoveredId(w.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="bg-neutral-white border border-neutral-gray-200/50 flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-neutral-gray-100/35 hover:-translate-y-1 select-none group shadow-sm"
              >
                {/* Image Wrapper */}
                <div className="w-full aspect-[4/3] relative flex items-center justify-center bg-neutral-gray-55/30 border-b border-neutral-gray-100/60 overflow-hidden">
                  <a href={productHref} className="w-full h-full flex items-center justify-center">
                    <img
                      src={imageSrc}
                      alt={product.name || 'Product'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350 cursor-pointer"
                    />
                  </a>

                  {/* Remove Button Overlay */}
                  <button
                    onClick={() => handleRemove(w.product_id)}
                    disabled={removingId === w.product_id}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-neutral-white hover:bg-neutral-gray-50 text-red-500 flex items-center justify-center shadow-md cursor-pointer active:scale-95 transition-all z-10 disabled:opacity-50 border border-neutral-gray-150/40"
                  >
                    {removingId === w.product_id ? <Loader2 size={12} className="animate-spin" /> : <Heart size={14} className="fill-red-500 text-red-500" />}
                  </button>

                  {/* Discount tag */}
                  {discount > 0 && (
                    <span className="absolute top-2.5 left-2.5 z-10 bg-primary-600 text-neutral-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-xl shadow-sm">
                      -{discount}%
                    </span>
                  )}

                  {/* Quantities Controller overlay */}
                  <div className="absolute right-3.5 bottom-3.5 z-10">
                    <div className={`flex items-center rounded-xl shadow-lg border text-[10px] font-extrabold transition-all duration-300 overflow-hidden h-8 ${
                      qty === 0
                        ? 'w-8 justify-center bg-primary-600 border-primary-700 text-neutral-white'
                        : isHovered
                          ? 'w-24 px-2 justify-between bg-primary-600 border-primary-700 text-neutral-white'
                          : 'w-8 justify-center bg-secondary-600 border-secondary-700 text-neutral-white'
                    }`}>
                      <button
                        type="button"
                        onClick={() => qty > 0 && updateQuantity(product.id, qty - 1)}
                        className={`w-5 h-5 rounded-lg bg-neutral-white/25 hover:bg-neutral-white/40 flex items-center justify-center transition-all duration-300 cursor-pointer shrink-0 ${
                          qty > 0 && isHovered
                            ? 'w-5 opacity-100 scale-100'
                            : 'w-0 opacity-0 pointer-events-none scale-50'
                        }`}
                      >
                        <Minus size={10} className="stroke-[2.5px]" />
                      </button>

                      <span className={`transition-all duration-300 text-center select-none ${
                        qty === 0
                          ? 'w-0 opacity-0 scale-50 overflow-hidden'
                          : isHovered
                            ? 'w-8 opacity-100 scale-100'
                            : 'absolute inset-0 w-8 h-8 flex items-center justify-center opacity-100 scale-110 text-xs font-black'
                      }`}>
                        {qty}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          if (qty === 0) {
                            addToCart(product);
                          } else {
                            updateQuantity(product.id, qty + 1);
                          }
                        }}
                        className={`flex items-center justify-center transition-all cursor-pointer shrink-0 duration-300 ${
                          qty === 0
                            ? 'absolute inset-0 w-8 h-8 rounded-xl bg-transparent hover:bg-primary-800 scale-100 opacity-100'
                            : isHovered
                              ? 'relative w-5 h-5 rounded-lg bg-neutral-white/25 hover:bg-neutral-white/40 scale-100 opacity-100'
                              : 'w-0 opacity-0 pointer-events-none scale-50 absolute'
                        }`}
                      >
                        <Plus size={qty === 0 ? 16 : 10} className="stroke-[2.5px]" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Product details */}
                <div className="p-3 flex flex-col items-center text-center flex-1">
                  {/* Pricing Row */}
                  <div className="flex items-baseline space-x-1 mb-1 justify-center">
                    <span className={`text-xs font-extrabold ${discount > 0 ? 'text-red-600' : 'text-neutral-900'}`}>৳{formatAmount(discounted)}</span>
                    {discount > 0 && discounted !== price && (
                      <span className="text-[9px] text-neutral-400 line-through font-bold">৳{formatAmount(price)}</span>
                    )}
                  </div>

                  {/* Title */}
                  <a
                    href={productHref}
                    className="text-xs font-bold text-neutral-800 line-clamp-2 hover:text-primary-600 transition-colors leading-relaxed min-h-[36px] px-1 mb-2"
                  >
                    {product?.name || 'Product Name'}
                  </a>

                  <div className="flex items-center justify-center gap-1 mt-auto">
                    <StarRating rating={rating} />
                    {reviewCount > 0 && <span className="text-[10px] font-bold text-neutral-400">({reviewCount})</span>}
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
