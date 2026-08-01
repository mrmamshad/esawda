'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Hero image + thumbnail strip for the Ad Detail page. Matches the
 * reference: large rounded main image, 5 thumbnails below in a row.
 * Click a thumb to swap the hero without a page reload.
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
          <p className="text-xs">The seller hasn't added images to this ad yet.</p>
        </div>
      </div>
    );
  }

  const hero = images[Math.min(active, images.length - 1)]!;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-surface-muted">
        <Image
          src={hero.url}
          alt={title}
          fill
          sizes="(min-width:1024px) 60vw, 100vw"
          priority
          className="object-cover"
          unoptimized={hero.url.startsWith('/')}
        />
      </div>
      {images.length > 1 && (
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
