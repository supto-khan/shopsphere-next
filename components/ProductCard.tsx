'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { Plus, Minus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { cart, addToCart, updateQuantity } = useAppStore();
  const [isHovered, setIsHovered] = useState(false);

  const goToDetail = () => {
    if (product.slug) router.push(`/product/${product.slug}`);
  };

  // Retrieve current quantity from Zustand cart
  const cartItem = cart.find((item) => item.product.id === product.id);
  const qty = cartItem ? cartItem.quantity : 0;

  // Calculate discount price
  const price = product.unit_price;
  const discount = product.discount || 0;
  const hasDiscount = discount > 0;
  const finalPrice = product.discount_type === 'amount'
    ? Math.max(0, price - discount)
    : Math.max(0, price - (price * discount) / 100);

  // Resolve image source
  let imageSrc = '';
  const fullUrlObj = (product as any).thumbnail_full_url;
  if (fullUrlObj && fullUrlObj.path && !fullUrlObj.path.includes('def.png')) {
    // Replace absolute host (e.g. http://localhost) with relative path to route through Next.js proxy
    const cleanPath = fullUrlObj.path.replace(/^https?:\/\/[^\/]+/, '');
    imageSrc = cleanPath.replace('storage/app/public', 'storage');
  } else if (product.thumbnail && !product.thumbnail.includes('def.png')) {
    imageSrc = `/storage/product/thumbnail/${product.thumbnail}`;
  } else {
    imageSrc = '/placeholder.jpg';
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-neutral-white border border-neutral-gray-200/50 rounded-sm flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-neutral-gray-100/35 hover:-translate-y-1 select-none group shadow-sm h-full"
    >
      {/* Product Image & Hover Action Overlay (Takes full top width) */}
      <div className="w-full aspect-[4/3] relative flex items-center justify-center bg-neutral-gray-55/30 overflow-hidden">
        {hasDiscount && (
          <span className="absolute top-3.5 left-3.5 z-10 bg-primary-600 text-neutral-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-xl shadow-sm">
            {product.discount_type === 'percent' ? `-${Math.round(discount)}%` : `-৳${discount}`}
          </span>
        )}

        {imageSrc ? (
          <img
            src={imageSrc}
            alt={product.name || 'Product'}
            onClick={goToDetail}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350 cursor-pointer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '';
            }}
          />
        ) : (
          <div
            onClick={goToDetail}
            className="flex flex-col items-center justify-center text-neutral-gray-600 cursor-pointer w-full h-full"
          >
            <span className="text-2xl font-extrabold uppercase tracking-widest text-primary-200">
              {(product.name || 'Product').slice(0, 2)}
            </span>
            <span className="text-[9px] uppercase font-extrabold text-neutral-400 mt-1">
              No Image
            </span>
          </div>
        )}

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

      {/* Product Details (with padding) */}
      <div className="p-3 flex flex-col items-center text-center flex-1">
        {/* Pricing Row */}
        <div className="flex items-baseline space-x-1 mb-1 justify-center">
          <span className={`text-sm font-extrabold ${hasDiscount ? 'text-red-600' : 'text-neutral-900'}`}>৳{finalPrice}</span>
          {hasDiscount && (
            <span className="text-[9px] text-neutral-400 line-through font-bold">৳{price}</span>
          )}
        </div>

        {/* Title */}
        <h5
          onClick={goToDetail}
          className="text-sm font-bold text-neutral-800 line-clamp-2 min-h-[36px] mb-2 px-1 cursor-pointer hover:text-primary-600 transition-colors leading-relaxed"
        >
          {product.name}
        </h5>
      </div>
    </div>
  );
}
