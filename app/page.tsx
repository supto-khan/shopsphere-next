import React, { Suspense } from 'react';
import { Category, Product, Brand } from '@/lib/api';
import {
  getCachedConfig,
  getCachedCategories,
  getCachedTopSellers,
  getCachedBrands,
  getCachedTopShops,
  getCachedNewArrivals,
  getCachedTopRatedProducts,
  getCachedFeaturedProducts,
  getCachedBanners,
  getCachedProductsByCategory
} from '@/lib/server-cache';
import StorefrontClient from '@/components/StorefrontClient';
import StorefrontSkeleton from '@/components/StorefrontSkeleton';

// Enable ISR — the page is served from the CDN and revalidated server-side
// every 60 seconds without blocking any visitor.
export const revalidate = 60;

async function StorefrontServerContent() {
  // ── Fetch ALL storefront data from the caching layer on the server ─────────
  // Resolves from Vercel Edge Cache or Memory in <5ms on cache hit.
  const [
    config,
    categories,
    topSellers,
    brands,
    topShops,
    newArrivals,
    topRated,
    featured,
    bannersData,
  ] = await Promise.all([
    getCachedConfig().catch(() => ({})),
    getCachedCategories().catch(() => []),
    getCachedTopSellers().catch(() => []),
    getCachedBrands().catch(() => []),
    getCachedTopShops().catch(() => []),
    getCachedNewArrivals().catch(() => []),
    getCachedTopRatedProducts().catch(() => []),
    getCachedFeaturedProducts().catch(() => []),
    getCachedBanners().catch(() => []),
  ]);

  const allBanners = Array.isArray(bannersData) ? bannersData : [];

  // Filter all banner types on the server so child components receive props
  // instead of each independently calling api.getBanners() on mount.
  const mainBanners    = allBanners.filter((b: any) => b.published === 1 && b.banner_type === 'Main Banner');
  const sectionBanners = allBanners.filter((b: any) => b.published === 1 && b.banner_type === 'Main Section Banner');
  const footerBanners  = allBanners.filter((b: any) => b.published === 1 && b.banner_type === 'Footer Banner');
  const popupBanner    = allBanners.find( (b: any) => b.published === 1 && b.banner_type === 'Popup Banner') ?? null;

  // ── Pre-render up to 5 category product grids on the server ──────────────
  const categorySectionsData = await Promise.all(
    categories.slice(0, 5).map(async (category: Category) => {
      try {
        const products = await getCachedProductsByCategory(category.id, 8, 1);
        return { category, products };
      } catch {
        return { category, products: [] };
      }
    })
  );

  const categorySections = categorySectionsData.filter((s) => s.products.length > 0);

  return (
    <StorefrontClient
      initialConfig={config}
      initialCategories={categories}
      initialTopSellers={topSellers}
      initialBrands={brands}
      initialTopShops={topShops}
      initialNewArrivals={newArrivals}
      initialTopRated={topRated}
      initialFeatured={featured}
      initialCategorySections={categorySections}
      initialBanners={mainBanners}
      initialSectionBanners={sectionBanners}
      initialFooterBanners={footerBanners}
      initialPopupBanner={popupBanner}
    />
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<StorefrontSkeleton />}>
      <StorefrontServerContent />
    </Suspense>
  );
}
