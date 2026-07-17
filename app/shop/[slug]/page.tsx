'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, Product, Category, Brand } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Footer';
import ChatModal from '@/components/ChatModal';
import {
  Search, Package, MessageCircle,
  ChevronDown, ChevronUp, X, Loader2, ArrowLeft,
  SlidersHorizontal, Check, RotateCcw, Filter, BookOpen
} from 'lucide-react';

/* ─────────────────── helpers ─────────────────── */

function toProxyUrl(url?: any): string {
  if (!url) return '/placeholder.jpg';
  let s = typeof url === 'string' ? url : (url?.path || '');
  if (!s || s.endsWith('def.png')) return '/placeholder.jpg';
  let clean = s.replace(/^https?:\/\/[^/]+/, '');
  if (!clean.startsWith('/')) clean = '/' + clean;
  return clean.replace('storage/app/public', 'storage');
}

const CURRENCY = '৳';
const LIMIT = 30;

const SORT_OPTIONS = [
  { value: 'latest',   label: 'Latest' },
  { value: 'low-high', label: 'Price: Low → High' },
  { value: 'high-low', label: 'Price: High → Low' },
  { value: 'a-z',      label: 'Name: A → Z' },
  { value: 'z-a',      label: 'Name: Z → A' },
];

/* ─────────────────── skeletons ─────────────────── */

const ShopBannerSkeleton = () => (
  <div className="animate-pulse mb-6 space-y-4">
    <div className="w-full h-52 md:h-60 bg-neutral-gray-200 rounded-2xl" />
    <div className="bg-neutral-white border border-neutral-gray-200/50 rounded-2xl p-4 flex gap-4">
      <div className="w-16 h-16 rounded-xl bg-neutral-gray-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-neutral-gray-200 rounded w-40" />
        <div className="h-3 bg-neutral-gray-100 rounded w-28" />
        <div className="h-3 bg-neutral-gray-100 rounded w-20" />
      </div>
    </div>
  </div>
);

const ProductSkeleton = () => (
  <div className="bg-neutral-white border border-neutral-gray-200/60 rounded-xl p-4 flex flex-col items-center text-center relative animate-pulse">
    <div className="w-36 h-36 bg-neutral-gray-100 rounded-lg mb-3" />
    <div className="h-4 bg-neutral-gray-100 rounded w-1/3 mb-2" />
    <div className="w-full space-y-1.5 mb-3">
      <div className="h-3 bg-neutral-gray-100 rounded w-5/6 mx-auto" />
      <div className="h-3 bg-neutral-gray-100 rounded w-2/3 mx-auto" />
    </div>
    <div className="h-5 bg-neutral-gray-100 rounded w-20 mt-auto" />
  </div>
);

/* ─────────────────── page component ─────────────────── */

export default function ShopViewPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { isLoggedIn } = useAppStore();

  const [shopInfo, setShopInfo]       = useState<any>(null);
  const [shopLoading, setShopLoading] = useState(true);
  const [shopError, setShopError]     = useState(false);

  const [products, setProducts]       = useState<Product[]>([]);
  const [prodLoading, setProdLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore]         = useState(true);
  const [totalCount, setTotalCount]   = useState(0);
  const pageRef = useRef(1);

  // Search & Filter metadata
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [publishers, setPublishers] = useState<any[]>([]);

  // Selected filter states
  const [search, setSearch]           = useState('');
  const [sortBy, setSortBy]           = useState('latest');
  const [productType, setProductType] = useState<'all' | 'physical' | 'digital'>('all');
  const [selectedCats, setSelectedCats] = useState<number[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const [selectedPublishers, setSelectedPublishers] = useState<number[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  // Category relationships
  const [childToParent, setChildToParent] = useState<Record<number, number>>({});
  const [parentToChildren, setParentToChildren] = useState<Record<number, number[]>>({});
  const [expandedCats, setExpandedCats] = useState<Record<number, boolean>>({});

  const [openSection, setOpenSection] = useState<Record<string, boolean>>({
    type: true,
    sort: true,
    price: true,
    categories: true,
    brands: true,
    publishers: false,
    authors: false,
  });

  const sentinelRef = useRef<HTMLDivElement>(null);

  // Fetch filter metadata on mount
  useEffect(() => {
    let active = true;
    api.getCategories().then((data) => { if (active) setCategories(data); }).catch(() => {});
    api.getBrands().then((data) => { if (active) setBrands(data); }).catch(() => {});
    api.getAuthors().then((data) => { if (active) setAuthors(data); }).catch(() => {});
    api.getPublishingHouses().then((data) => { if (active) setPublishers(data); }).catch(() => {});
    return () => { active = false; };
  }, []);

  // Set up child-to-parent category mappings
  useEffect(() => {
    if (categories.length > 0) {
      const childMap: Record<number, number> = {};
      const parentMap: Record<number, number[]> = {};

      const traverse = (cat: Category, parentId?: number) => {
        if (parentId !== undefined) {
          childMap[cat.id] = parentId;
        }

        const descendants: number[] = [];
        const collectDescendants = (c: Category) => {
          if (c.childes) {
            c.childes.forEach(child => {
              descendants.push(child.id);
              collectDescendants(child);
            });
          }
        };
        collectDescendants(cat);
        parentMap[cat.id] = descendants;

        if (cat.childes) {
          cat.childes.forEach(child => traverse(child, cat.id));
        }
      };

      categories.forEach(cat => traverse(cat));
      setChildToParent(childMap);
      setParentToChildren(parentMap);
    }
  }, [categories]);

  /* fetch shop info */
  useEffect(() => {
    if (!slug) return;
    setShopLoading(true);
    api.getSellerInfo(slug as string)
      .then(data => setShopInfo(data))
      .catch(() => setShopError(true))
      .finally(() => setShopLoading(false));
  }, [slug]);

  /* fetch / refresh products */
  const fetchProducts = useCallback(async (reset: boolean) => {
    if (!slug) return;
    const page = reset ? 1 : pageRef.current;
    if (reset) {
      setProdLoading(true);
      setProducts([]);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    try {
      // Scoped products fetch from the vendor endpoint (supports search, categories, brands, author, publishing house, type)
      const raw = await api.getVendorProductsPaginated({
        slug: slug as string,
        limit: LIMIT,
        offset: page,
        search,
        category: selectedCats,
        brand_ids: selectedBrands,
        product_type: productType,
        publishing_houses: selectedPublishers,
        product_authors: selectedAuthors
      });

      let list = raw.products;
      let total = raw.total_size || list.length;

      // Handle client-side price range filtering
      const priceMinVal = minPrice ? Number(minPrice) : undefined;
      const priceMaxVal = maxPrice ? Number(maxPrice) : undefined;
      if (priceMinVal !== undefined || priceMaxVal !== undefined) {
        list = list.filter(prod => {
          const price = prod.unit_price;
          if (priceMinVal !== undefined && price < priceMinVal) return false;
          if (priceMaxVal !== undefined && price > priceMaxVal) return false;
          return true;
        });
      }

      // Handle client-side sorting (matches search page options)
      if (sortBy === 'low-high') {
        list = [...list].sort((a, b) => a.unit_price - b.unit_price);
      } else if (sortBy === 'high-low') {
        list = [...list].sort((a, b) => b.unit_price - a.unit_price);
      } else if (sortBy === 'a-z') {
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortBy === 'z-a') {
        list = [...list].sort((a, b) => b.name.localeCompare(a.name));
      } else if (sortBy === 'latest') {
        list = [...list].sort((a, b) => b.id - a.id);
      }

      if (reset) {
        setProducts(list);
        pageRef.current = 2;
      } else {
        setProducts(prev => [...prev, ...list]);
        pageRef.current = page + 1;
      }
      setTotalCount(total);
      setHasMore(raw.products.length >= LIMIT);
    } catch (err) {
      console.error('Failed to load shop products', err);
      setHasMore(false);
    } finally {
      setProdLoading(false);
      setLoadingMore(false);
    }
  }, [slug, search, sortBy, productType, selectedCats, selectedBrands, selectedPublishers, selectedAuthors, minPrice, maxPrice]);

  useEffect(() => { fetchProducts(true); }, [fetchProducts]);

  /* IntersectionObserver */
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore && !prodLoading) {
          fetchProducts(false);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, prodLoading, fetchProducts]);

  /* derived */
  const shop       = shopInfo?.shop || shopInfo || {};
  const sellerId   = Number(shop?.id ?? shopInfo?.id ?? 0);
  const shopName   = shop?.name || shopInfo?.name || 'Shop';
  const avgRating  = Number(shopInfo?.average_rating ?? 0);
  const totalReview = Number(shopInfo?.total_review ?? 0);
  const totalOrder = Number(shopInfo?.total_order ?? 0);
  const minOrderAmt = Number(shop?.minimum_order_amount ?? 0);
  const isVendor   = shopInfo?.author_type !== 'admin';
  const bannerImg  = toProxyUrl(shop?.banner_full_url?.path ?? shop?.banner_full_url ?? null);
  const logoImg    = toProxyUrl(shop?.image_full_url?.path ?? shop?.image_full_url ?? shopInfo?.image_full_url?.path ?? null);
  const isTempClose = shop?.temporary_close === 1;
  const isVacation  = shop?.vacation_status === 1;
  const shopClosed  = isTempClose || isVacation;

  const isDigitalSectionVisible = productType === 'digital';

  const toggleSection = (sec: string) => {
    setOpenSection((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const toggleCatExpand = (id: number) => {
    setExpandedCats((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleCat = (id: number) => {
    setSelectedCats((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        const children = parentToChildren[id] || [];
        return prev.filter((c) => c !== id && !children.includes(c));
      } else {
        const toAdd = [id];
        let currentId = id;
        while (childToParent[currentId] !== undefined) {
          const parentId = childToParent[currentId];
          if (!prev.includes(parentId) && !toAdd.includes(parentId)) {
            toAdd.push(parentId);
          }
          currentId = parentId;
        }
        return [...prev, ...toAdd];
      }
    });
  };

  const handleToggleBrand = (id: number) => {
    setSelectedBrands(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  const handleTogglePublisher = (id: number) => {
    setSelectedPublishers(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleToggleAuthor = (id: number) => {
    setSelectedAuthors(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const applyPriceFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(true);
  };

  const clearAllFilters = () => {
    setProductType('all');
    setSortBy('latest');
    setMinPrice('');
    setMaxPrice('');
    setSelectedCats([]);
    setSelectedBrands([]);
    setSelectedPublishers([]);
    setSelectedAuthors([]);
  };

  const renderCategoryItem = (cat: Category, depth = 0) => {
    const checked = selectedCats.includes(cat.id);
    const hasChildren = cat.childes && cat.childes.length > 0;
    const isExpanded = expandedCats[cat.id];

    return (
      <div key={cat.id} className="flex flex-col">
        <div
          className="flex items-center justify-between text-xs font-bold text-neutral-gray-600 hover:text-neutral-gray-900 select-none py-1 group w-full"
          style={{ paddingLeft: `${depth * 14}px` }}
        >
          <button
            type="button"
            onClick={() => handleToggleCat(cat.id)}
            className="flex items-center gap-2.5 text-left truncate flex-1 cursor-pointer"
          >
            <div className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all duration-200 shrink-0 ${
              checked
                ? 'bg-primary-600 border-primary-600 text-neutral-white scale-105'
                : 'border-neutral-gray-300 bg-neutral-white group-hover:border-primary-400'
            }`}>
              {checked && <Check size={11} strokeWidth={3.5} />}
            </div>
            <span className={`truncate transition-all duration-200 ${checked ? 'text-primary-600 font-extrabold' : 'group-hover:translate-x-0.5'}`}>
              {cat.name}
            </span>
          </button>

          {hasChildren && (
            <button
              type="button"
              onClick={() => toggleCatExpand(cat.id)}
              className="p-1 hover:bg-neutral-gray-100 rounded text-neutral-gray-400 hover:text-neutral-gray-600 cursor-pointer shrink-0 transition-colors"
            >
              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="flex flex-col border-l border-neutral-gray-200/50 ml-[7px] my-0.5">
            {cat.childes!.map(child => renderCategoryItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full min-h-[calc(100vh-65px)] overflow-y-auto bg-neutral-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-primary-600 transition-colors mb-4 cursor-pointer">
          <ArrowLeft size={14} /> Back
        </button>

        {/* Banner & Info */}
        {shopLoading ? (
          <ShopBannerSkeleton />
        ) : shopError ? (
          <div className="text-center py-16 text-neutral-600">
            <p className="font-semibold mb-2">Shop not found.</p>
            <button
              onClick={() => router.push('/')}
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-800 text-neutral-white rounded-lg text-sm font-semibold cursor-pointer">
              Go Home
            </button>
          </div>
        ) : (
          /* ── Banner + Overlapping Info Card ─────────────────────── */
          <div className="mb-6 relative">

            {/* Wide banner */}
            <div className="relative w-full h-44 md:h-56 rounded-2xl overflow-visible border border-neutral-gray-200/60 shadow-sm bg-[#e8ecf0]">

              {/* Banner image or placeholder */}
              <div className="w-full h-full rounded-2xl overflow-hidden">
                {bannerImg !== '/placeholder.jpg' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={bannerImg} alt={shopName} className="w-full h-full object-cover" />
                ) : (
                  /* Placeholder icon centered — matches screenshot */
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-20 h-20 opacity-30"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                      <path d="M16 10l2-2"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Status badge */}
              {(isTempClose || isVacation) && (
                <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow z-10">
                  {isTempClose ? 'Temporary OFF' : 'Closed Now'}
                </span>
              )}

              {/* ── Info card — overlapping bottom-left of banner ── */}
              <div className="absolute bottom-0 left-4 translate-y-1/2 z-10">
                <div className="bg-white rounded-xl shadow-md border border-neutral-gray-200/60 px-3 py-2.5 flex items-center gap-3 min-w-[260px] max-w-xs">

                  {/* Shop logo / icon */}
                  <div className="shrink-0 w-10 h-10 rounded-lg overflow-hidden border border-neutral-gray-200 bg-neutral-gray-100 flex items-center justify-center">
                    {logoImg !== '/placeholder.jpg' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoImg} alt={shopName} className="w-full h-full object-cover" />
                    ) : (
                      /* Store building icon — matches screenshot */
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l1-5h16l1 5"/>
                        <path d="M3 9a2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0 2 2 2 2 0 0 0 2-2"/>
                        <path d="M5 11v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9"/>
                        <rect x="9" y="14" width="6" height="6" rx="0.5"/>
                      </svg>
                    )}
                  </div>

                  {/* Rating + orders */}
                  <div className="flex-1 min-w-0">
                    {/* Stars row */}
                    <div className="flex items-center gap-1.5">
                      {/* 5 stars — filled based on avgRating */}
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(i => (
                          <svg key={i} className={`w-3 h-3 ${i <= Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300 fill-neutral-200'}`} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        ))}
                      </div>
                      <span className="text-neutral-400 text-[10px]">|</span>
                      <span className="text-[11px] font-semibold text-neutral-600">{totalReview} Reviews</span>
                    </div>
                    {/* Orders */}
                    <p className="text-[11px] text-neutral-500 mt-0.5 font-medium">{totalOrder} Orders</p>
                  </div>

                  {/* Chat button ─ solid green */}
                  {isVendor && (
                    isLoggedIn ? (
                      <button
                        type="button"
                        onClick={() => {
                          const wrapper = document.getElementById('shop-hidden-chat-wrapper');
                          const btn = wrapper?.querySelector('button');
                          btn?.click();
                        }}
                        className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer shadow-sm">
                        <MessageCircle size={13} />
                        Chat
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => router.push('/login')}
                        className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer shadow-sm">
                        <MessageCircle size={13} />
                        Chat
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Spacer so the overlapping card doesn't collide with content below */}
            <div className="mt-10" />

            {/* Render ChatModal here at the banner root level (outside the transformed info card) */}
            {isVendor && isLoggedIn && (
              <span id="shop-hidden-chat-wrapper">
                <ChatModal
                  type="seller"
                  id={sellerId}
                  title={shopName}
                  subtitle="Vendor"
                  triggerLabel="Chat"
                  triggerClassName="hidden"
                />
              </span>
            )}
          </div>
        )}

        {/* ── Filters + Products Grid Layout ─────────────────────── */}
        {!shopLoading && !shopError && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-8">
            
            {/* Left Filter Sidebar */}
            <aside className="lg:col-span-3 bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-6 space-y-6 shadow-xl shadow-neutral-gray-100/30 sticky top-6">
              <div className="flex items-center justify-between border-b border-neutral-gray-200/50 pb-4">
                <div className="flex items-center gap-2.5 font-extrabold text-sm text-neutral-gray-900 tracking-tight">
                  <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                    <SlidersHorizontal size={16} />
                  </div>
                  <span>Store Filters</span>
                </div>
                {(productType !== 'all' || sortBy !== 'latest' || minPrice || maxPrice || selectedCats.length > 0 || selectedBrands.length > 0 || selectedPublishers.length > 0 || selectedAuthors.length > 0) && (
                  <button 
                    onClick={clearAllFilters}
                    className="text-[11px] text-primary-600 hover:text-primary-800 font-bold flex items-center gap-1 cursor-pointer transition-all duration-300 hover:scale-105 bg-primary-50 px-2.5 py-1.5 rounded-xl border border-primary-100"
                  >
                    <RotateCcw size={11} /> Reset
                  </button>
                )}
              </div>

              {/* 1. Product Type */}
              <div className="border-b border-neutral-gray-200/40 pb-5">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-neutral-gray-400 mb-3">
                  <span>Product Type</span>
                </div>
                <div className="grid grid-cols-3 gap-1 bg-neutral-gray-100/80 p-1 rounded-2xl border border-neutral-gray-200/40">
                  {[
                    { label: 'All', value: 'all' },
                    { label: 'Physical', value: 'physical' },
                    { label: 'Digital', value: 'digital' }
                  ].map((opt) => {
                    const active = productType === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setProductType(opt.value as any)}
                        className={`py-2 text-[11px] font-bold rounded-xl transition-all duration-300 cursor-pointer ${
                          active 
                            ? 'bg-neutral-white text-primary-600 shadow-sm border border-neutral-gray-200/30' 
                            : 'text-neutral-gray-500 hover:text-neutral-gray-900'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Sort Order */}
              <div className="border-b border-neutral-gray-200/40 pb-5">
                <button 
                  type="button"
                  onClick={() => toggleSection('sort')} 
                  className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-neutral-gray-400 mb-2.5 cursor-pointer text-left"
                >
                  <span>Sort By</span>
                  {openSection.sort ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {openSection.sort && (
                  <div className="flex flex-col gap-1.5 mt-1">
                    {[
                      { label: 'Latest / Newest', value: 'latest' },
                      { label: 'Price: Low to High', value: 'low-high' },
                      { label: 'Price: High to Low', value: 'high-low' },
                      { label: 'Name: A to Z', value: 'a-z' },
                      { label: 'Name: Z to A', value: 'z-a' }
                    ].map((opt) => {
                      const active = sortBy === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setSortBy(opt.value as any)}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border flex items-center justify-between cursor-pointer ${
                            active
                              ? 'bg-primary-50/40 border-primary-200/60 text-primary-600'
                              : 'border-transparent text-neutral-gray-600 hover:bg-neutral-gray-50'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {active && <Check size={12} strokeWidth={3} className="text-primary-600" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. Price Filter */}
              <div className="border-b border-neutral-gray-200/40 pb-5">
                <button 
                  type="button"
                  onClick={() => toggleSection('price')} 
                  className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-neutral-gray-400 mb-2.5 cursor-pointer text-left"
                >
                  <span>Price Range</span>
                  {openSection.price ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {openSection.price && (
                  <form onSubmit={applyPriceFilter} className="space-y-3 mt-1">
                    <div className="flex items-center gap-2">
                      <div className="relative w-full">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-gray-400">৳</span>
                        <input
                          type="number"
                          placeholder="Min"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="w-full pl-6 pr-2.5 py-2 border border-neutral-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600 bg-neutral-gray-50/30"
                        />
                      </div>
                      <span className="text-neutral-gray-400 text-xs font-medium">-</span>
                      <div className="relative w-full">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-gray-400">৳</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="w-full pl-6 pr-2.5 py-2 border border-neutral-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600 bg-neutral-gray-50/30"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-primary-600 hover:bg-primary-800 text-neutral-white text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-primary-600/10 hover:-translate-y-0.5"
                    >
                      <Filter size={12} /> Apply Price Range
                    </button>
                  </form>
                )}
              </div>

              {/* 4. Categories list */}
              <div className="border-b border-neutral-gray-200/40 pb-5">
                <button 
                  type="button"
                  onClick={() => toggleSection('categories')} 
                  className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-neutral-gray-400 mb-2.5 cursor-pointer text-left"
                >
                  <span className="flex items-center gap-1.5">
                    Categories
                    {selectedCats.length > 0 && (
                      <span className="bg-primary-100 text-primary-600 text-[10px] px-1.5 py-0.5 rounded-full font-extrabold">{selectedCats.length}</span>
                    )}
                  </span>
                  {openSection.categories ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {openSection.categories && (
                  <div className="flex flex-col gap-1 mt-1 max-h-64 overflow-y-auto scrollbar-none pr-1">
                    {categories.map((cat) => renderCategoryItem(cat))}
                  </div>
                )}
              </div>

              {/* 5. Brands list */}
              <div className="border-b border-neutral-gray-200/40 pb-5">
                <button 
                  type="button"
                  onClick={() => toggleSection('brands')} 
                  className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-neutral-gray-400 mb-2.5 cursor-pointer text-left"
                >
                  <span className="flex items-center gap-1.5">
                    Brands
                    {selectedBrands.length > 0 && (
                      <span className="bg-primary-100 text-primary-600 text-[10px] px-1.5 py-0.5 rounded-full font-extrabold">{selectedBrands.length}</span>
                    )}
                  </span>
                  {openSection.brands ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {openSection.brands && (
                  <div className="flex flex-col gap-2 mt-1 max-h-48 overflow-y-auto scrollbar-none pr-1">
                    {brands.map((b) => {
                      const checked = selectedBrands.includes(b.id);
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => handleToggleBrand(b.id)}
                          className="flex items-center gap-2.5 text-xs font-bold text-neutral-gray-600 hover:text-neutral-gray-900 cursor-pointer select-none text-left w-full py-0.5 group"
                        >
                          <div className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all duration-200 shrink-0 ${
                            checked
                              ? 'bg-primary-600 border-primary-600 text-neutral-white scale-105'
                              : 'border-neutral-gray-300 bg-neutral-white group-hover:border-primary-400'
                          }`}>
                            {checked && <Check size={11} strokeWidth={3.5} />}
                          </div>
                          <span className={`truncate transition-all duration-200 ${checked ? 'text-primary-600 translate-x-0.5' : 'group-hover:translate-x-0.5'}`}>
                            {b.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 6. Publishers (digital-only) */}
              {isDigitalSectionVisible && publishers.length > 0 && (
                <div className="border-b border-neutral-gray-200/40 pb-5">
                  <button 
                    type="button"
                    onClick={() => toggleSection('publishers')} 
                    className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-neutral-gray-400 mb-2.5 cursor-pointer text-left"
                  >
                    <span className="flex items-center gap-1.5">
                      Publishers
                      {selectedPublishers.length > 0 && (
                        <span className="bg-primary-100 text-primary-600 text-[10px] px-1.5 py-0.5 rounded-full font-extrabold">{selectedPublishers.length}</span>
                      )}
                    </span>
                    {openSection.publishers ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {openSection.publishers && (
                    <div className="flex flex-col gap-2 mt-1 max-h-48 overflow-y-auto scrollbar-none pr-1">
                      {publishers.map((p) => {
                        const checked = selectedPublishers.includes(p.id);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleTogglePublisher(p.id)}
                            className="flex items-center gap-2.5 text-xs font-bold text-neutral-gray-600 hover:text-neutral-gray-900 cursor-pointer select-none text-left w-full py-0.5 group"
                          >
                            <div className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all duration-200 shrink-0 ${
                              checked
                                ? 'bg-primary-600 border-primary-600 text-neutral-white scale-105'
                                : 'border-neutral-gray-300 bg-neutral-white group-hover:border-primary-400'
                            }`}>
                              {checked && <Check size={11} strokeWidth={3.5} />}
                            </div>
                            <span className={`truncate transition-all duration-200 ${checked ? 'text-primary-600 translate-x-0.5' : 'group-hover:translate-x-0.5'}`}>
                              {p.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 7. Authors (digital-only) */}
              {isDigitalSectionVisible && authors.length > 0 && (
                <div>
                  <button 
                    type="button"
                    onClick={() => toggleSection('authors')} 
                    className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-neutral-gray-400 mb-2.5 cursor-pointer text-left"
                  >
                    <span className="flex items-center gap-1.5">
                      Authors
                      {selectedAuthors.length > 0 && (
                        <span className="bg-primary-100 text-primary-600 text-[10px] px-1.5 py-0.5 rounded-full font-extrabold">{selectedAuthors.length}</span>
                      )}
                    </span>
                    {openSection.authors ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {openSection.authors && (
                    <div className="flex flex-col gap-2 mt-1 max-h-48 overflow-y-auto scrollbar-none pr-1">
                      {authors.map((a) => {
                        const checked = selectedAuthors.includes(a.id);
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => handleToggleAuthor(a.id)}
                            className="flex items-center gap-2.5 text-xs font-bold text-neutral-gray-600 hover:text-neutral-gray-900 cursor-pointer select-none text-left w-full py-0.5 group"
                          >
                            <div className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all duration-200 shrink-0 ${
                              checked
                                ? 'bg-primary-600 border-primary-600 text-neutral-white scale-105'
                                : 'border-neutral-gray-300 bg-neutral-white group-hover:border-primary-400'
                            }`}>
                              {checked && <Check size={11} strokeWidth={3.5} />}
                            </div>
                            <span className={`truncate transition-all duration-200 ${checked ? 'text-primary-600 translate-x-0.5' : 'group-hover:translate-x-0.5'}`}>
                              {a.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </aside>

            {/* Right Products list */}
            <section className="lg:col-span-9 flex flex-col gap-6">
              
              {/* Filter bar & Search */}
              <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  <input
                    id="shop-search"
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search products in this store…"
                    className="w-full pl-9 pr-8 py-2.5 border border-neutral-gray-200 rounded-xl text-xs font-semibold bg-neutral-white focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all"
                  />
                  {search && (
                    <button onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer">
                      <X size={13} />
                    </button>
                  )}
                </div>

                {!prodLoading && (
                  <span className="text-[11px] font-bold text-neutral-500 ml-auto shrink-0">
                    {totalCount > 0 ? `${totalCount} products` : `${products.length} products`}
                  </span>
                )}
              </div>

              {/* Products Grid */}
              {prodLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[...Array(12)].map((_, i) => <ProductSkeleton key={i} />)}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20 bg-neutral-white border border-neutral-gray-200/40 rounded-2xl p-6 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-neutral-gray-55/10 flex items-center justify-center text-neutral-gray-500 mb-4 border border-neutral-gray-200/40">
                    <BookOpen size={24} />
                  </div>
                  <p className="text-neutral-gray-900 text-sm font-bold mb-1.5">No products found matching criteria.</p>
                  <p className="text-xs text-neutral-gray-600 max-w-[280px]">
                    Try clearing selected checkboxes, adjusting the price sliders, or changing your keywords.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {products.map((prod, idx) => (
                      <ProductCard key={`${prod.id}-${idx}`} product={prod} />
                    ))}
                  </div>

                  <div ref={sentinelRef} className="py-8 flex justify-center">
                    {loadingMore ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-neutral-400">
                        <Loader2 size={16} className="animate-spin text-primary-600" />
                        Loading more products…
                      </div>
                    ) : hasMore ? (
                      <span className="text-xs text-neutral-300">Scroll for more</span>
                    ) : (
                      <span className="text-xs font-bold text-neutral-400">You've seen all products</span>
                    )}
                  </div>
                </>
              )}
            </section>

          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}
