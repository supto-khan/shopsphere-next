'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import { api } from '@/lib/api';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

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
  if (!url) return '';
  const clean = url.replace(/^https?:\/\/[^\/]+/, '');
  const proxied = clean.replace('storage/app/public', 'storage');
  return proxied.startsWith('/') ? proxied : '/' + proxied;
};

export default function FooterBanner() {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.getBanners()
      .then((data) => {
        if (!active) return;
        const list = Array.isArray(data) ? data : [];
        // Filter active Footer Banners
        const filtered = list.filter(
          (b: any) => b.published === 1 && b.banner_type === 'Footer Banner'
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
  }, []);

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
        {/* Skeleton Title & Subtitle blocks */}
        <div className="space-y-4 max-w-md mt-6">
          <div className="h-8 md:h-10 bg-neutral-gray-200/85 rounded-lg w-2/3" />
          <div className="h-4 md:h-5 bg-neutral-gray-200/70 rounded-lg w-1/3" />
        </div>
        
        {/* Skeleton Action Button */}
        <div className="h-10 md:h-12 bg-neutral-gray-200/80 rounded-xl w-32 mt-4" />
      </div>
    );
  }

  if (banners.length === 0) {
    return null; // Return nothing if no active footer banners are configured
  }

  // Single banner takes full width
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
        />
      </div>
    );
  }

  // Multiple banners show 2 at a time on desktop using Swiper
  return (
    <div className="relative w-full select-none group/footer-banner">
      <Swiper
        modules={[Autoplay, Navigation]}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        navigation={{
          nextEl: '.swiper-footer-next',
          prevEl: '.swiper-footer-prev',
        }}
        spaceBetween={16}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 2 },
        }}
        loop={banners.length >= 2}
        className="py-1 !h-auto"
      >
        {banners.map((banner) => {
          const imageSrc = toProxyUrl(banner.photo_full_url?.path);
          return (
            <SwiperSlide key={banner.id} className="!h-auto flex">
              <div
                onClick={() => handleBannerClick(banner)}
                className="w-full rounded-2xl overflow-hidden shadow-md border border-neutral-gray-200/40 cursor-pointer bg-neutral-gray-55/20 hover:opacity-95 transition-opacity h-[350px] md:h-[450px] min-h-[350px] select-none flex"
              >
                <img
                  src={imageSrc}
                  alt="Footer promotion banner"
                  className="w-full h-full object-cover select-none"
                  draggable="false"
                />
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Navigation Arrows */}
      <button className="swiper-footer-prev absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-primary-600 text-neutral-white shadow-lg flex items-center justify-center hover:bg-primary-700 active:scale-95 transition-all duration-300 cursor-pointer opacity-0 -translate-x-4 pointer-events-none group-hover/footer-banner:opacity-100 group-hover/footer-banner:translate-x-0 group-hover/footer-banner:pointer-events-auto">
        <ChevronLeft size={20} />
      </button>
      <button className="swiper-footer-next absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-primary-600 text-neutral-white shadow-lg flex items-center justify-center hover:bg-primary-700 active:scale-95 transition-all duration-300 cursor-pointer opacity-0 translate-x-4 pointer-events-none group-hover/footer-banner:opacity-100 group-hover/footer-banner:translate-x-0 group-hover/footer-banner:pointer-events-auto">
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
