import { BACKEND_URL } from './api';

/**
 * Ultra-lightweight placeholder — a 500-byte inline SVG data URI.
 * Zero network cost, zero layout shift. Replaces the 431 KB placeholder.webp
 * that previously loaded on every product card fallback.
 *
 * Usage: import { PLACEHOLDER_IMAGE } from '@/lib/image';
 *        <img src={src || PLACEHOLDER_IMAGE} ... />
 */
export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f5f5f5'/%3E%3Crect x='1' y='1' width='398' height='398' rx='2' fill='none' stroke='%23e5e5e5' stroke-width='1'/%3E%3Ccircle cx='200' cy='165' r='42' fill='%23e0e0e0'/%3E%3Cellipse cx='200' cy='290' rx='72' ry='52' fill='%23e0e0e0'/%3E%3Ctext x='200' y='360' font-family='system-ui,sans-serif' font-size='13' fill='%23bdbdbd' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";



/**
 * Resolves a backend image URL or image object to an absolute backend URL.
 * Handles trailing slashes in BACKEND_URL correctly.
 */
export function resolveImage(urlOrObj?: any, defaultPath = PLACEHOLDER_IMAGE): string {
  if (!urlOrObj) return defaultPath;

  let pathStr = '';
  if (typeof urlOrObj === 'string') {
    pathStr = urlOrObj;
  } else if (typeof urlOrObj === 'object' && urlOrObj !== null) {
    pathStr = urlOrObj.path || urlOrObj.image_name || '';
  }

  if (!pathStr || typeof pathStr !== 'string') return defaultPath;
  if (pathStr.endsWith('def.png')) return defaultPath;

  // Strip host/protocol if present, keeping only path
  let clean = pathStr.replace(/^https?:\/\/[^\/]+/, '');
  if (!clean.startsWith('/')) {
    clean = '/' + clean;
  }

  // Remove any trailing slash from BACKEND_URL to prevent double slashes
  const cleanBackendUrl = BACKEND_URL.replace(/\/$/, '');
  return `${cleanBackendUrl}${clean}`;
}
