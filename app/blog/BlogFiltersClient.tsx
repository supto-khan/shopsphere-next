'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BlogCategory } from '@/lib/api';

interface BlogFiltersClientProps {
  initialSearch: string;
  initialCategory: string;
  blogCategoryList: BlogCategory[];
}

export default function BlogFiltersClient({
  initialSearch,
  initialCategory,
  blogCategoryList,
}: BlogFiltersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(initialSearch);
  const categoryContainerRef = useRef<HTMLUListElement>(null);
  const [showArrows, setShowArrows] = useState(false);

  const checkOverflow = () => {
    if (categoryContainerRef.current) {
      const { scrollWidth, clientWidth } = categoryContainerRef.current;
      setShowArrows(scrollWidth > clientWidth);
    }
  };

  useEffect(() => {
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [blogCategoryList]);

  useEffect(() => {
    setSearchInput(initialSearch);
  }, [initialSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput) {
      params.set('search', searchInput);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`/blog?${params.toString()}`);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    params.set('page', '1');
    router.push(`/blog?${params.toString()}`);
  };

  const handleCategorySelect = (catName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (catName) {
      params.set('category', catName);
    } else {
      params.delete('category');
    }
    params.set('page', '1');
    router.push(`/blog?${params.toString()}`);
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryContainerRef.current) {
      const scrollAmount = 200;
      categoryContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center mb-8 border-b border-neutral-gray-50 pb-6">
      <div className="lg:col-span-8 relative">
        <div className="flex items-center">
          {showArrows && (
            <button
              onClick={() => scrollCategories('left')}
              className="p-1.5 rounded-full border border-neutral-gray-200 bg-neutral-white hover:bg-neutral-gray-55 text-neutral-gray-600 transition shadow-sm mr-2 cursor-pointer flex items-center justify-center"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          <ul
            ref={categoryContainerRef}
            className="flex gap-2 overflow-x-auto scrollbar-none py-1 flex-1 select-none"
          >
            <li>
              <button
                onClick={() => handleCategorySelect('')}
                className={`px-4 py-2 text-sm font-medium rounded-full border transition whitespace-nowrap cursor-pointer ${
                  initialCategory === ''
                    ? 'bg-primary-600 border-primary-600 text-neutral-white shadow-sm'
                    : 'bg-neutral-white border-neutral-gray-200 text-neutral-gray-600 hover:border-neutral-gray-300'
                }`}
              >
                All
              </button>
            </li>
            {blogCategoryList.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => handleCategorySelect(cat.name)}
                  className={`px-4 py-2 text-sm font-medium rounded-full border transition whitespace-nowrap cursor-pointer ${
                    initialCategory === cat.name
                      ? 'bg-primary-600 border-primary-600 text-neutral-white shadow-sm'
                      : 'bg-neutral-white border-neutral-gray-200 text-neutral-gray-600 hover:border-neutral-gray-300'
                  }`}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>

          {showArrows && (
            <button
              onClick={() => scrollCategories('right')}
              className="p-1.5 rounded-full border border-neutral-gray-200 bg-neutral-white hover:bg-neutral-gray-55 text-neutral-gray-600 transition shadow-sm ml-2 cursor-pointer flex items-center justify-center"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="lg:col-span-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search Blog..."
            className="w-full pl-4 pr-10 py-2.5 bg-neutral-white border border-neutral-gray-200 rounded-full text-sm text-neutral-gray-900 focus:outline-none focus:border-primary-400 shadow-sm"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-gray-600 hover:text-primary-600 cursor-pointer"
          >
            🔍
          </button>
        </form>
        {initialSearch && (
          <div
            onClick={handleClearSearch}
            className="flex items-center gap-1 mt-2 text-xs text-danger font-medium cursor-pointer hover:underline justify-end"
          >
            <span>Clear Search</span>
            <span>&times;</span>
          </div>
        )}
      </div>
    </div>
  );
}
