import Image from 'next/image';

/**
 * Thin wrapper around `next/image` for the extremely common pattern of a
 * remote thumbnail/avatar/cover that fills a fixed-size, `overflow-hidden`
 * parent (`object-cover`).
 *
 * Why this exists:
 *   - Replaces raw `<img>` tags so images get AVIF/WebP conversion, lazy
 *     loading and responsive `srcset` from the Next image optimizer
 *     (configured in next.config.mjs). This is the single biggest LCP win
 *     on card/list heavy screens (dashboard, browse, ad detail).
 *   - Uses `fill` so callers keep their existing sized container and just
 *     drop the tag in place — no width/height guessing at every call site.
 *
 * The parent MUST be positioned (`relative`) and sized; pass the same sizing
 * classes you already had on the wrapper div.
 *
 * `unoptimized` is auto-enabled for `blob:`/`data:` sources (e.g. local file
 * previews via `URL.createObjectURL`) which the optimizer cannot process.
 */
export function CoverImage({
  src,
  alt = '',
  className = 'object-cover',
  sizes = '(max-width: 640px) 50vw, 200px',
  priority = false,
  onLoad,
}: {
  src: string;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
}) {
  const isLocal = src.startsWith('blob:') || src.startsWith('data:');
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={isLocal}
      className={className}
      onLoad={onLoad}
    />
  );
}
