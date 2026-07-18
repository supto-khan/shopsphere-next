'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

interface MainSectionBannerProps {
  /**
   * Pre-filtered "Main Section Banner" list passed from the server.
   * When provided, no client-side API call is made.
   */
  initialBanners?: Banner[];
}

const toProxyUrl = (url?: string): string => resolveImage(url, '');

export default function MainSectionBanner({ initialBanners }: MainSectionBannerProps) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);

  // Use server-provided banners directly — no useEffect API call needed.
  const banners: Banner[] = initialBanners ?? [];

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length, current]);

  const handleNext = () => setCurrent((prev) => (prev + 1) % banners.length);
  const handlePrev = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length);

  const onTouchStart  = (e: React.TouchEvent) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMove   = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd    = () => {
    if (!touchStart || !touchEnd) return;
    const d = touchStart - touchEnd;
    if (d > minSwipeDistance) handleNext();
    else if (d < -minSwipeDistance) handlePrev();
  };
  const onMouseDown   = (e: React.MouseEvent) => { setTouchEnd(null); setTouchStart(e.clientX); };
  const onMouseMove   = (e: React.MouseEvent) => { if (touchStart !== null) setTouchEnd(e.clientX); };
  const onMouseUp     = () => {
    if (touchStart !== null && touchEnd !== null) {
      const d = touchStart - touchEnd;
      if (d > minSwipeDistance) handleNext();
      else if (d < -minSwipeDistance) handlePrev();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleBannerClick = (b: Banner) => {
    if (b.resource_type === 'product'  && b.product?.slug)  router.push(`/product/${b.product.slug}`);
    else if (b.resource_type === 'category' && b.category?.slug) router.push(`/search?category=${b.category.slug}`);
    else if (b.resource_type === 'brand'    && b.brand?.slug)    router.push(`/search?brand=${b.brand.slug}`);
    else if (b.resource_type === 'shop'     && b.shop?.slug)     router.push(`/shop/${b.shop.slug}`);
  };

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full select-none group">
      <div className="relative w-full rounded-2xl overflow-hidden shadow-xl shadow-neutral-gray-200/40 h-[350px] md:h-[450px] min-h-[350px] bg-neutral-gray-50 border border-neutral-gray-200/60">
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          className="relative w-full h-full cursor-grab active:cursor-grabbing"
        >
          {banners.map((banner, index) => {
            const imageSrc = toProxyUrl(banner.photo_full_url?.path);
            return (
              <div
                key={banner.id}
                onClick={() => handleBannerClick(banner)}
                className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                  index === current ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <img
                  src={imageSrc}
                  alt="Section banner promotion"
                  className="w-full h-full object-cover select-none"
                  draggable="false"
                  loading="lazy"
                />
              </div>
            );
          })}
        </div>

        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  index === current ? 'w-4 bg-neutral-white' : 'bg-neutral-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-primary-600 text-neutral-white shadow-lg flex items-center justify-center hover:bg-primary-700 active:scale-95 transition-all duration-300 cursor-pointer opacity-0 -translate-x-4 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            className="absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-primary-600 text-neutral-white shadow-lg flex items-center justify-center hover:bg-primary-700 active:scale-95 transition-all duration-300 cursor-pointer opacity-0 translate-x-4 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  );
}
