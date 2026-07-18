'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, Category } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { ChevronDown, ChevronRight, Gift, Percent, Heart, Loader2, Store } from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [hasDiscounted, setHasDiscounted] = useState(false);
  const [businessMode, setBusinessMode] = useState<string>('multi');

  const {
    selectedCategoryId,
    setSelectedCategory,
    setSearchQuery,
    isSidebarOpen,
    setSidebarOpen,
    // Global cache
    categories: storeCategories,
    categoriesLoaded,
    setCategories: setStoreCategories,
    siteConfig,
    configLoaded,
  } = useAppStore();

  // Use store categories if already loaded, otherwise fetch once and save
  const categories = storeCategories;

  useEffect(() => {
    async function loadData() {
      const fetchCats = categoriesLoaded
        ? Promise.resolve(storeCategories)
        : api.getCategories().then((data) => { setStoreCategories(data); return data; });

      const fetchDiscount = api.getDiscountedProducts(1, 1).catch(() => null);

      const [catsResult, discountResult] = await Promise.allSettled([fetchCats, fetchDiscount]);

      if (catsResult.status === 'rejected') {
        console.error('Failed to load categories', catsResult.reason);
      }

      if (
        discountResult.status === 'fulfilled' &&
        discountResult.value &&
        typeof discountResult.value === 'object' &&
        'products' in discountResult.value &&
        Array.isArray((discountResult.value as any).products) &&
        (discountResult.value as any).products.length > 0
      ) {
        setHasDiscounted(true);
      }

      // Read business_mode from the store if already fetched by Header;
      // otherwise fall back to a direct config read (still cached by api.ts)
      if (configLoaded && siteConfig?.business_mode) {
        setBusinessMode(siteConfig.business_mode);
      } else {
        api.getConfig().then((config) => {
          if (config?.business_mode) setBusinessMode(config.business_mode);
        }).catch(() => {});
      }

      setLoading(false);
    }
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleExpand = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleCategorySelect = (category: Category) => {
    setSearchQuery(''); // Reset search when clicking category
    setExpandedIds(prev =>
      prev.includes(category.id) ? prev.filter(item => item !== category.id) : [...prev, category.id]
    );
    setSidebarOpen(false);
    router.push(`/?category=${category.id}`);
  };

  return (
    <>
      {/* Mobile Sidebar Overlay Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-gray-900/40 backdrop-blur-xs md:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`bg-neutral-white border-b border-r border-neutral-gray-200/50 flex flex-col shrink-0 overflow-y-auto scrollbar-none py-4 transition-transform duration-300
          fixed md:sticky top-0 left-0 h-screen md:h-[calc(100vh-65px)] z-50 md:z-auto w-64
          ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Quick links */}
        <div className="px-3 pb-4 border-b border-neutral-gray-100 space-y-1 text-sm font-bold">
          <button
            onClick={() => {
              setSidebarOpen(false);
              router.push('/profile/wishlist');
            }}
            className="w-full flex items-center space-x-3 px-3 py-2.5 text-neutral-gray-900 hover:bg-primary-50/70 hover:text-primary-600 rounded-xl transition-all cursor-pointer"
          >
            <Heart size={16} className="text-primary-600 fill-primary-600/10" />
            <span>Favourites</span>
          </button>
          {businessMode === 'multi' && (
            <button
              onClick={() => {
                setSidebarOpen(false);
                router.push('/vendors');
              }}
              className="w-full flex items-center space-x-3 px-3 py-2.5 text-neutral-gray-900 hover:bg-primary-50/70 hover:text-primary-600 rounded-xl transition-all cursor-pointer"
            >
              <Store size={16} className="text-primary-600" />
              <span>All Vendors</span>
            </button>
          )}
          {hasDiscounted && (
            <button
              onClick={() => {
                setSidebarOpen(false);
                router.push('/discounted-products');
              }}
              className="w-full flex items-center space-x-3 px-3 py-2.5 text-neutral-gray-900 hover:bg-primary-50/70 hover:text-primary-600 rounded-xl transition-all cursor-pointer"
            >
              <Percent size={16} className="text-primary-600" />
              <span>Discounted Products</span>
            </button>
          )}
        </div>

      {/* Categories Accordion */}
      <div className="flex-1 px-3 py-5">
        <h4 className="px-3 mb-3 text-[12px] font-extrabold uppercase tracking-wider text-neutral-400">Categories</h4>

        {loading ? (
          <div className="space-y-1 px-1">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl animate-pulse">
                <div className="h-4 bg-neutral-gray-50 rounded w-2/3 animate-pulse" />
                <div className="h-3 bg-neutral-gray-50 rounded w-3 animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <ul className="space-y-1 text-[13px] font-bold">
            {categories.map((cat, idx1) => {
              const hasChildren = cat.childes && cat.childes.length > 0;
              const isExpanded = expandedIds.includes(cat.id);
              const isSelected = selectedCategoryId === cat.id;

              return (
                <li key={`${cat.id}-${idx1}`} className="space-y-1">
                  <div
                    onClick={() => handleCategorySelect(cat)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-primary-600 text-neutral-white font-extrabold shadow-md shadow-primary-600/15'
                        : 'text-neutral-gray-700 hover:bg-primary-50 hover:text-primary-600'
                    }`}
                  >
                    <div className="flex items-center min-w-0">
                      <span className="truncate">{cat.name}</span>
                    </div>

                    {hasChildren && (
                      <button
                        onClick={(e) => toggleExpand(cat.id, e)}
                        className={`p-1 rounded-lg hover:bg-neutral-gray-200/20 text-current transition-transform cursor-pointer ${isExpanded ? 'rotate-180' : ''}`}
                      >
                        <ChevronDown size={12} />
                      </button>
                    )}
                  </div>

                  {/* Subcategories (Level 2) */}
                  {hasChildren && isExpanded && (
                    <ul className="pl-5 space-y-1 border-l border-neutral-gray-200/60 ml-5 py-1">
                      {cat.childes!.map((subCat, idx2) => {
                        const hasSubChildren = subCat.childes && subCat.childes.length > 0;
                        const isSubExpanded = expandedIds.includes(subCat.id);
                        const isSubSelected = selectedCategoryId === subCat.id;

                        return (
                          <li key={`${subCat.id}-${idx2}`} className="space-y-1">
                            <div
                              onClick={() => handleCategorySelect(subCat)}
                              className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs font-bold transition-all ${
                                isSubSelected
                                  ? 'bg-primary-50 text-primary-600 font-extrabold border border-primary-100'
                                  : 'text-neutral-gray-500 hover:text-neutral-900 hover:bg-neutral-gray-50'
                              }`}
                            >
                              <span className="truncate">{subCat.name}</span>
                              {hasSubChildren && (
                                <button
                                  onClick={(e) => toggleExpand(subCat.id, e)}
                                  className={`p-0.5 rounded text-current transition-transform cursor-pointer ${isSubExpanded ? 'rotate-90' : ''}`}
                                >
                                  <ChevronRight size={10} />
                                </button>
                              )}
                            </div>

                            {/* Deep Nesting (Level 3 - e.g. Fresh Vegetables) */}
                            {hasSubChildren && isSubExpanded && (
                              <ul className="pl-4 space-y-1 border-l border-neutral-gray-150 ml-2 py-0.5">
                                {subCat.childes!.map((deepCat, idx3) => {
                                  const isDeepSelected = selectedCategoryId === deepCat.id;
                                  return (
                                    <li key={`${deepCat.id}-${idx3}`}>
                                      <div
                                        onClick={() => handleCategorySelect(deepCat)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all truncate ${
                                          isDeepSelected
                                            ? 'text-primary-600 font-extrabold bg-primary-50'
                                            : 'text-neutral-gray-500 hover:text-neutral-950 hover:bg-neutral-gray-50/50'
                                        }`}
                                      >
                                        {deepCat.name}
                                      </div>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
    </>
  );
}
