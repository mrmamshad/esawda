/**
 * Version tag appended to image source URLs.
 *
 * Cloudflare caches Next optimizer responses for 30 days. When the optimizer
 * itself was broken (incompatible sharp build) those cached responses were
 * the original multi-megabyte uploads. Bumping this value changes both the
 * source URL and the optimizer cache key, so visitors get fresh, resized
 * images without waiting for the old cache entries to expire.
 */
const IMAGE_VERSION = '2026-11-05-2';

export function versionedImage(src: string): string {
  if (!src || src.startsWith('data:') || src.startsWith('blob:')) return src;

  const hashIndex = src.indexOf('#');
  const base = hashIndex >= 0 ? src.slice(0, hashIndex) : src;
  const hash = hashIndex >= 0 ? src.slice(hashIndex + 1) : '';
  if (base.includes(`v=${IMAGE_VERSION}`)) return src;

  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}v=${IMAGE_VERSION}${hash ? `#${hash}` : ''}`;
}
