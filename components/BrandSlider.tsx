'use client';

import React, { useRef } from 'react';
import { Brand } from '@/lib/api';
import { resolveImage, PLACEHOLDER_IMAGE } from '@/lib/image';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// NOTE: Swiper removed — replaced with native CSS overflow scroll + scroll-snap.
// Eliminates ~45 KB JS + ~12 KB CSS from the bundle (Swiper is no longer imported anywhere).

interface BrandSliderProps {
  brands: Brand[];
}

export default function BrandSlider({ brands }: BrandSliderProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!brands || brands.length === 0) return null;

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const itemWidth = scrollRef.current.firstElementChild
      ? (scrollRef.current.firstElementChild as HTMLElement).offsetWidth + 20
      : 120;
    scrollRef.current.scrollBy({ left: dir === 'right' ? itemWidth * 3 : -itemWidth * 3, behavior: 'smooth' });
  };

  return (
    <div className="relative group">
      {/* Native scroll-snap container — zero JS dependency */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scroll-smooth pb-1 scrollbar-none"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {brands.map((b) => {
          const fullUrlObj = (b as any).image_full_url;
          let imageSrc: string;
          if (fullUrlObj?.path && !fullUrlObj.path.includes('def.png')) {
            imageSrc = resolveImage(fullUrlObj.path);
          } else if (b.image && !b.image.includes('def.png')) {
            imageSrc = resolveImage(`/storage/brand/${b.image}`);
          } else {
            imageSrc = PLACEHOLDER_IMAGE;
          }

          return (
            <div
              key={b.id}
              style={{ scrollSnapAlign: 'start', flexShrink: 0 }}
              onClick={() =>
                router.push(
                  `/search?brand=${(b as any).slug || b.name.toLowerCase().replace(/\s+/g, '-')}`
                )
              }
              className="border border-neutral-gray-200/60 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary-600 hover:shadow-md transition-all bg-neutral-white select-none w-[90px] sm:w-[100px]"
            >
              <div className="w-14 h-14 rounded-full overflow-hidden bg-neutral-gray-55/20 border border-neutral-gray-200/80 flex items-center justify-center mb-2 shrink-0">
                <img
                  src={imageSrc}
                  alt={b.name || 'Brand'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <span className="text-xs font-bold text-neutral-gray-900 hover:text-primary-600 transition-colors text-center line-clamp-1">
                {b.name || 'Brand'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={() => scroll('left')}
        aria-label="Scroll brands left"
        className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-primary-600 text-neutral-white shadow-lg flex items-center justify-center hover:bg-primary-700 active:scale-95 transition-all duration-300 cursor-pointer opacity-0 -translate-x-4 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => scroll('right')}
        aria-label="Scroll brands right"
        className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-primary-600 text-neutral-white shadow-lg flex items-center justify-center hover:bg-primary-700 active:scale-95 transition-all duration-300 cursor-pointer opacity-0 translate-x-4 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
