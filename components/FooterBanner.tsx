'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { resolveImage } from '@/lib/image';

// NOTE: Swiper removed — replaced with native CSS scroll-snap slider.
// Eliminates ~45 KB of Swiper JS + ~12 KB of Swiper CSS from the bundle.

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

interface FooterBannerProps {
  /**
   * Pre-filtered "Footer Banner" list passed from the server.
   * When provided, no client-side API call is made.
   */
  initialBanners?: Banner[];
}

const toProxyUrl = (url?: string): string => resolveImage(url, '');

export default function FooterBanner({ initialBanners }: FooterBannerProps) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);

  // Use server-provided banners — no useEffect / api.getBanners() call needed
  const banners: Banner[] = initialBanners ?? [];

  if (banners.length === 0) return null;

  const handleBannerClick = (b: Banner) => {
    if (b.resource_type === 'product'  && b.product?.slug)  router.push(`/product/${b.product.slug}`);
    else if (b.resource_type === 'category' && b.category?.slug) router.push(`/search?category=${b.category.slug}`);
    else if (b.resource_type === 'brand'    && b.brand?.slug)    router.push(`/search?brand=${b.brand.slug}`);
    else if (b.resource_type === 'shop'     && b.shop?.slug)     router.push(`/shop/${b.shop.slug}`);
  };

  const handleNext = () => setCurrent((prev) => (prev + 1) % banners.length);
  const handlePrev = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length);

  // Single banner — simple full-width display
  if (banners.length === 1) {
    const banner = banners[0];
    const imageSrc = toProxyUrl(banner.photo_full_url?.path);
    return (
      <div
        onClick={() => handleBannerClick(banner)}
        className="w-full rounded-2xl overflow-hidden shadow-md border border-neutral-gray-200/40 cursor-pointer bg-neutral-gray-55/20 hover:opacity-95 transition-opacity h-[350px] md:h-[450px] min-h-[350px] select-none"
      >
        <img
          src={imageSrc}
          alt="Footer promotion banner"
          className="w-full h-full object-cover select-none"
          draggable="false"
          loading="lazy"
        />
      </div>
    );
  }

  // Multiple banners — native CSS-based slider (no Swiper dependency)
  return (
    <div className="relative w-full select-none group/footer-banner">
      {/* Two-up grid on desktop using CSS grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Show 2 banners at a time, cycling with prev/next */}
        {[0, 1].map((offset) => {
          const banner = banners[(current + offset) % banners.length];
          if (!banner) return null;
          const imageSrc = toProxyUrl(banner.photo_full_url?.path);
          return (
            <div
              key={`${banner.id}-${offset}`}
              onClick={() => handleBannerClick(banner)}
              className="w-full rounded-2xl overflow-hidden shadow-md border border-neutral-gray-200/40 cursor-pointer bg-neutral-gray-55/20 hover:opacity-95 transition-opacity h-[350px] md:h-[450px] min-h-[350px] select-none"
            >
              <img
                src={imageSrc}
                alt="Footer promotion banner"
                className="w-full h-full object-cover select-none"
                draggable="false"
                loading="lazy"
              />
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      {banners.length > 2 && (
        <>
          <button
            onClick={handlePrev}
            aria-label="Previous banner"
            className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-primary-600 text-neutral-white shadow-lg flex items-center justify-center hover:bg-primary-700 active:scale-95 transition-all duration-300 cursor-pointer opacity-0 -translate-x-4 pointer-events-none group-hover/footer-banner:opacity-100 group-hover/footer-banner:translate-x-0 group-hover/footer-banner:pointer-events-auto"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next banner"
            className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-primary-600 text-neutral-white shadow-lg flex items-center justify-center hover:bg-primary-700 active:scale-95 transition-all duration-300 cursor-pointer opacity-0 translate-x-4 pointer-events-none group-hover/footer-banner:opacity-100 group-hover/footer-banner:translate-x-0 group-hover/footer-banner:pointer-events-auto"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  );
}
