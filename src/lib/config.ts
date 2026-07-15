// Central config. BASE_PATH must match `basePath` in next.config.js.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '/raingarden';

// Backend API base URL (no trailing slash). Set via NEXT_PUBLIC_API_BASE_URL.
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://rain-garden-advisor-api.onrender.com'
).replace(/\/$/, '');

// Prefix a /public asset path with the app basePath.
// Next does NOT rewrite plain <img src> or CSS url() with basePath, so anything
// referenced outside next/image must go through this helper.
export function asset(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_PATH}${clean}`;
}
