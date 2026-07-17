import { BACKEND_URL } from './api';

/**
 * Resolves a backend image URL or image object to an absolute backend URL.
 * Handles trailing slashes in BACKEND_URL correctly.
 */
export function resolveImage(urlOrObj?: any, defaultPath = '/placeholder.jpg'): string {
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
  
  const proxied = clean.replace('storage/app/public', 'storage');
  
  // Remove any trailing slash from BACKEND_URL to prevent double slashes
  const cleanBackendUrl = BACKEND_URL.replace(/\/$/, '');
  return `${cleanBackendUrl}${proxied}`;
}
