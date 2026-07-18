'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api, Category, Brand, BACKEND_URL } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { resolveImage } from '@/lib/image';
import Footer from '@/components/Footer';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Check,
  Loader2,
  Star,
  ShoppingBag,
  Store,
  ChevronRight,
  User,
  SlidersHorizontal,
  RotateCcw,
  BookOpen,
  X
} from 'lucide-react';
import Link from 'next/link';

// Helpers
function toProxyUrl(url?: any): string {
  return resolveImage(url, '/placeholder.webp');
}

export default function VendorsPage() {
  const router = useRouter();
  const { setSelectedCategory, setSearchQuery, categories: storeCategories, categoriesLoaded, setCategories: setStoreCategories } = useAppStore();

  // Sellers and metadata state
  const [sellers, setSellers] = useState<any[]>([]);
  const [totalSize, setTotalSize] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [categories, setCategories] = useState<Category[]>(storeCategories);
  const [categoriesLoading, setCategoriesLoading] = useState(!categoriesLoaded);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);

  // Filters state
  const [shopName, setShopName] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [selectedCats, setSelectedCats] = useState<number[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const [productType, setProductType] = useState('all');
  const [vendorType, setVendorType] = useState('all'); // 'all', 'top' (Best Sellers)
  const [orderBy, setOrderBy] = useState('default'); // 'default', 'asc', 'desc', 'highest-products', 'lowest-products', 'rating-high-to-low', 'rating-low-to-high'

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 12;

  // Sidebar sections toggle state
  const [openSection, setOpenSection] = useState({
    filters: true,
    productType: true,
    categories: true,
    brands: true,
  });

  const [expandedCats, setExpandedCats] = useState<Record<number, boolean>>({});

  const toggleSection = (section: keyof typeof openSection) => {
    setOpenSection(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleCatExpand = (catId: number) => {
    setExpandedCats(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  // Fetch initial metadata
  useEffect(() => {
    let active = true;

    const fetchCats = categoriesLoaded
      ? Promise.resolve(storeCategories)
      : api.getCategories().then((data) => { setStoreCategories(data); return data; });

    fetchCats
      .then((data) => {
        if (active) {
          setCategories(data);
          setCategoriesLoading(false);
        }
      })
      .catch(() => { if (active) setCategoriesLoading(false); });

    api.getBrands()
      .then((data) => {
        if (active) {
          setBrands(data);
          setBrandsLoading(false);
        }
      })
      .catch(() => { if (active) setBrandsLoading(false); });

    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch sellers when filters change
  useEffect(() => {
    let active = true;
    setLoading(true);

    api.getSellers({
      type: vendorType,
      limit,
      offset: page,
      shop_name: shopName,
      category_id: selectedCats.length > 0 ? selectedCats : undefined,
      brand_id: selectedBrands.length > 0 ? selectedBrands : undefined,
      product_type: productType !== 'all' ? productType : undefined,
    })
      .then((res) => {
        if (!active) return;

        let sellersList = res.sellers || [];

        // Handle sorting in client-side matching Laravel shopService applyOrdering
        if (orderBy === 'asc') {
          sellersList = [...sellersList].sort((a, b) => {
            const nameA = (a.shop?.name || '').toLowerCase();
            const nameB = (b.shop?.name || '').toLowerCase();
            return nameA.localeCompare(nameB);
          });
        } else if (orderBy === 'desc') {
          sellersList = [...sellersList].sort((a, b) => {
            const nameA = (a.shop?.name || '').toLowerCase();
            const nameB = (b.shop?.name || '').toLowerCase();
            return nameB.localeCompare(nameA);
          });
        } else if (orderBy === 'highest-products') {
          sellersList = [...sellersList].sort((a, b) => (b.product_count ?? 0) - (a.product_count ?? 0));
        } else if (orderBy === 'lowest-products') {
          sellersList = [...sellersList].sort((a, b) => (a.product_count ?? 0) - (b.product_count ?? 0));
        } else if (orderBy === 'rating-high-to-low') {
          sellersList = [...sellersList].sort((a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0));
        } else if (orderBy === 'rating-low-to-high') {
          sellersList = [...sellersList].sort((a, b) => (a.average_rating ?? 0) - (b.average_rating ?? 0));
        }

        setSellers(sellersList);
        setTotalSize(res.total_size || 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, shopName, selectedCats, selectedBrands, productType, vendorType, orderBy]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [shopName, selectedCats, selectedBrands, productType, vendorType, orderBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShopName(searchVal);
  };

  const handleToggleCat = (catId: number) => {
    setSelectedCats(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const handleToggleBrand = (brandId: number) => {
    setSelectedBrands(prev =>
      prev.includes(brandId) ? prev.filter(id => id !== brandId) : [...prev, brandId]
    );
  };

  const handleResetFilters = () => {
    setSearchVal('');
    setShopName('');
    setSelectedCats([]);
    setSelectedBrands([]);
    setProductType('all');
    setVendorType('all');
    setOrderBy('default');
  };

  // Recursive category renderer matching search page design
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

  const totalPages = Math.ceil(totalSize / limit);

  const renderFilters = () => (
    <div className="bg-neutral-white lg:border border-neutral-gray-200/60 rounded-2xl lg:p-5 space-y-6 lg:shadow-sm">
      <div className="flex justify-between items-center pb-2 border-b border-neutral-gray-100">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-gray-900">Filter By</h3>
        {(selectedCats.length > 0 || selectedBrands.length > 0 || productType !== 'all' || vendorType !== 'all' || orderBy !== 'default' || shopName !== '') && (
          <button
            onClick={handleResetFilters}
            className="text-[10px] font-extrabold text-primary-600 hover:underline cursor-pointer"
          >
            Reset All
          </button>
        )}
      </div>

      {/* 1. Best Seller / Default Filter */}
      <div className="border-b border-neutral-gray-200/40 pb-5">
        <button
          type="button"
          onClick={() => toggleSection('filters')}
          className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-neutral-gray-400 mb-3 cursor-pointer"
        >
          <span>Store Type</span>
          {openSection.filters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {openSection.filters && (
          <div className="space-y-2">
            <button
              onClick={() => setVendorType('all')}
              className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                vendorType === 'all'
                  ? 'bg-primary-50 text-primary-600 border border-primary-100/50'
                  : 'text-neutral-gray-600 hover:bg-neutral-gray-50'
              }`}
            >
              Default (All Stores)
            </button>
            <button
              onClick={() => setVendorType('top')}
              className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                vendorType === 'top'
                  ? 'bg-primary-50 text-primary-600 border border-primary-100/50'
                  : 'text-neutral-gray-600 hover:bg-neutral-gray-50'
              }`}
            >
              Best Sellers
            </button>
          </div>
        )}
      </div>

      {/* 2. Sort / Order By */}
      <div className="border-b border-neutral-gray-200/40 pb-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-gray-400 mb-3">Sort Order</h4>
        <select
          value={orderBy}
          onChange={(e) => setOrderBy(e.target.value)}
          className="w-full bg-neutral-white border border-neutral-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-neutral-gray-800 outline-none focus:ring-2 focus:ring-primary-600/25 focus:border-primary-600 transition-all cursor-pointer"
        >
          <option value="default">Default Sorting</option>
          <option value="asc">Name: A to Z</option>
          <option value="desc">Name: Z to A</option>
          <option value="highest-products">Products: High to Low</option>
          <option value="lowest-products">Products: Low to High</option>
          <option value="rating-high-to-low">Rating: High to Low</option>
          <option value="rating-low-to-high">Rating: Low to High</option>
        </select>
      </div>

      {/* 3. Product Type */}
      <div className="border-b border-neutral-gray-200/40 pb-5">
        <button
          type="button"
          onClick={() => toggleSection('productType')}
          className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-neutral-gray-400 mb-3 cursor-pointer"
        >
          <span>Product Type</span>
          {openSection.productType ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {openSection.productType && (
          <div className="space-y-2">
            {['all', 'physical', 'digital'].map((type) => (
              <button
                key={type}
                onClick={() => setProductType(type)}
                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-all capitalize ${
                  productType === type
                    ? 'bg-primary-50 text-primary-600 border border-primary-100/50'
                    : 'text-neutral-gray-600 hover:bg-neutral-gray-50'
                }`}
              >
                {type} Products
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. Categories Accordion Filter */}
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
              </div>
            ) : (
              categories.map((cat) => renderCategoryItem(cat))
            )}
          </div>
        )}
      </div>

      {/* 5. Brands Filter */}
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
    </div>
  );

  return (
    <div className="w-full min-h-[calc(100vh-65px)] overflow-y-auto bg-neutral-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Dynamic header / breadcrumbs */}
        <div className="border-b border-neutral-gray-200/60 pb-4 mb-6">
          <div className="flex items-center space-x-2 text-xs text-neutral-gray-600 mb-2">
            <span className="hover:text-primary-600 hover:underline cursor-pointer transition-colors" onClick={() => router.push('/')}>
              Home
            </span>
            <ChevronRight size={12} />
            <span className="font-semibold text-primary-600">All Stores</span>
          </div>
        </div>

        {/* Banner / Search Hero Section */}
        <div className="relative rounded-2xl bg-primary-50/60 border border-primary-100/50 p-6 md:p-10 mb-8 overflow-hidden">
          <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 pointer-events-none flex items-center justify-end pr-10">
            <Store size={150} className="text-primary-600" />
          </div>

          <div className="max-w-2xl relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-gray-900 tracking-tight">All Stores</h1>
              <p className="text-sm font-semibold text-neutral-gray-600">
                Find your desired stores and shop your favourite products
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative flex items-center shrink-0">
              <input
                type="text"
                placeholder="Search Store..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-4 pr-12 py-3 border border-neutral-gray-200/80 rounded-2xl text-neutral-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all text-xs font-semibold bg-neutral-white shadow-sm"
              />
              <button
                type="submit"
                className="absolute right-4 text-neutral-gray-500 hover:text-primary-600 transition-colors cursor-pointer"
              >
                <Search size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Vendor Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6 lg:hidden">
          <Link
            href="/vendors/register"
            className="flex items-center justify-center gap-2.5 px-4 py-3 bg-primary-600 hover:bg-primary-800 text-neutral-white rounded-xl text-xs font-bold shadow-md shadow-primary-600/10 cursor-pointer transition-all duration-200 text-center active:translate-y-0"
          >
            <Store size={14} />
            <span>Become a Vendor</span>
          </Link>
          <a
            href={`${BACKEND_URL}/vendor/auth/login`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 px-4 py-3 bg-neutral-50 hover:bg-neutral-100 text-neutral-gray-800 border border-neutral-gray-200/80 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 text-center active:translate-y-0"
          >
            <User size={14} />
            <span>Login as Vendor</span>
          </a>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar Filter Area */}
          <aside className="hidden lg:flex lg:col-span-1 flex-col gap-6">
            {/* Become a Vendor & Vendor Login Action Buttons */}
            <div className="bg-neutral-white border border-neutral-gray-200/60 rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
              <Link
                href="/vendors/register"
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 bg-primary-600 hover:bg-primary-800 text-neutral-white rounded-xl text-xs font-bold shadow-md shadow-primary-600/10 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 text-center active:translate-y-0"
              >
                <Store size={15} />
                <span>Become a Vendor</span>
              </Link>
              <a
                href={`${BACKEND_URL}/vendor/auth/login`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-gray-800 border border-neutral-gray-200/80 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 text-center active:translate-y-0"
              >
                <User size={15} />
                <span>Login as Vendor</span>
              </a>
            </div>

            {renderFilters()}
          </aside>

          {/* Vendors Grid */}
          <section className="lg:col-span-3">
            {/* Mobile filter toggle and results count */}
            <div className="flex items-center justify-between gap-4 mb-6 lg:hidden">
              <span className="text-xs font-semibold text-neutral-gray-500">
                {totalSize} stores found
              </span>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex items-center gap-2 bg-neutral-white border border-neutral-gray-200 hover:border-primary-600 rounded-xl px-4 py-2.5 shadow-sm cursor-pointer text-xs font-bold text-neutral-gray-800 hover:text-primary-600 transition-colors"
              >
                <SlidersHorizontal size={14} className="text-primary-600" />
                <span>Filters</span>
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-neutral-white border border-neutral-gray-200/50 rounded-2xl overflow-hidden animate-pulse h-64 flex flex-col justify-between p-4">
                    <div className="h-28 bg-neutral-gray-200 rounded-xl" />
                    <div className="space-y-3 pt-4">
                      <div className="h-4 bg-neutral-gray-200 rounded w-2/3" />
                      <div className="h-3 bg-neutral-gray-150 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sellers.length > 0 ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {sellers.map((seller, index) => {
                    const shop = seller.shop || {};
                    const displayName = shop.name || (seller.id === 0 ? 'In-House Shop' : 'Vendor Shop');
                    const shopSlug = shop.slug || null;

                    // Fallback images
                    const bannerImg = toProxyUrl(shop.banner_full_url);
                    const logoImg = toProxyUrl(shop.image_full_url || seller.image_full_url);

                    const avgRating = Number(seller.average_rating || 0);
                    const reviewCount = Number(seller.review_count || 0);
                    const productCount = Number(seller.product_count ?? seller.products_count ?? 0);

                    // Closed badges
                    const isTemporaryClosed = Number(seller.temporary_close || 0) === 1;
                    const isVacationMode = !!seller.is_vacation_mode_now;

                    return (
                      <Link
                        key={seller.id || index}
                        href={shopSlug ? `/shop/${shopSlug}` : '#'}
                        className="bg-neutral-white border border-neutral-gray-200/55 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-neutral-gray-100/35 hover:-translate-y-1 group shadow-sm flex flex-col h-full relative"
                      >
                        {/* Shop Banner */}
                        <div className="w-full aspect-[21/9] bg-neutral-gray-50 overflow-hidden relative border-b border-neutral-gray-100/30">
                          <img
                            src={bannerImg}
                            alt={displayName}
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-350"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.webp';
                            }}
                          />

                          {/* Closed Badges */}
                          {isTemporaryClosed ? (
                            <span className="absolute top-3 right-3 bg-red-500 text-neutral-white text-[9px] font-extrabold uppercase px-2 py-1 rounded-full shadow-md z-10">
                              Temporary OFF
                            </span>
                          ) : isVacationMode ? (
                            <span className="absolute top-3 right-3 bg-amber-500 text-neutral-white text-[9px] font-extrabold uppercase px-2 py-1 rounded-full shadow-md z-10">
                              Closed Now
                            </span>
                          ) : null}

                          {/* Shop Logo Overlapping Banner */}
                          <div className="absolute -bottom-6 left-5 w-14 h-14 rounded-full overflow-hidden border-3 border-neutral-white bg-neutral-white shadow-md">
                            <img
                              src={logoImg}
                              alt={displayName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.webp';
                              }}
                            />
                          </div>
                        </div>

                        {/* Shop Content Info */}
                        <div className="pt-8 px-5 pb-5 flex flex-col flex-1">
                          <h4 className="text-sm font-extrabold text-neutral-gray-800 line-clamp-1 mb-1.5 group-hover:text-primary-600 transition-colors capitalize">
                            {displayName}
                          </h4>

                          {/* Rating Row */}
                          <div className="flex items-center space-x-2.5 mb-4">
                            <div className="flex items-center space-x-1">
                              <Star size={13} className="text-secondary-500 fill-secondary-500 shrink-0" />
                              <span className="text-xs font-extrabold text-neutral-gray-800">{avgRating.toFixed(1)}</span>
                            </div>
                            <span className="text-neutral-gray-300 text-xs">•</span>
                            <span className="text-xs font-bold text-neutral-gray-500">
                              {reviewCount < 1000 ? `${reviewCount} reviews` : `${(reviewCount / 1000).toFixed(1)}K reviews`}
                            </span>
                          </div>

                          {/* Products Count Footer Row */}
                          <div className="grid grid-cols-1 gap-2 mt-auto border-t border-neutral-gray-100/60 pt-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-extrabold text-neutral-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <ShoppingBag size={11} /> Products
                              </span>
                              <span className="font-extrabold text-primary-600 text-xs">
                                {productCount < 1000 ? productCount : `${(productCount / 1000).toFixed(1)}K`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 pt-6">
                    <button
                      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className="px-3.5 py-2 border border-neutral-gray-200 rounded-xl text-xs font-bold text-neutral-gray-600 hover:bg-neutral-gray-50 hover:text-primary-600 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-neutral-gray-600 transition-all cursor-pointer"
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => {
                      const p = i + 1;
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-9 h-9 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            page === p
                              ? 'bg-primary-600 border-primary-600 text-neutral-white font-extrabold shadow-md shadow-primary-600/15'
                              : 'border-neutral-gray-200 text-neutral-gray-600 hover:bg-neutral-gray-50 hover:text-primary-600'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={page === totalPages}
                      className="px-3.5 py-2 border border-neutral-gray-200 rounded-xl text-xs font-bold text-neutral-gray-600 hover:bg-neutral-gray-50 hover:text-primary-600 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-neutral-gray-600 transition-all cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center text-neutral-gray-500 py-20 bg-neutral-white border border-neutral-gray-150 rounded-2xl shadow-sm">
                <Store size={48} className="text-neutral-gray-300 mb-3" />
                <h4 className="text-base font-extrabold text-neutral-gray-800">No Stores Found</h4>
                <p className="text-xs text-neutral-gray-600 mt-1 max-w-xs">
                  Sorry, we couldn't find any stores matching your current search or filter criteria.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-5 px-5 py-2.5 bg-primary-600 hover:bg-primary-800 text-neutral-white rounded-xl text-xs font-bold shadow-md shadow-primary-600/15 transition-all cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </section>

        </div>

      </main>
      {/* Mobile filter slide-over */}
      {isMobileFilterOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-neutral-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-neutral-white z-50 shadow-2xl p-6 flex flex-col gap-6 animate-slide-in h-screen overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-gray-150 pb-4">
              <span className="font-extrabold text-sm text-neutral-gray-900">Store Filters</span>
              <button onClick={() => setIsMobileFilterOpen(false)} className="w-8 h-8 rounded-full hover:bg-neutral-gray-100 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 min-h-0">
              {renderFilters()}
            </div>
          </div>
        </>
      )}
      <Footer />
    </div>
  );
}
