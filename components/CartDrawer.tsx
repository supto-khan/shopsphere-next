'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { resolveImage } from '@/lib/image';
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    toggleCart,
    updateQuantity,
    removeFromCart,
    getCartSubtotal,
    getCartItemCount,
    siteConfig,
    isLoggedIn,
    setLoginOpen,
  } = useAppStore();
  const router = useRouter();

  const handleCheckout = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleCart();
    if (!isLoggedIn) {
      localStorage.setItem('post_login_redirect', '/checkout/shipping');
      setLoginOpen(true);
    } else {
      router.push('/checkout/shipping');
    }
  };

  const subtotal = getCartSubtotal();
  const itemCount = getCartItemCount();

  // Read config directly from the global store — no API call needed
  const config = siteConfig;

  const freeShippingStatus = config?.free_delivery_status === 1 || Number(config?.free_delivery_status) === 1;
  const shippingThreshold = Number(config?.free_delivery_over_amount) || 400;
  const isShippingFree = subtotal >= shippingThreshold;
  const progressPercent = Math.min(100, (subtotal / shippingThreshold) * 100);
  const remainingForFreeShipping = shippingThreshold - subtotal;

  return (
    <>
      {/* Floating Cart Button (Right side, matching Chaldal style) */}
      <button
        onClick={toggleCart}
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-primary-600 hover:bg-primary-800 text-neutral-white px-3 py-4 rounded-l-2xl shadow-2xl flex flex-col items-center space-y-1.5 border border-r-0 border-primary-800 cursor-pointer transition-all duration-300 active:scale-95 group ${
          isCartOpen ? 'opacity-0 translate-x-full pointer-events-none' : 'opacity-100 translate-x-0'
        }`}
      >
        <ShoppingBag className="group-hover:scale-110 transition-transform" size={20} />
        {/* We use a changing React key on the span to force a remount and trigger the CSS bounce animation on value increase */}
        <span key={`floating-count-${itemCount}`} className="text-[10px] font-bold uppercase tracking-wider block animate-number-bounce">
          {itemCount} items
        </span>
        <span key={`floating-subtotal-${subtotal}`} className="text-xs font-bold border-t border-neutral-white/20 pt-1 w-full text-center block animate-number-bounce">
          ৳{subtotal}
        </span>
      </button>

      {/* Cart Drawer Wrapper (Always mounted to sustain entry/exit slide animations) */}
      <div className={`fixed inset-0 z-50 flex justify-end transition-all duration-300 ${
        isCartOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}>
        {/* Backdrop (Fades in/out) */}
        <div
          onClick={toggleCart}
          className={`absolute inset-0 bg-neutral-gray-900/40 backdrop-blur-xs transition-opacity duration-300 ${
            isCartOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Drawer Panel (Slides in/out) */}
        <div className={`relative w-full max-w-md bg-neutral-white h-full shadow-[0_0_30px_rgba(0,0,0,0.15)] flex flex-col z-10 border-l border-neutral-gray-200/80 transition-transform duration-300 ease-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-gray-200/80 bg-neutral-gray-50/50">
            <div className="flex items-center space-x-2.5">
              <div className="relative">
                <ShoppingBag className="text-primary-600" size={22} />
                {itemCount > 0 && (
                  <span key={`header-count-${itemCount}`} className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary-600 text-neutral-white text-[8px] font-bold flex items-center justify-center animate-number-bounce">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="font-bold text-neutral-gray-900 text-lg">My Bag</span>
            </div>
            <button
              onClick={toggleCart}
              className="text-neutral-gray-600 hover:text-neutral-gray-900 p-1.5 rounded-lg hover:bg-neutral-gray-200/60 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Progress Bar for Free Shipping */}
          {freeShippingStatus && cart.length > 0 && (
            <div className="px-5 py-3 border-b border-neutral-gray-200/60 bg-neutral-gray-50/20 text-xs">
              <div className="flex justify-between font-semibold mb-1">
                {isShippingFree ? (
                  <span className="text-primary-600">🎉 Congratulations! Free Shipping unlocked!</span>
                ) : (
                  <span className="text-neutral-gray-600">
                    Add <strong className="text-neutral-gray-900">৳{remainingForFreeShipping}</strong> more for Free Shipping
                  </span>
                )}
              </div>
              <div className="w-full h-2 bg-neutral-gray-50 border border-neutral-gray-200/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-600 transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-gray-200/60 px-5 scrollbar-none">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-20 h-20 rounded-full bg-neutral-gray-50 border border-neutral-gray-200/40 flex items-center justify-center mb-4 text-neutral-gray-600">
                  <ShoppingBag size={36} />
                </div>
                <h4 className="font-bold text-neutral-gray-900 mb-1">Your Bag is Empty</h4>
                <p className="text-xs text-neutral-gray-600 max-w-[240px]">
                  Looks like you haven't added anything to your cart yet.
                </p>
              </div>
            ) : (
              cart.map((item) => {
                const discount = item.product.discount || 0;
                const finalPrice = item.product.discount_type === 'amount' || item.product.discount_type === 'flat'
                  ? Math.max(0, item.product.unit_price - discount)
                  : Math.max(0, item.product.unit_price - (item.product.unit_price * discount) / 100);

                // Build image source correctly
                const fullUrlObj = (item.product as any).thumbnail_full_url;
                let imageSrc = '';
                if (fullUrlObj?.path && !fullUrlObj.path.includes('def.png')) {
                  imageSrc = resolveImage(fullUrlObj.path);
                } else if (item.product.thumbnail && !item.product.thumbnail.includes('def.png')) {
                  imageSrc = resolveImage(`/storage/product/thumbnail/${item.product.thumbnail}`);
                } else {
                  imageSrc = '/placeholder.jpg';
                }

                return (
                  <div key={item.product.id} className="py-4 flex items-center justify-between gap-3 group">
                    {/* Product Thumbnail */}
                    <div className="w-14 h-14 rounded bg-neutral-gray-50 border border-neutral-gray-200/60 overflow-hidden flex items-center justify-center shrink-0 shadow-sm relative group-hover:border-primary-200 transition-colors">
                      <img src={imageSrc} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-gray-900 truncate group-hover:text-primary-600 transition-colors">
                        {item.product.name}
                      </p>
                      <p className="text-[11px] text-neutral-gray-600 mb-0.5">{item.product.unit || '1 unit'}</p>
                      <span className="text-xs font-bold text-neutral-gray-900">৳{finalPrice}</span>
                    </div>

                    {/* Quantity Adjuster Controls */}
                    <div className="flex items-center space-x-1.5 bg-neutral-gray-50 border border-neutral-gray-200 rounded-full px-2 py-1 text-xs shrink-0 select-none shadow-sm">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="text-neutral-gray-600 hover:text-primary-600 p-0.5 rounded cursor-pointer transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-bold text-neutral-gray-900 w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="text-neutral-gray-600 hover:text-primary-600 p-0.5 rounded cursor-pointer transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Delete Icon */}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-neutral-gray-600 hover:text-red-600 p-1.5 transition-colors cursor-pointer rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {cart.length > 0 && (
            <div className="border-t border-neutral-gray-200/80 p-5 bg-neutral-gray-50/50 space-y-4 shadow-[0_-4px_15px_rgba(0,0,0,0.03)]">
              <div className="space-y-1.5 text-sm text-neutral-gray-600">
                <div className="flex justify-between text-base font-bold text-neutral-gray-900">
                  <span>Subtotal</span>
                  <span key={`footer-subtotal-${subtotal}`} className="text-primary-600 animate-number-bounce">৳{subtotal}</span>
                </div>
              </div>

              <button onClick={handleCheckout} className="w-full py-3.5 bg-primary-600 hover:bg-primary-800 text-neutral-white font-bold rounded-xl shadow-xl shadow-primary-600/10 flex items-center justify-center space-x-2 active:scale-[0.98] transition-all cursor-pointer border-0">
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
