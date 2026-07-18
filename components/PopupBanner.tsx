'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { resolveImage } from '@/lib/image';

interface Banner {
  id: number;
  banner_type: string;
  resource_type: string;
  resource_id: number;
  published: number;
  photo_full_url: {
    path: string;
    status: number;
    key: string;
  };
  product?: { slug: string };
  shop?: { slug: string };
  brand?: { slug: string };
  category?: { slug: string };
}

interface PopupBannerProps {
  /**
   * Pre-filtered Popup Banner passed from the server.
   * When null / undefined, the component renders nothing.
   */
  initialBanner?: Banner | null;
}

const toProxyUrl = (url?: string): string => resolveImage(url, '');

export default function PopupBanner({ initialBanner }: PopupBannerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // When initialBanner is provided by the server, preload the image then show
  // the popup — no API call needed.
  useEffect(() => {
    if (!initialBanner) return;

    const imageSrc = toProxyUrl(initialBanner.photo_full_url?.path);
    const img = new Image();
    img.src = imageSrc;
    const reveal = () => setOpen(true);
    img.onload  = reveal;
    img.onerror = reveal; // still show even if image fails
  }, [initialBanner]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setOpen(false);
      setIsExiting(false);
    }, 250);
  };

  const handleBannerClick = () => {
    if (!initialBanner) return;
    setIsExiting(true);
    setTimeout(() => {
      setOpen(false);
      setIsExiting(false);

      const b = initialBanner;
      if (b.resource_type === 'product'  && b.product?.slug)  router.push(`/product/${b.product.slug}`);
      else if (b.resource_type === 'category' && b.category?.slug) router.push(`/search?category=${b.category.slug}`);
      else if (b.resource_type === 'brand'    && b.brand?.slug)    router.push(`/search?brand=${b.brand.slug}`);
      else if (b.resource_type === 'shop'     && b.shop?.slug)     router.push(`/shop/${b.shop.slug}`);
    }, 250);
  };

  if (!open || !initialBanner) return null;

  const imageSrc = toProxyUrl(initialBanner.photo_full_url?.path);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-neutral-black/40 backdrop-blur-sm p-4 ${
        isExiting ? 'animate-fade-out' : 'animate-fade-in'
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-lg select-none ${
          isExiting ? 'animate-scale-down' : 'animate-scale-up'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button (50% hanging outside) */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute -top-4 -right-4 z-10 w-8 h-8 rounded-full bg-neutral-white text-neutral-gray-800 hover:bg-neutral-gray-50 flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer border border-neutral-gray-200/40"
          aria-label="Close banner"
        >
          <X size={18} />
        </button>

        {/* Banner image */}
        <div className="w-full rounded-3xl overflow-hidden shadow-2xl border border-neutral-gray-200/30 bg-neutral-white">
          <div onClick={handleBannerClick} className="w-full cursor-pointer hover:opacity-95 transition-opacity">
            <img
              src={imageSrc}
              alt="Promotion banner"
              className="w-full h-auto object-cover max-h-[70vh]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
