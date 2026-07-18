import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { resolveImage } from '@/lib/image';
import Image from 'next/image';

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

interface HeroSliderProps {
  initialBanners?: Banner[];
}

export default function HeroSlider({ initialBanners }: HeroSliderProps) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [banners, setBanners] = useState<Banner[]>(initialBanners || []);
  const [loading, setLoading] = useState(!initialBanners);

  useEffect(() => {
    if (initialBanners) {
      setBanners(initialBanners);
      setLoading(false);
      return;
    }
    let active = true;
    api.getBanners()
      .then((data) => {
        if (!active) return;
        const list = Array.isArray(data) ? data : [];
        // Filter active Main Banners
        const filtered = list.filter(
          (b: any) => b.published === 1 && b.banner_type === 'Main Banner'
        );
        setBanners(filtered);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [initialBanners]);

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

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % banners.length);
  };

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) handleNext();
    else if (isRightSwipe) handlePrev();
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setTouchEnd(null);
    setTouchStart(e.clientX);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (touchStart === null) return;
    setTouchEnd(e.clientX);
  };

  const onMouseUp = () => {
    if (touchStart !== null && touchEnd !== null) {
      const distance = touchStart - touchEnd;
      if (distance > minSwipeDistance) handleNext();
      else if (distance < -minSwipeDistance) handlePrev();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const toProxyUrl = (url?: string): string => {
    return resolveImage(url, '');
  };

  const handleBannerClick = (b: Banner) => {
    if (b.resource_type === 'product' && b.product?.slug) {
      router.push(`/product/${b.product.slug}`);
    } else if (b.resource_type === 'category' && b.category?.slug) {
      router.push(`/search?category=${b.category.slug}`);
    } else if (b.resource_type === 'brand' && b.brand?.slug) {
      router.push(`/search?brand=${b.brand.slug}`);
    } else if (b.resource_type === 'shop' && b.shop?.slug) {
      router.push(`/shop/${b.shop.slug}`);
    }
  };

  if (loading) {
    return (
      <div className="w-full rounded-2xl animate-pulse h-[350px] md:h-[450px] min-h-[350px] bg-neutral-gray-55/20 border border-neutral-gray-200/50 relative overflow-hidden flex flex-col justify-between p-8 md:p-12">
        {/* Skeleton Banner Title & Subtitle blocks */}
        <div className="space-y-4 max-w-md mt-6">
          <div className="h-8 md:h-10 bg-neutral-gray-55/40 rounded-lg w-3/4" />
          <div className="h-4 md:h-5 bg-neutral-gray-55/30 rounded-lg w-1/2" />
        </div>
        
        {/* Skeleton Action Button */}
        <div className="h-10 md:h-12 bg-neutral-gray-55/40 rounded-xl w-36 mt-4" />

        {/* Skeleton Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          <div className="w-5 h-1.5 rounded-full bg-neutral-gray-55/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-neutral-gray-55/30" />
          <div className="w-1.5 h-1.5 rounded-full bg-neutral-gray-55/30" />
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return null; // Return nothing if no active main banners are configured
  }

  return (
    <div className="relative w-full select-none group">
      {/* Inner banner wrapper with overflow hidden */}
      <div className="relative w-full rounded-2xl overflow-hidden shadow-xl shadow-neutral-gray-200/40 h-[350px] md:h-[450px] min-h-[350px] bg-neutral-gray-50 border border-neutral-gray-200/60">
        {/* Slides */}
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
            const isActive = index === current;
            return (
              <div
                key={banner.id}
                onClick={() => handleBannerClick(banner)}
                className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {imageSrc && (
                  <Image
                    src={imageSrc}
                    alt="Banner promotion"
                    fill
                    sizes="(max-width: 1200px) 100vw, 1200px"
                    className="object-cover select-none"
                    draggable="false"
                    priority={isActive}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Dots Indicator */}
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

      {/* Slide Navigation Arrows (Positioned 50% outside the banner container) */}
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
