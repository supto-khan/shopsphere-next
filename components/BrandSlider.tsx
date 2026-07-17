'use client';

import React from 'react';
import { Brand } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

interface BrandSliderProps {
  brands: Brand[];
}

export default function BrandSlider({ brands }: BrandSliderProps) {
  const router = useRouter();

  if (!brands || brands.length === 0) return null;

  return (
    <div className="relative w-full group/slider">
      <Swiper
        modules={[Autoplay, Navigation]}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        navigation={{
          nextEl: '.swiper-brand-next',
          prevEl: '.swiper-brand-prev',
        }}
        spaceBetween={20}
        slidesPerView={2}
        breakpoints={{
          480: { slidesPerView: 3 },
          640: { slidesPerView: 4 },
          768: { slidesPerView: 5 },
          1024: { slidesPerView: 6 },
          1280: { slidesPerView: 7 },
        }}
        loop={brands.length >= 7}
        className="py-1"
      >
        {brands.map((b) => {
          const fullUrlObj = (b as any).image_full_url;
          let imageSrc = '';
          if (fullUrlObj?.path && !fullUrlObj.path.includes('def.png')) {
            const cleanPath = fullUrlObj.path.replace(/^https?:\/\/[^\/]+/, '');
            imageSrc = cleanPath.replace('storage/app/public', 'storage');
          } else if (b.image && !b.image.includes('def.png')) {
            imageSrc = `/storage/brand/${b.image}`;
          } else {
            imageSrc = '/placeholder.jpg';
          }

          return (
            <SwiperSlide key={b.id}>
              <div
                onClick={() => router.push(`/search?brand=${(b as any).slug || b.name.toLowerCase().replace(/\s+/g, '-')}`)}
                className="border border-neutral-gray-200/60 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary-600 hover:shadow-md transition-all bg-neutral-white group select-none"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-gray-55/20 border border-neutral-gray-200/80 flex items-center justify-center mb-2 shrink-0">
                  <img src={imageSrc} alt={b.name || 'Brand'} className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-bold text-neutral-gray-900 group-hover:text-primary-600 transition-colors text-center line-clamp-1">
                  {b.name || 'Brand'}
                </span>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Navigation Arrows */}
      <button className="swiper-brand-prev absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-primary-600 text-neutral-white shadow-lg flex items-center justify-center hover:bg-primary-700 active:scale-95 transition-all duration-300 cursor-pointer opacity-0 -translate-x-4 pointer-events-none group-hover/slider:opacity-100 group-hover/slider:translate-x-0 group-hover/slider:pointer-events-auto">
        <ChevronLeft size={20} />
      </button>
      <button className="swiper-brand-next absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-primary-600 text-neutral-white shadow-lg flex items-center justify-center hover:bg-primary-700 active:scale-95 transition-all duration-300 cursor-pointer opacity-0 translate-x-4 pointer-events-none group-hover/slider:opacity-100 group-hover/slider:translate-x-0 group-hover/slider:pointer-events-auto">
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
