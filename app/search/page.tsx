'use client';

import React, { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { api, Product, Category, Brand } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import {
  ChevronRight,
  Loader2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Check,
  RotateCcw,
  BookOpen,
  Filter
} from 'lucide-react';
import Footer from '@/components/Footer';

const ProductSkeleton = () => (
  <div className="bg-neutral-white border border-neutral-gray-200/60 rounded-xl p-4 flex flex-col items-center text-center relative animate-pulse">
    <div className="w-36 h-36 bg-neutral-gray-200 rounded-lg mb-3 flex items-center justify-center animate-pulse" />
    <div className="h-5 bg-neutral-gray-200 rounded w-1/3 mb-2.5 animate-pulse" />
    <div className="w-full flex flex-col items-center space-y-1.5 mb-2.5 min-h-[40px]">
      <div className="h-3.5 bg-neutral-gray-200 rounded w-5/6 animate-pulse" />
      <div className="h-3.5 bg-neutral-gray-200 rounded w-2/3 animate-pulse" />
    </div>
    <div className="h-3 bg-neutral-gray-200 rounded w-1/4 mb-3.5 animate-pulse" />
    <div className="h-5 bg-neutral-gray-200 rounded w-16 mt-auto animate-pulse" />
  </div>
);

export function SearchPageContent({
  defaultDataFrom = '',
  defaultOfferType = '',
}: {
  defaultDataFrom?: string;
  defaultOfferType?: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const paramCategory = searchParams.get('category') || '';
  const paramBrand = searchParams.get('brand') || '';

  // Read categories from global store (populated by Sidebar on first load)
  const { categories: storeCategories, categoriesLoaded, setCategories: setStoreCategories } = useAppStore();

  // Filter lists fetched on mount
  const [categories, setCategories] = useState<Category[]>(storeCategories);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [publishers, setPublishers] = useState<any[]>([]);

  // Selected filter states
  const [productType, setProductType] = useState<'all' | 'physical' | 'digital'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'low-high' | 'high-low' | 'a-z' | 'z-a'>('latest');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedCats, setSelectedCats] = useState<number[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const [selectedPublishers, setSelectedPublishers] = useState<number[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<number[]>([]);
  const [dataFrom, setDataFrom] = useState<string>(defaultDataFrom);
  const [offerType, setOfferType] = useState<string>(defaultOfferType);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [brandsLoading, setBrandsLoading] = useState(true);

  // child-to-parent traversal map
  const [childToParent, setChildToParent] = useState<Record<number, number>>({});

  // URL state persistence flag
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'filter' | 'sort' | null>(null);

  // Results & Loading
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalSize, setTotalSize] = useState(0);
  const [priceLimits, setPriceLimits] = useState({ min: 0, max: 2000 });

  // Pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Sidebar accordions
  const [openSection, setOpenSection] = useState<Record<string, boolean>>({
    type: true,
    sort: true,
    price: true,
    categories: true,
    brands: true,
    publishers: false,
    authors: false,
  });

  const toggleSection = (sec: string) => {
    setOpenSection((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  // Expandable category nodes state
  const [expandedCats, setExpandedCats] = useState<Record<number, boolean>>({});
  const toggleCatExpand = (id: number) => {
    setExpandedCats((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Build mapping of child category to parent category, and parent category to child categories
  const [parentToChildren, setParentToChildren] = useState<Record<number, number[]>>({});

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

  // Recursive category item renderer
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
            <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all duration-200 shrink-0 ${
              checked
                ? 'bg-primary-600 border-primary-600 text-neutral-white scale-105'
                : 'border-neutral-gray-300 bg-neutral-white group-hover:border-primary-400'
            }`}>
              {checked && <Check size={9} strokeWidth={4} />}
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

  // Fetch filter metadata lists on mount
  useEffect(() => {
    let active = true;

    // Use cached categories from store, otherwise fetch and cache them
    const fetchCats = categoriesLoaded
      ? Promise.resolve(storeCategories)
      : api.getCategories().then((data) => { setStoreCategories(data); return data; });

    Promise.allSettled([
      fetchCats,
      api.getBrands(),
      api.getAuthors(),
      api.getPublishingHouses(),
    ]).then(([catsRes, brandsRes, authorsRes, publishersRes]) => {
      if (!active) return;
      if (catsRes.status === 'fulfilled') setCategories(catsRes.value);
      if (brandsRes.status === 'fulfilled') setBrands(brandsRes.value);
      if (authorsRes.status === 'fulfilled') setAuthors(authorsRes.value);
      if (publishersRes.status === 'fulfilled') setPublishers(publishersRes.value);
      setCategoriesLoading(false);
      setBrandsLoading(false);
    });

    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 1. Initial Load filters from URL params
  useEffect(() => {
    const type = searchParams.get('type') as any;
    if (type) setProductType(type);

    const sort = searchParams.get('sort') as any;
    if (sort) setSortBy(sort);

    const min = searchParams.get('min_price');
    if (min) setMinPrice(min);

    const max = searchParams.get('max_price');
    if (max) setMaxPrice(max);

    const cats = searchParams.get('category_ids');
    if (cats) setSelectedCats(cats.split(',').map(Number));

    const brandsParam = searchParams.get('brand_ids');
    if (brandsParam) setSelectedBrands(brandsParam.split(',').map(Number));

    const publishersParam = searchParams.get('publisher_ids');
    if (publishersParam) setSelectedPublishers(publishersParam.split(',').map(Number));

    const authorsParam = searchParams.get('author_ids');
    if (authorsParam) setSelectedAuthors(authorsParam.split(',').map(Number));

    const df = searchParams.get('data_from') || defaultDataFrom;
    if (df) setDataFrom(df);

    const ot = searchParams.get('offer_type') || defaultOfferType;
    if (ot) setOfferType(ot);

    setIsInitialized(true);
  }, [defaultDataFrom, defaultOfferType]);

  // Update initial selected filters from search category/brand slug path params (with fallback)
  useEffect(() => {
    if (isInitialized && categories.length && paramCategory && !searchParams.get('category_ids')) {
      const match = categories.find(c => c.slug === paramCategory);
      if (match) setSelectedCats([match.id]);
    }
  }, [isInitialized, categories, paramCategory]);

  useEffect(() => {
    if (isInitialized && brands.length && paramBrand && !searchParams.get('brand_ids')) {
      const match = brands.find(b => (b as any).slug === paramBrand || b.name.toLowerCase().replace(/\s+/g, '-') === paramBrand.toLowerCase());
      if (match) setSelectedBrands([match.id]);
    }
  }, [isInitialized, brands, paramBrand]);

  // 2. Serialize and Persist all filters to URL params on state change
  useEffect(() => {
    if (!isInitialized) return;
    const params = new URLSearchParams(window.location.search);

    const setOrDelete = (key: string, value: any) => {
      if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        params.delete(key);
      } else if (Array.isArray(value)) {
        params.set(key, value.join(','));
      } else {
        params.set(key, String(value));
      }
    };

    setOrDelete('type', productType);
    setOrDelete('sort', sortBy);
    setOrDelete('min_price', minPrice);
    setOrDelete('max_price', maxPrice);
    setOrDelete('category_ids', selectedCats);
    setOrDelete('brand_ids', selectedBrands);
    setOrDelete('publisher_ids', selectedPublishers);
    setOrDelete('author_ids', selectedAuthors);
    setOrDelete('data_from', dataFrom);
    setOrDelete('offer_type', offerType);

    router.replace(`/search?${params.toString()}`, { scroll: false });
  }, [isInitialized, productType, sortBy, minPrice, maxPrice, selectedCats, selectedBrands, selectedPublishers, selectedAuthors, dataFrom, offerType]);

  // Reset pagination state when filters or search query change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setLoadingMore(false);
  }, [query, productType, sortBy, selectedCats, selectedBrands, selectedPublishers, selectedAuthors, dataFrom, offerType]);

  // Query API whenever filters or query change
  useEffect(() => {
    if (!isInitialized) return;
    let active = true;
    setLoading(true);

    const filterParams = {
      search: query,
      category: selectedCats,
      brand: selectedBrands,
      product_type: productType,
      sort_by: sortBy,
      price_min: minPrice ? Number(minPrice) : undefined,
      price_max: maxPrice ? Number(maxPrice) : undefined,
      publishing_houses: selectedPublishers,
      product_authors: selectedAuthors,
      limit: 30,
      offset: 1,
      data_from: dataFrom || undefined,
      offer_type: offerType || undefined,
    };

    api.getProductsFilter(filterParams)
      .then((res) => {
        if (!active) return;
        setProducts(res.products);
        setTotalSize(res.total_size);
        if (res.products.length < 30) {
          setHasMore(false);
        }
        if (res.max_price > 0) {
          setPriceLimits({ min: res.min_price, max: res.max_price });
        }
      })
      .catch((err) => {
        console.error('Filter query failed', err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [isInitialized, query, productType, sortBy, selectedCats, selectedBrands, selectedPublishers, selectedAuthors, dataFrom, offerType]);

  const applyPriceFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPage(1);
    setHasMore(true);
    api.getProductsFilter({
      search: query,
      category: selectedCats,
      brand: selectedBrands,
      product_type: productType,
      sort_by: sortBy,
      price_min: minPrice ? Number(minPrice) : undefined,
      price_max: maxPrice ? Number(maxPrice) : undefined,
      publishing_houses: selectedPublishers,
      product_authors: selectedAuthors,
      limit: 30,
      offset: 1,
      data_from: dataFrom || undefined,
      offer_type: offerType || undefined,
    }).then((res) => {
      setProducts(res.products);
      setTotalSize(res.total_size);
      if (res.products.length < 30) {
        setHasMore(false);
      }
      setIsMobileFilterOpen(false);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  // Intersection Observer for Infinite Scroll Lazy Loading
  useEffect(() => {
    if (!isInitialized || !hasMore || loadingMore || loading) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadNextPage();
      }
    }, { threshold: 0.1 });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [isInitialized, hasMore, loadingMore, loading, page, query, productType, sortBy, selectedCats, selectedBrands, selectedPublishers, selectedAuthors, minPrice, maxPrice, dataFrom, offerType]);

  const loadNextPage = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const filterParams = {
        search: query,
        category: selectedCats,
        brand: selectedBrands,
        product_type: productType,
        sort_by: sortBy,
        price_min: minPrice ? Number(minPrice) : undefined,
        price_max: maxPrice ? Number(maxPrice) : undefined,
        publishing_houses: selectedPublishers,
        product_authors: selectedAuthors,
        limit: 30,
        offset: nextPage,
        data_from: dataFrom || undefined,
        offer_type: offerType || undefined,
      };
      const res = await api.getProductsFilter(filterParams);
      if (res.products.length === 0) {
        setHasMore(false);
      } else {
        setProducts((prev) => [...prev, ...res.products]);
        setPage(nextPage);
        if (res.products.length < 30) {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error('Load more search products failed', err);
    } finally {
      setLoadingMore(false);
    }
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
    setDataFrom('');
    setOfferType('');
  };

  const handleToggleCat = (id: number) => {
    setSelectedCats((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        // Unchecking parent: remove this category and all its children/grandchildren
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

  const isDigitalSectionVisible = productType === 'digital';
  const activeFilterLabel = dataFrom === 'best-selling' ? 'Best Selling' : dataFrom === 'top-rated' ? 'Top Rated' : dataFrom === 'most-favorite' ? 'Most Favorite' : 'Default';
  const activeSortLabel = sortBy === 'low-high' ? 'Price: Low-High' : sortBy === 'high-low' ? 'Price: High-Low' : sortBy === 'a-z' ? 'Name: A-Z' : sortBy === 'z-a' ? 'Name: Z-A' : 'Latest';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

      {/* Mobile Backdrop */}
      {isMobileFilterOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-gray-900/40 backdrop-blur-xs lg:hidden animate-fade-in"
          onClick={() => setIsMobileFilterOpen(false)}
        />
      )}

      <aside
        className={`bg-neutral-white border border-neutral-gray-200/50 rounded-r-3xl lg:rounded-3xl p-6 space-y-6 shadow-xl shadow-neutral-gray-100/30 transition-transform duration-300
          fixed lg:sticky top-0 lg:top-6 left-0 h-screen lg:h-auto z-50 lg:z-auto w-80 lg:w-auto lg:col-span-3 lg:translate-x-0
          ${isMobileFilterOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
          overflow-y-auto lg:overflow-visible
        `}
      >

        <div className="flex items-center justify-between border-b border-neutral-gray-200/50 pb-4">
          <div className="flex items-center gap-2.5 font-extrabold text-sm text-neutral-gray-900 tracking-tight">
            <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
              <SlidersHorizontal size={16} />
            </div>
            <span>Search Filters</span>
          </div>
          <div className="flex items-center gap-2">
            {(productType !== 'all' || sortBy !== 'latest' || minPrice || maxPrice || selectedCats.length > 0 || selectedBrands.length > 0 || selectedPublishers.length > 0 || selectedAuthors.length > 0) && (
              <button
                onClick={clearAllFilters}
                className="text-[11px] text-primary-600 hover:text-primary-800 font-bold flex items-center gap-1 cursor-pointer transition-all duration-300 hover:scale-105 bg-primary-50 px-2.5 py-1.5 rounded-xl border border-primary-100"
              >
                <RotateCcw size={11} /> Reset
              </button>
            )}
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="lg:hidden text-neutral-gray-500 hover:text-red-500 p-1.5 hover:bg-neutral-gray-100 rounded-xl cursor-pointer transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 1. Product Type Segmented Control */}
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
            <form onSubmit={applyPriceFilter} className="space-y-4 mt-1">
              <div className="space-y-2">
                <input
                  type="range"
                  min={0}
                  max={priceLimits.max || 2000}
                  value={maxPrice ? Number(maxPrice) : (priceLimits.max || 2000)}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full h-1.5 bg-neutral-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600 focus:outline-none"
                />
                <div className="flex justify-between text-[10px] font-bold text-neutral-gray-400">
                  <span>৳0</span>
                  <span>৳{priceLimits.max || 2000}</span>
                </div>
              </div>

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
              {categoriesLoading ? (
                <div className="space-y-2.5 py-1">
                  <div className="h-4 bg-neutral-gray-200 rounded animate-pulse w-5/6" />
                  <div className="h-4 bg-neutral-gray-200 rounded animate-pulse w-2/3" />
                  <div className="h-4 bg-neutral-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-neutral-gray-200 rounded animate-pulse w-1/2" />
                  <div className="h-4 bg-neutral-gray-200 rounded animate-pulse w-2/3" />
                </div>
              ) : (
                categories.map((cat) => renderCategoryItem(cat))
              )}
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
              {brandsLoading ? (
                <div className="space-y-2.5 py-1">
                  <div className="h-4 bg-neutral-gray-200 rounded animate-pulse w-2/3" />
                  <div className="h-4 bg-neutral-gray-200 rounded animate-pulse w-5/6" />
                  <div className="h-4 bg-neutral-gray-200 rounded animate-pulse w-1/2" />
                  <div className="h-4 bg-neutral-gray-200 rounded animate-pulse w-3/4" />
                </div>
              ) : (
                brands.map((b) => {
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
                })
              )}
            </div>
          )}
        </div>

        {/* 6. Publishing Houses (digital-only) */}
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

      {/* =================================================================== */}
      <section className="lg:col-span-9 flex flex-col gap-6">
        {/* Dynamic header / breadcrumbs */}
        <div className="border-b border-neutral-gray-200/60 pb-4">
          <div className="flex flex-wrap items-center gap-y-1 gap-x-2 text-xs text-neutral-gray-600 mb-2">
            <span className="hover:text-primary-600 hover:underline cursor-pointer transition-colors" onClick={() => router.push('/')}>
              Home
            </span>
            <ChevronRight size={12} />
            <span className="hover:text-primary-600 hover:underline cursor-pointer transition-colors" onClick={() => router.push('/search')}>
              Catalog Search
            </span>
            {dataFrom && (
              <>
                <ChevronRight size={12} />
                <span className="font-semibold text-primary-600 capitalize">{dataFrom.replace(/-/g, ' ').replace(/_/g, ' ')}</span>
              </>
            )}
            {offerType && (
              <>
                <ChevronRight size={12} />
                <span className="font-semibold text-primary-600 capitalize">{offerType.replace(/_/g, ' ')}</span>
              </>
            )}
            {query && (
              <>
                <ChevronRight size={12} />
                <span className="font-semibold text-primary-600">"{query.replace(/_/g, ' ')}"</span>
              </>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-1">
            <div className="flex flex-col gap-1 min-w-0">
              <h2 className="text-base sm:text-xl font-bold text-neutral-gray-900 leading-snug break-words">
                {dataFrom === 'featured' ? 'Featured Products' :
                 dataFrom === 'latest' ? 'Latest Products' :
                 dataFrom === 'best-selling' ? 'Best Selling Products' :
                 dataFrom === 'top-rated' ? 'Top Rated Products' :
                 dataFrom === 'discounted_products' ? 'Discounted Products' :
                 offerType === 'clearance_sale' ? 'Flash Deals' :
                 query ? `Search Results for "${query}"` : 'All Catalog Products'}
              </h2>
              {!loading && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-gray-500">
                    {totalSize} items found
                  </span>
                  {(productType !== 'all' || sortBy !== 'latest' || minPrice || maxPrice || selectedCats.length > 0 || selectedBrands.length > 0 || selectedPublishers.length > 0 || selectedAuthors.length > 0 || dataFrom !== '' || offerType !== '') && (
                    <button
                      onClick={clearAllFilters}
                      className="text-[11px] text-primary-600 hover:text-primary-800 font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      • Reset Filters
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 w-full md:flex md:w-auto md:gap-2.5 whitespace-nowrap">
              {/* Mobile Filters Toggle Button */}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex lg:hidden items-center justify-center gap-2 bg-neutral-white border border-neutral-gray-200 hover:border-primary-600 rounded-xl px-3 py-2.5 shadow-sm cursor-pointer text-xs font-bold text-neutral-gray-800 hover:text-primary-600 transition-colors w-full md:w-auto"
              >
                <SlidersHorizontal size={14} className="text-primary-600" />
                <span>Filters</span>
              </button>

              {/* Filter By Dropdown */}
              <div className="relative w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'filter' ? null : 'filter')}
                  className="flex items-center justify-between gap-1.5 bg-neutral-white border border-neutral-gray-200 hover:border-primary-600 rounded-xl px-3 py-2.5 shadow-sm w-full md:w-auto cursor-pointer text-xs font-bold text-neutral-gray-800 transition-colors select-none"
                >
                  <span className="truncate">
                    <span className="text-neutral-gray-400 font-bold mr-1 hidden lg:inline">Filter By:</span>
                    {activeFilterLabel}
                  </span>
                  <ChevronDown size={12} className="text-neutral-gray-400" />
                </button>

                {activeDropdown === 'filter' && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                    <div className="flex flex-col absolute left-0 mt-1.5 w-40 bg-neutral-white border border-neutral-gray-200/60 rounded-2xl shadow-xl z-20 py-1.5 animate-scale-up">
                      {[
                        { label: 'Default', value: '' },
                        { label: 'Best Selling', value: 'best-selling' },
                        { label: 'Top Rated', value: 'top-rated' },
                        { label: 'Most Favorite', value: 'most-favorite' }
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setDataFrom(opt.value);
                            setActiveDropdown(null);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${
                            dataFrom === opt.value ? 'text-primary-600 bg-primary-50/60' : 'text-neutral-gray-700 hover:bg-neutral-gray-50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Sort By Dropdown */}
              <div className="relative w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'sort' ? null : 'sort')}
                  className="flex items-center justify-between gap-1.5 bg-neutral-white border border-neutral-gray-200 hover:border-primary-600 rounded-xl px-3 py-2.5 shadow-sm w-full md:w-auto cursor-pointer text-xs font-bold text-neutral-gray-800 transition-colors select-none"
                >
                  <span className="truncate">
                    <span className="text-neutral-gray-400 font-bold mr-1 hidden lg:inline">Sort By:</span>
                    {activeSortLabel}
                  </span>
                  <ChevronDown size={12} className="text-neutral-gray-400" />
                </button>

                {activeDropdown === 'sort' && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                    <div className="flex flex-col absolute right-0 mt-1.5 w-40 bg-neutral-white border border-neutral-gray-200/60 rounded-2xl shadow-xl z-20 py-1.5 animate-scale-up">
                      {[
                        { label: 'Latest', value: 'latest' },
                        { label: 'Price: Low-High', value: 'low-high' },
                        { label: 'Price: High-Low', value: 'high-low' },
                        { label: 'Name: A-Z', value: 'a-z' },
                        { label: 'Name: Z-A', value: 'z-a' }
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setSortBy(opt.value as any);
                            setActiveDropdown(null);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${
                            sortBy === opt.value ? 'text-primary-600 bg-primary-50/60' : 'text-neutral-gray-700 hover:bg-neutral-gray-50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          /* Grid Loading Skeletons */
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          /* Product Cards Layout */
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {products.map((prod, idx) => (
                <ProductCard key={`${prod.id}-${idx}`} product={prod} />
              ))}
            </div>
            {/* Sentinel div for loading more */}
            <div ref={loaderRef} className="h-4 w-full" />
            {loadingMore && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-4">
                {[...Array(6)].map((_, i) => (
                  <ProductSkeleton key={`load-more-skel-${i}`} />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* No Results View */
          <div className="text-center py-20 bg-neutral-white border border-neutral-gray-200/40 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-neutral-gray-50 flex items-center justify-center text-neutral-gray-600 mb-4 border border-neutral-gray-200/40">
              <BookOpen size={24} />
            </div>
            <p className="text-neutral-gray-900 text-sm font-bold mb-1.5">No products found matching criteria.</p>
            <p className="text-xs text-neutral-gray-600 max-w-[280px]">
              Try clearing selected checkboxes, adjusting the price sliders, or changing your keywords.
            </p>
          </div>
        )}

      </section>

    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="w-full min-h-[calc(100vh-65px)] overflow-y-auto bg-neutral-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="animate-spin text-primary-600 mb-3" size={24} />
            <p className="text-sm text-neutral-gray-600">Loading search catalog...</p>
          </div>
        }>
          <SearchPageContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
