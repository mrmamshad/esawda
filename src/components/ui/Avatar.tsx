'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';
import { initials } from '@/lib/format';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const dims: Record<Size, { class: string; px: number; text: string; dot: string }> = {
  xs:   { class: 'h-6 w-6',   px: 24,  text: 'text-[10px]', dot: 'h-2 w-2' },
  sm:   { class: 'h-8 w-8',   px: 32,  text: 'text-xs',     dot: 'h-2 w-2' },
  md:   { class: 'h-10 w-10', px: 40,  text: 'text-sm',     dot: 'h-3 w-3' },
  lg:   { class: 'h-14 w-14', px: 56,  text: 'text-lg',     dot: 'h-3 w-3' },
  xl:   { class: 'h-20 w-20', px: 80,  text: 'text-2xl',    dot: 'h-3.5 w-3.5' },
  '2xl':{ class: 'h-28 w-28', px: 112, text: 'text-3xl',    dot: 'h-4 w-4' },
};

/**
 * Avatar with graceful fallback. If `src` is missing OR the image fails to
 * load at runtime, we render an initials pill using locked brand tokens so
 * the layout never collapses to an empty gap.
 */
export function Avatar({
  src,
  alt,
  size = 'md',
  online = false,
  className,
}: { src: string | null | undefined; alt: string; size?: Size; online?: boolean; className?: string }) {
  const d = dims[size];
  const [failed, setFailed] = useState(false);
  const hasSrc = !!src && src.trim().length > 0 && !failed;

  return (
    <span className={cn('relative inline-flex items-center justify-center shrink-0 overflow-hidden rounded-full bg-brand-100 text-brand-800 font-semibold ring-2 ring-white shadow-sm', d.class, d.text, className)}>
      {hasSrc ? (
        <Image
          src={src as string}
          alt={alt}
          width={d.px}
          height={d.px}
          className="h-full w-full rounded-full object-cover"
          sizes={`${d.px}px`}
          unoptimized
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{initials(alt)}</span>
      )}
      {online && (
        <span
          aria-label="online"
          className={cn('absolute right-0 top-0 block rounded-full bg-brand-500 ring-2 ring-white', d.dot)}
        />
      )}
    </span>
  );
}
