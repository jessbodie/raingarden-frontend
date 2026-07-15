/** @type {import('next').NextConfig} */

// Keep this in sync with BASE_PATH in src/lib/config.ts.
// The app is mounted at jessbodie.com/raingarden (served from Vercel).
const BASE_PATH = '/raingarden';

const nextConfig = {
  basePath: BASE_PATH,
  env: {
    NEXT_PUBLIC_BASE_PATH: BASE_PATH,
  },
  // Static, self-contained photography — no remote image optimization needed.
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
