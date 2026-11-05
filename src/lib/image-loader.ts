import type { ImageLoaderProps } from 'next/image';

/**
 * Cache-busting image loader.
 *
 * We still use Next's built-in `/_next/image` optimizer (so widths, WebP/AVIF
 * conversion and the on-disk image cache all keep working), but append a
 * version to the URL. Cloudflare caches optimizer responses for 30 days, so
 * bumping this value is how we invalidate copies that were cached while the
 * optimizer was returning originals (missing/incompatible sharp build).
 *
 * Bump whenever image output needs to be invalidated globally.
 */
const IMAGE_CACHE_VERSION = '2026-11-05-1';

export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  // Data and blob URLs cannot be optimized by the server.
  if (src.startsWith('data:') || src.startsWith('blob:')) return src;
  const q = quality || 75;
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${q}&v=${IMAGE_CACHE_VERSION}`;
}
