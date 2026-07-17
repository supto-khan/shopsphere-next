'use client';

import React from 'react';
import { Product } from '@/lib/api';
import ProductCard from './ProductCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

interface ProductSliderProps {
  products: Product[];
  categoryId: number;
}

export default function ProductSlider({ products, categoryId }: ProductSliderProps) {
  if (!products || products.length === 0) return null;

  return (
    <div className="relative w-full group/prod-slider">
      <Swiper
        modules={[Autoplay, Navigation]}
        autoplay={{
          delay: 3000 + Math.random() * 1000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        navigation={{
          nextEl: `.swiper-prod-next-${categoryId}`,
          prevEl: `.swiper-prod-prev-${categoryId}`,
        }}
        spaceBetween={16}
        slidesPerView={2}
        breakpoints={{
          640: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 5 },
          1280: { slidesPerView: 6 },
        }}
        loop={products.length >= 6}
        className="py-1 !h-auto"
      >
        {products.map((prod, idx) => (
          <SwiperSlide key={`${prod.id}-${idx}`} className="!h-auto flex">
            <div className="w-full h-full flex flex-col">
              <ProductCard product={prod} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Arrows */}
      <button className={`swiper-prod-prev-${categoryId} absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-primary-600 text-neutral-white shadow-lg flex items-center justify-center hover:bg-primary-700 active:scale-95 transition-all duration-300 cursor-pointer opacity-0 -translate-x-4 pointer-events-none group-hover/prod-slider:opacity-100 group-hover/prod-slider:translate-x-0 group-hover/prod-slider:pointer-events-auto`}>
        <ChevronLeft size={20} />
      </button>
      <button className={`swiper-prod-next-${categoryId} absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-primary-600 text-neutral-white shadow-lg flex items-center justify-center hover:bg-primary-700 active:scale-95 transition-all duration-300 cursor-pointer opacity-0 translate-x-4 pointer-events-none group-hover/prod-slider:opacity-100 group-hover/prod-slider:translate-x-0 group-hover/prod-slider:pointer-events-auto`}>
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
