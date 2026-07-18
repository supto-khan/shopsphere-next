import React, { Suspense } from 'react';
import { api, Category, Product, Brand } from '@/lib/api';
import StorefrontClient from '@/components/StorefrontClient';
import StorefrontSkeleton from '@/components/StorefrontSkeleton';

export const dynamic = 'force-dynamic';

async function StorefrontServerContent() {
  // ── Step 1: Pre-fetch all storefront data on the Server in parallel ─────
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
    api.getConfig().catch(() => ({})),
    api.getCategories().catch(() => []),
    api.getTopSellers().catch(() => []),
    api.getBrands().catch(() => []),
    api.getTopShops().catch(() => []),
    api.getNewArrivals().catch(() => []),
    api.getTopRatedProducts().catch(() => []),
    api.getFeaturedProducts().catch(() => []),
    api.getBanners().catch(() => []),
  ]);

  // Filter active Main Banners
  const mainBanners = (Array.isArray(bannersData) ? bannersData : []).filter(
    (b: any) => b.published === 1 && b.banner_type === 'Main Banner'
  );

  // ── Step 2: Fetch products for categories in parallel on the server ──────
  const categorySectionsData = await Promise.all(
    categories.slice(0, 5).map(async (category: Category) => {
      try {
        const products = await api.getProductsByCategory(category.id, 8, 1);
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
