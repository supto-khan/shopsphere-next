// Shared helpers for the order detail pages (summary / vendor / delivery / reviews / track).

export const CURRENCY = '৳';

export function titleCase(value?: string | null): string {
  if (!value) return '';
  return String(value).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function money(amount?: number | string): string {
  const n = Number(amount || 0);
  return `${CURRENCY}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function orderStatusClasses(status?: string): string {
  switch (status) {
    case 'delivered': return 'bg-success text-primary-800';
    case 'pending':
    case 'confirmed':
    case 'processing':
    case 'out_for_delivery': return 'bg-primary-50 text-primary-600';
    case 'canceled':
    case 'failed':
    case 'returned': return 'bg-danger text-red-600';
    default: return 'bg-neutral-gray-50 text-neutral-gray-600';
  }
}

export function orderStatusLabel(status?: string): string {
  if (status === 'processing') return 'Packaging';
  if (status === 'out_for_delivery') return 'Out For Delivery';
  if (status === 'failed') return 'Failed To Delivery';
  return titleCase(status);
}

// Matches the Blade header date format: d M, Y h:i A
export function formatOrderDateTime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

import { BACKEND_URL } from './api';

// Resolve a product/shop/avatar image URL, matching the convention used across
// the SPA (ProductCard / CartDrawer): use *_full_url.path, strip the host and
// rewrite storage/app/public -> storage so it flows through the Next proxy.
export function resolveStorageImage(fullUrl?: any): string {
  if (!fullUrl) return '';
  const path = typeof fullUrl === 'string' ? fullUrl : fullUrl?.path;
  if (!path || path.includes('def.png')) return '';
  const cleanPath = path.replace(/^https?:\/\/[^/]+/, '');
  const cleanBackendUrl = BACKEND_URL.replace(/\/$/, '');
  const proxied = cleanPath.replace('storage/app/public', 'storage');
  return `${cleanBackendUrl}${proxied.startsWith('/') ? proxied : '/' + proxied}`;
}

export function resolveProductImage(product?: any): string {
  if (!product) return '';
  const fromFull = resolveStorageImage(product.thumbnail_full_url);
  if (fromFull) return fromFull;
  if (product.thumbnail && !String(product.thumbnail).includes('def.png')) {
    const cleanBackendUrl = BACKEND_URL.replace(/\/$/, '');
    return `${cleanBackendUrl}/storage/product/thumbnail/${product.thumbnail}`;
  }
  return '';
}

// Address blobs may arrive as a JSON string or an object.
export function parseAddress(raw: any): any | null {
  if (!raw) return null;
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return null; }
  }
  return raw;
}

// Parse product_details which may be a JSON string or already an object.
export function parseProduct(raw: any): any | null {
  if (!raw) return null;
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return null; }
  }
  return raw;
}

// An order is "only digital" when none of its items is a physical product.
export function isOrderOnlyDigital(order: any): boolean {
  const details: any[] = order?.details || [];
  if (!details.length) return true;
  return !details.some((detail) => parseProduct(detail?.product_details)?.product_type === 'physical');
}
