'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ProductCard from '@/components/ProductCard';
import dynamic from 'next/dynamic';

const BrandSlider = dynamic(() => import('@/components/BrandSlider'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[116px] bg-neutral-gray-55/20 border border-neutral-gray-200/50 rounded-xl animate-pulse flex items-center justify-between p-4 overflow-hidden">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i} className="flex flex-col items-center justify-center shrink-0 w-20">
          <div className="w-12 h-12 rounded-full bg-neutral-gray-55/30" />
          <div className="w-10 h-2 bg-neutral-gray-55/20 rounded mt-1.5" />
        </div>
      ))}
    </div>
  ),
});
const HeroSlider = dynamic(() => import('@/components/HeroSlider'), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-2xl animate-pulse h-[350px] md:h-[450px] min-h-[350px] bg-neutral-gray-55/20 border border-neutral-gray-200/50 relative overflow-hidden flex flex-col justify-between p-8 md:p-12">
      <div className="space-y-4 max-w-md mt-6">
        <div className="h-8 md:h-10 bg-neutral-gray-55/40 rounded-lg w-3/4" />
        <div className="h-4 md:h-5 bg-neutral-gray-55/30 rounded-lg w-1/2" />
      </div>
      <div className="h-10 md:h-12 bg-neutral-gray-55/40 rounded-xl w-36 mt-4" />
    </div>
  ),
});
const ProductSlider = dynamic(() => import('@/components/ProductSlider'), {
  ssr: false,
  loading: () => (
    <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 animate-pulse overflow-hidden">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="border border-neutral-gray-200/50 rounded p-3 flex flex-col items-center">
          <div className="w-full aspect-[4/3] bg-neutral-gray-55/30 rounded" />
          <div className="w-3/4 h-3 bg-neutral-gray-55/20 rounded mt-2.5" />
          <div className="w-1/2 h-2.5 bg-neutral-gray-55/20 rounded mt-1.5" />
        </div>
      ))}
    </div>
  ),
});

import PopupBanner from '@/components/PopupBanner';
import FooterBanner from '@/components/FooterBanner';
import MainSectionBanner from '@/components/MainSectionBanner';
import { api, Product, Brand, Category } from '@/lib/api';
import { PLACEHOLDER_IMAGE } from '@/lib/image';
import { useAppStore } from '@/lib/store';
import { ChevronRight } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import Footer from '@/components/Footer';

const ProductSkeleton = () => (
  <div className="bg-neutral-white border border-neutral-gray-200/60 rounded-xl p-4 flex flex-col items-center text-center relative animate-pulse">
    <div className="w-36 h-36 bg-neutral-gray-50/50 rounded-lg border border-neutral-gray-200 mb-3 flex items-center justify-center animate-pulse">
      <div className="w-20 h-20 bg-neutral-gray-200 rounded-md" />
    </div>
    <div className="h-5 bg-neutral-gray-200 rounded w-1/3 mb-2.5 animate-pulse" />
    <div className="w-full flex flex-col items-center space-y-1.5 mb-2.5 min-h-[40px]">
      <div className="h-3.5 bg-neutral-gray-200 rounded w-5/6 animate-pulse" />
      <div className="h-3.5 bg-neutral-gray-200 rounded w-2/3 animate-pulse" />
    </div>
    <div className="h-3 bg-neutral-gray-200 rounded w-1/4 mb-3.5 animate-pulse" />
    <div className="h-5 bg-neutral-gray-200/70 rounded w-16 mt-auto animate-pulse" />
  </div>
);

function findCategoryName(categories: Category[], id: number): string | null {
  for (const cat of categories) {
    if (cat.id === id) return cat.name;
    if (cat.childes && cat.childes.length > 0) {
      const name = findCategoryName(cat.childes, id);
      if (name) return name;
    }
  }
  return null;
}

interface StorefrontClientProps {
  initialConfig: any;
  initialCategories: Category[];
  initialTopSellers: Product[];
  initialBrands: Brand[];
  initialTopShops: any[];
  initialNewArrivals: Product[];
  initialTopRated: Product[];
  initialFeatured: Product[];
  initialCategorySections: { category: Category; products: Product[] }[];
  initialBanners?: any[];
  /** Pre-filtered banner lists passed from the server to eliminate client-side fetching */
  initialSectionBanners?: any[];
  initialFooterBanners?: any[];
  initialPopupBanner?: any | null;
}

export default function StorefrontClient({
  initialConfig,
  initialCategories,
  initialTopSellers,
  initialBrands,
  initialTopShops,
  initialNewArrivals,
  initialTopRated,
  initialFeatured,
  initialCategorySections,
  initialBanners = [],
  initialSectionBanners = [],
  initialFooterBanners = [],
  initialPopupBanner = null,
}: StorefrontClientProps) {
  const {
    selectedCategoryId,
    selectedCategoryName,
    searchQuery,
    setSelectedCategory,
    setSearchQuery,
    categoriesLoaded,
    setCategories: setStoreCategories,
    configLoaded,
    setSiteConfig,
  } = useAppStore();

  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryIdParam = searchParams.get('category');

  // Hydrate global caches on mount if they aren't loaded yet
  useEffect(() => {
    if (!configLoaded && initialConfig) {
      setSiteConfig(initialConfig);
    }
    if (!categoriesLoaded && initialCategories) {
      setStoreCategories(initialCategories);
    }
  }, [configLoaded, categoriesLoaded, initialConfig, initialCategories, setSiteConfig, setStoreCategories]);

  // Sync category param
  useEffect(() => {
    async function syncCategory() {
      if (categoryIdParam) {
        const catId = Number(categoryIdParam);
        if (selectedCategoryId !== catId) {
          const categoryList = initialCategories || [];
          const catName = findCategoryName(categoryList, catId) || 'Category';
          setSelectedCategory(catId, catName);
        }
      } else {
        if (selectedCategoryId !== null) {
          setSelectedCategory(null, null);
        }
      }
    }
    syncCategory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryIdParam, selectedCategoryId, initialCategories]);

  const [loading, setLoading] = useState(false);
  const [newArrivals] = useState<Product[]>(initialNewArrivals);
  const [topSellers] = useState<Product[]>(initialTopSellers);
  const [recommendedProducts] = useState<Product[]>(initialFeatured);
  const [topRatedProducts] = useState<Product[]>(initialTopRated);
  const [topShops] = useState<any[]>(initialTopShops);
  const [brands] = useState<Brand[]>(initialBrands);
  const businessMode = initialConfig?.business_mode || 'multi';

  // Category sections
  const [categorySections] = useState<{ category: Category; products: Product[] }[]>(initialCategorySections);

  // Category or Search dynamic products
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Reset pagination state when filters change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setLoadingMore(false);
  }, [selectedCategoryId, searchQuery]);

  // Handle active filters (Category / Search query)
  useEffect(() => {
    async function applyFilter() {
      const activeCatId = categoryIdParam ? Number(categoryIdParam) : selectedCategoryId;
      if (!activeCatId && !searchQuery) {
        setFilteredProducts([]);
        return;
      }
      setLoading(true);
      try {
        if (searchQuery) {
          const results = await api.searchProducts(searchQuery).catch(() => []);
          setFilteredProducts(results);
        } else if (activeCatId) {
          const results = await api.getProductsByCategory(activeCatId, 30, 1).catch(() => []);
          setFilteredProducts(results);
          if (results.length < 30) {
            setHasMore(false);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    applyFilter();
  }, [selectedCategoryId, categoryIdParam, searchQuery]);

  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const activeCatId = categoryIdParam ? Number(categoryIdParam) : selectedCategoryId;
    if (!activeCatId || searchQuery || !hasMore || loadingMore) return;

    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 200) {
      setLoadingMore(true);
      const nextPage = page + 1;
      try {
        const nextProducts = await api.getProductsByCategory(activeCatId, 30, nextPage).catch(() => []);
        if (nextProducts.length === 0) {
          setHasMore(false);
        } else {
          setFilteredProducts((prev) => [...prev, ...nextProducts]);
          setPage(nextPage);
        }
      } catch (err) {
        console.error('Failed to load more products', err);
      } finally {
        setLoadingMore(false);
      }
    }
  };

  const hasFilter = !!categoryIdParam || !!selectedCategoryId || !!searchQuery;

  const viewAllCategory = (category: Category) => {
    router.push(`/search?category=${category.slug}`);
  };

  return (
    <div onScroll={handleScroll} className="flex-1 overflow-y-auto h-[calc(100vh-65px)] bg-neutral-white">
      <PopupBanner initialBanner={initialPopupBanner} />
      <div className="flex min-w-0">
        <Sidebar />

        <main className="flex-1 min-w-0 p-6">
          {hasFilter && (
            <div className="mb-6">
              <div className="flex items-center space-x-2 text-xs text-neutral-gray-600 mb-2">
                <span
                  onClick={() => { router.push('/'); setSearchQuery(''); }}
                  className="hover:text-primary-600 hover:underline cursor-pointer transition-colors"
                >
                  Home
                </span>
                <ChevronRight size={12} />
                {searchQuery ? (
                  <>
                    <span
                      onClick={() => setSearchQuery('')}
                      className="hover:text-primary-600 hover:underline cursor-pointer transition-colors"
                    >
                      Search
                    </span>
                    <ChevronRight size={12} />
                    <span className="font-semibold text-primary-600">"{searchQuery}"</span>
                  </>
                ) : (
                  <>
                    <span
                      onClick={() => router.push('/')}
                      className="hover:text-primary-600 hover:underline cursor-pointer transition-colors"
                    >
                      Categories
                    </span>
                    <ChevronRight size={12} />
                    <span className="font-semibold text-primary-600">{selectedCategoryName}</span>
                  </>
                )}
              </div>

              <h2 className="text-xl font-bold text-neutral-gray-900 flex items-center space-x-2">
                <span>
                  {searchQuery
                    ? `Search Results for "${searchQuery}"`
                    : selectedCategoryName
                  }
                </span>
                <span className="text-sm font-normal text-neutral-gray-600">
                  ({filteredProducts.length} items found)
                </span>
              </h2>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : hasFilter ? (
            filteredProducts.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
                  {filteredProducts.map((prod, idx) => (
                    <ProductCard key={`${prod.id}-${idx}`} product={prod} />
                  ))}
                </div>
                {loadingMore && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4 mt-4">
                    {[...Array(6)].map((_, i) => (
                      <ProductSkeleton key={`load-more-skel-${i}`} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-neutral-gray-600 text-sm font-semibold mb-2">No products found matching the criteria.</p>
                <p className="text-xs text-neutral-gray-600">Try browsing another category or refining your search keywords.</p>
              </div>
            )
          ) : (
            <div className="space-y-10">
              {initialBanners && initialBanners.length > 0 && (
                <HeroSlider initialBanners={initialBanners} />
              )}

              {/* Main Section Banner — uses server-prefetched data, no client fetch */}
              {initialSectionBanners && initialSectionBanners.length > 0 && (
                <MainSectionBanner initialBanners={initialSectionBanners} />
              )}

              {/* Best Sellers */}
              {topSellers.length > 0 && (
                <div className="bg-gradient-to-br from-primary-50/25 via-neutral-white to-neutral-white border border-neutral-gray-200/50 p-5 md:p-6 shadow-sm">
                  <h3 className="text-sm font-extrabold text-neutral-gray-900 mb-5 flex items-center space-x-2.5 uppercase tracking-wider">
                    <span className="w-1 h-5 bg-primary-600 rounded-full" />
                    <span>Top Selling Products</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {topSellers.map((prod, idx) => (
                      <ProductCard key={`${prod.id}-${idx}`} product={prod} priority={idx < 4} />
                    ))}
                  </div>
                </div>
              )}

              {/* Brands */}
              {brands.length > 0 && (
                <div>
                  <h3 className="text-sm font-extrabold text-neutral-gray-900 mb-5 flex items-center space-x-2.5 uppercase tracking-wider">
                    <span className="w-1 h-5 bg-primary-600 rounded-full" />
                    <span>Featured Brands</span>
                  </h3>
                  <BrandSlider brands={brands} />
                </div>
              )}

              {/* Top Shops */}
              {businessMode === 'multi' && topShops.length > 0 && (
                <div>
                  <h3 className="text-sm font-extrabold text-neutral-gray-900 mb-5 flex items-center space-x-2.5 uppercase tracking-wider">
                    <span className="w-1 h-5 bg-primary-600 rounded-full" />
                    <span>Top Sellers</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {topShops.slice(0, 6).map((seller, idx) => {
                      const shop = seller.shop || {};

                      let bannerImg = '';
                      const shopBanner = shop.banner_full_url?.path;
                      if (shopBanner && !shopBanner.includes('def.png')) {
                        const cleanPath = shopBanner.replace(/^https?:\/\/[^\/]+/, '');
                        bannerImg = cleanPath.replace('storage/app/public', 'storage');
                      } else {
                        bannerImg = PLACEHOLDER_IMAGE;
                      }

                      let logoImg = '';
                      const shopImage = shop.image_full_url?.path;
                      const sellerImage = seller.image_full_url?.path;
                      if (shopImage && !shopImage.includes('def.png')) {
                        const cleanPath = shopImage.replace(/^https?:\/\/[^\/]+/, '');
                        logoImg = cleanPath.replace('storage/app/public', 'storage');
                      } else if (sellerImage && !sellerImage.includes('def.png')) {
                        const cleanPath = sellerImage.replace(/^https?:\/\/[^\/]+/, '');
                        logoImg = cleanPath.replace('storage/app/public', 'storage');
                      } else {
                        logoImg = PLACEHOLDER_IMAGE;
                      }

                      const displayName = shop.name || (seller.id === 0 ? 'In-House Shop' : (seller.f_name ? `${seller.f_name} ${seller.l_name}` : 'Vendor Shop'));
                      const shopSlug = shop.slug || null;

                      return (
                        <a key={idx} href={shopSlug ? `/shop/${shopSlug}` : '#'}
                          className="bg-neutral-white border border-neutral-gray-200/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-neutral-gray-100/35 hover:-translate-y-1 select-none group shadow-sm flex flex-col h-full">
                          <div className="w-full aspect-[21/9] bg-neutral-gray-55/30 overflow-hidden relative border-b border-neutral-gray-100/50">
                            <img src={bannerImg} alt={displayName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350" />
                            <div className="absolute -bottom-5 left-4 w-12 h-12 rounded-full overflow-hidden border-2 border-neutral-white bg-neutral-white shadow-md">
                              <img src={logoImg} alt={displayName} className="w-full h-full object-cover" />
                            </div>
                          </div>

                          <div className="pt-7 px-4 pb-4 flex flex-col flex-1">
                            <h4 className="text-xs font-extrabold text-neutral-800 line-clamp-1 mb-1">{displayName}</h4>
                            {Number(seller.average_rating) > 0 && (
                              <div className="flex items-center space-x-1 mb-3">
                                <span className="text-[10px] font-extrabold text-primary-600">{Number(seller.average_rating).toFixed(1)}</span>
                                <svg className="w-3 h-3 text-secondary-500 fill-secondary-500" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-2 mt-auto border-t border-neutral-gray-100 pt-3">
                              <div className="text-center border-r border-neutral-gray-150">
                                <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Reviews</div>
                                <div className="font-extrabold text-neutral-800 text-xs mt-0.5">{seller.review_count}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Products</div>
                                <div className="font-extrabold text-neutral-800 text-xs mt-0.5">{seller.product_count}</div>
                              </div>
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Top Rated */}
              {topRatedProducts.length > 0 && (
                <div>
                  <h3 className="text-sm font-extrabold text-neutral-gray-900 mb-5 flex items-center space-x-2.5 uppercase tracking-wider">
                    <span className="w-1 h-5 bg-primary-600 rounded-full" />
                    <span>Top Rated Products</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {topRatedProducts.slice(0, 6).map((prod, idx) => (
                      <ProductCard key={`${prod.id}-${idx}`} product={prod} />
                    ))}
                  </div>
                </div>
              )}

              {/* New Arrivals */}
              {newArrivals.length > 0 && (
                <div className="bg-gradient-to-br from-secondary-50/20 via-neutral-white to-neutral-white p-5 md:p-6 shadow-sm">
                  <h3 className="text-sm font-extrabold text-neutral-gray-900 mb-5 flex items-center space-x-2.5 uppercase tracking-wider">
                    <span className="w-1 h-5 bg-secondary-600 rounded-full" />
                    <span>New Arrivals</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {newArrivals.map((prod, idx) => (
                      <ProductCard key={`${prod.id}-${idx}`} product={prod} />
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended */}
              {recommendedProducts.length > 0 && (
                <div>
                  <h3 className="text-sm font-extrabold text-neutral-gray-900 mb-5 flex items-center space-x-2.5 uppercase tracking-wider">
                    <span className="w-1 h-5 bg-primary-600 rounded-full" />
                    <span>Recommended Products</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {recommendedProducts.map((prod, idx) => (
                      <ProductCard key={`${prod.id}-${idx}`} product={prod} />
                    ))}
                  </div>
                </div>
              )}

              {/* Category Collections */}
              {categorySections.map((section, idx) => (
                <div key={`${section.category.id}-${idx}`} className="bg-gradient-to-br from-neutral-gray-50/65 via-neutral-white to-neutral-white border border-neutral-gray-200/35 p-5 md:p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-extrabold text-neutral-gray-900 flex items-center space-x-2.5 uppercase tracking-wider">
                      <span className="w-1 h-5 bg-primary-600 rounded-full" />
                      <span>{section.category.name}</span>
                    </h3>
                    <button
                      onClick={() => viewAllCategory(section.category)}
                      className="text-xs font-bold text-primary-600 hover:text-primary-800 flex items-center gap-0.5 transition-colors cursor-pointer"
                    >
                      <span>View All</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                  <ProductSlider products={section.products} categoryId={section.category.id} />
                </div>
              ))}

              {/* Footer Banner — uses server-prefetched data, no client fetch */}
              <FooterBanner initialBanners={initialFooterBanners} />
            </div>
          )}
        </main>
      </div>
      <Footer config={initialConfig} />
    </div>
  );
}
