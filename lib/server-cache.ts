/**
 * lib/server-cache.ts — Server-side caching layer using Next.js unstable_cache.
 *
 * Wraps every public API endpoint that is read by Server Components with a
 * deterministic in-memory + filesystem cache keyed by a stable string, with
 * per-resource TTLs and cache tags for on-demand revalidation.
 *
 * Usage in any Server Component or page.tsx:
 *   import { getCachedConfig, getCachedBanners } from '@/lib/server-cache';
 *   const config = await getCachedConfig();
 */

import { unstable_cache } from 'next/cache';
import { api } from './api';

// ── System Config ─────────────────────────────────────────────────────────────

/**
 * Site configuration — company name, logo, payment methods, feature flags.
 * TTL: 1 hour. Cache tag: 'config' (revalidate with: revalidateTag('config')).
 */
export const getCachedConfig = unstable_cache(
  () => api.getConfig(),
  ['config'],
  { revalidate: 3600, tags: ['config'] }
);

// ── Categories ────────────────────────────────────────────────────────────────

/**
 * Full category tree including children.
 * TTL: 1 hour. Cache tag: 'categories'.
 */
export const getCachedCategories = unstable_cache(
  () => api.getCategories(),
  ['categories'],
  { revalidate: 3600, tags: ['categories'] }
);

// ── Banners ───────────────────────────────────────────────────────────────────

/**
 * All banners (Hero, Section, Footer, Popup). Filter client-side by banner_type.
 * TTL: 15 minutes. Cache tag: 'banners'.
 */
export const getCachedBanners = unstable_cache(
  () => api.getBanners(),
  ['banners'],
  { revalidate: 900, tags: ['banners'] }
);

// ── Products ──────────────────────────────────────────────────────────────────

/**
 * Featured / recommended products. TTL: 5 min. Cache tag: 'featured'.
 */
export const getCachedFeaturedProducts = unstable_cache(
  () => api.getFeaturedProducts(),
  ['products-featured'],
  { revalidate: 300, tags: ['featured', 'products'] }
);

/**
 * Top-selling products. TTL: 5 min. Cache tag: 'products'.
 */
export const getCachedTopSellers = unstable_cache(
  () => api.getTopSellers(),
  ['products-top-sellers'],
  { revalidate: 300, tags: ['products'] }
);

/**
 * New arrivals. TTL: 5 min. Cache tag: 'products'.
 */
export const getCachedNewArrivals = unstable_cache(
  () => api.getNewArrivals(),
  ['products-new-arrivals'],
  { revalidate: 300, tags: ['products'] }
);

/**
 * Top rated products. TTL: 5 min. Cache tag: 'products'.
 */
export const getCachedTopRatedProducts = unstable_cache(
  () => api.getTopRatedProducts(),
  ['products-top-rated'],
  { revalidate: 300, tags: ['products'] }
);

// ── Brands & Shops ────────────────────────────────────────────────────────────

/**
 * All brands. TTL: 1 hour. Cache tag: 'brands'.
 */
export const getCachedBrands = unstable_cache(
  () => api.getBrands(),
  ['brands'],
  { revalidate: 3600, tags: ['brands'] }
);

/**
 * Top shops / sellers. TTL: 15 min. Cache tag: 'shops'.
 */
export const getCachedTopShops = unstable_cache(
  () => api.getTopShops(),
  ['top-shops'],
  { revalidate: 900, tags: ['shops'] }
);

// ── Blog ──────────────────────────────────────────────────────────────────────

/**
 * Blog list with optional filters. TTL: 10 min. Cache tag: 'blog'.
 * Each unique combination of params gets its own cache entry.
 */
export const getCachedBlogList = (params?: {
  search?: string;
  category?: string;
  writer?: string;
  page?: number;
}) =>
  unstable_cache(
    () => api.getBlogList(params),
    ['blog-list', JSON.stringify(params ?? {})],
    { revalidate: 600, tags: ['blog'] }
  )();

/**
 * Individual blog post by slug. TTL: 1 hour. Cache tag: 'blog'.
 */
export const getCachedBlogDetails = (slug: string, source?: string) =>
  unstable_cache(
    () => api.getBlogDetails(slug, source),
    ['blog-details', slug, source ?? ''],
    { revalidate: 3600, tags: ['blog', `blog-${slug}`] }
  )();

/**
 * Popular blogs. TTL: 30 min. Cache tag: 'blog'.
 */
export const getCachedPopularBlogs = unstable_cache(
  () => api.getPopularBlogs(),
  ['blog-popular'],
  { revalidate: 1800, tags: ['blog'] }
);

/**
 * Blog categories. TTL: 1 hour. Cache tag: 'blog'.
 */
export const getCachedBlogCategories = unstable_cache(
  () => api.getBlogCategories(),
  ['blog-categories'],
  { revalidate: 3600, tags: ['blog'] }
);

// ── Products by Category (used on homepage) ───────────────────────────────────

/**
 * Products for a specific category (used for homepage category sections).
 * TTL: 5 min per category. Cache tag: 'products'.
 */
export const getCachedProductsByCategory = (
  categoryId: number,
  limit = 8,
  offset = 1
) =>
  unstable_cache(
    () => api.getProductsByCategory(categoryId, limit, offset),
    ['products-by-category', String(categoryId), String(limit), String(offset)],
    { revalidate: 300, tags: ['products', `category-${categoryId}`] }
  )();
