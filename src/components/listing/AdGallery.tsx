'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Hero image + thumbnail strip for the Ad Detail page. Matches the
 * Bikroy-style reference: large rounded main image with left/right
 * arrows, thumbnails below in a row. Click a thumb or arrow to swap the
 * hero without a page reload.
 */
export function AdGallery({
  images,
  title,
  className,
}: { images: { url: string; thumb: string }[]; title: string; className?: string }) {
  const [active, setActive] = useState(0);

  // No images: render a compact, non-huge placeholder card instead of a
  // giant 16:10 empty box. Keeps the detail page tight.
  if (images.length === 0) {
    return (
      <div className={cn('flex items-center gap-4 rounded-card border border-dashed border-line bg-surface-muted p-6 text-sm text-ink-muted', className)}>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-500">
          <ImageIcon size={20} />
        </div>
        <div>
          <p className="font-medium text-ink">No photos uploaded</p>
          <p className="text-xs">The seller hasn't added images to this product yet.</p>
        </div>
      </div>
    );
  }

  const count = images.length;
  const hero = images[Math.min(active, count - 1)]!;
  const prev = () => setActive(a => (a - 1 + count) % count);
  const next = () => setActive(a => (a + 1) % count);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="group relative aspect-[16/10] overflow-hidden rounded-2xl bg-surface-muted">
        <Image
          src={hero.url}
          alt={title}
          fill
          sizes="(min-width:1024px) 60vw, 100vw"
          priority
          className="object-cover"
          unoptimized={hero.url.startsWith('/')}
        />
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-md transition hover:bg-white hover:text-brand-700"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-md transition hover:bg-white hover:text-brand-700"
            >
              <ChevronRight size={20} />
            </button>
            <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white">
              {active + 1} / {count}
            </span>
          </>
        )}
      </div>
      {count > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {images.slice(0, 5).map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              className={cn(
                'relative aspect-[16/12] overflow-hidden rounded-lg bg-surface-muted transition',
                i === active ? 'ring-2 ring-brand-700' : 'hover:opacity-90',
              )}
            >
              <Image src={img.thumb} alt="" fill sizes="120px" className="object-cover" unoptimized={img.thumb.startsWith('/')} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
