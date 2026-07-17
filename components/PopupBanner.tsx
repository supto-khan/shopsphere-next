'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
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
  product?: {
    slug: string;
  };
  shop?: {
    slug: string;
  };
  brand?: {
    slug: string;
  };
  category?: {
    slug: string;
  };
}

const toProxyUrl = (url?: string): string => {
  return resolveImage(url, '');
};

export default function PopupBanner() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [banner, setBanner] = useState<Banner | null>(null);

  useEffect(() => {
    api.getBanners()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        // Filter active Popup Banners
        const activePopup = list.find(
          (b: any) => b.published === 1 && b.banner_type === 'Popup Banner'
        );
        if (activePopup) {
          const imageSrc = toProxyUrl(activePopup.photo_full_url?.path);
          // Preload the image before triggering open/animation
          const img = new Image();
          img.src = imageSrc;
          img.onload = () => {
            setBanner(activePopup);
            setOpen(true);
          };
          img.onerror = () => {
            setBanner(activePopup);
            setOpen(true);
          };
        }
      })
      .catch(() => {});
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setOpen(false);
      setIsExiting(false);
    }, 250);
  };

  const handleBannerClick = () => {
    if (!banner) return;
    setIsExiting(true);
    setTimeout(() => {
      setOpen(false);
      setIsExiting(false);

      if (banner.resource_type === 'product' && banner.product?.slug) {
        router.push(`/product/${banner.product.slug}`);
      } else if (banner.resource_type === 'category' && banner.category?.slug) {
        router.push(`/search?category=${banner.category.slug}`);
      } else if (banner.resource_type === 'brand' && banner.brand?.slug) {
        router.push(`/search?brand=${banner.brand.slug}`);
      } else if (banner.resource_type === 'shop' && banner.shop?.slug) {
        router.push(`/shop/${banner.shop.slug}`);
      }
    }, 250);
  };

  if (!open || !banner) return null;

  const imageSrc = toProxyUrl(banner.photo_full_url?.path);

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

        {/* Inner banner wrapper with overflow hidden */}
        <div className="w-full rounded-3xl overflow-hidden shadow-2xl border border-neutral-gray-200/30 bg-neutral-white">
          {/* Banner image wrapper */}
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
