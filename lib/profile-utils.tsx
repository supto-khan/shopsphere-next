import { useState } from 'react';
import { BACKEND_URL } from './api';

export function normalizeImage(fullUrl?: any): string | null {
  if (!fullUrl) return null;
  const path = typeof fullUrl === 'string' ? fullUrl : fullUrl?.path;
  if (!path || path.includes('def.png')) return '/placeholder.webp';

  const cleanPath = path.replace(/^https?:\/\/[^\/]+/, '');
  const cleanBackendUrl = BACKEND_URL.replace(/\/$/, '');

  if (!cleanPath.includes('/')) {
    return `${cleanBackendUrl}/storage/profile/${cleanPath}`;
  }

  const proxied = cleanPath.replace('storage/app/public', 'storage');
  return `${cleanBackendUrl}${proxied.startsWith('/') ? proxied : '/' + proxied}`;
}

export function formatOrderDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatAmount(amount?: number | string): string {
  const n = Number(amount || 0);
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function resolveProductImage(product?: any): string {
  if (!product) return '';
  const fullUrlObj = product.thumbnail_full_url;
  if (fullUrlObj && fullUrlObj.path && !fullUrlObj.path.includes('def.png')) {
    const cleanPath = fullUrlObj.path.replace(/^https?:\/\/[^\/]+/, '');
    const cleanBackendUrl = BACKEND_URL.replace(/\/$/, '');
    const relative = cleanPath.replace('storage/app/public', 'storage');
    return `${cleanBackendUrl}${relative.startsWith('/') ? relative : '/' + relative}`;
  }
  if (product.thumbnail && !product.thumbnail.includes('def.png')) {
    const cleanBackendUrl = BACKEND_URL.replace(/\/$/, '');
    return `${cleanBackendUrl}/storage/product/thumbnail/${product.thumbnail}`;
  }
  return '';
}

export function ProductThumb({ product, className = '' }: { product?: any; className?: string }) {
  const src = resolveProductImage(product);
  const [errored, setErrored] = useState(false);
  if (!src || errored) {
    return (
      <div className={`w-full h-full flex items-center justify-center text-primary-600 bg-primary-50 ${className}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={product?.name || 'product'} className={`w-full h-full object-cover ${className}`} onError={() => setErrored(true)} />;
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
