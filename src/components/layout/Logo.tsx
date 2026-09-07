'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Route } from 'next';
import { cn } from '@/lib/cn';

/**
 * eSawda brand logo. Transparent PNG shipped in /public/logo.png.
 *
 * Some environments intermittently fail the optimized image request for
 * tiny static assets; we keep the logo resilient by:
 *  - serving it unoptimized (direct /public file)
 *  - falling back to /logo.jpeg on image error.
 */
export function Logo({
  variant = 'default',
  className,
  height = 48,
}: {
  variant?: 'default' | 'onDark';
  className?: string;
  height?: number;
}) {
  const [src, setSrc] = useState('/logo.png');
  const width = Math.round(height * 2.7); // native aspect (2180×808 ≈ 2.7)

  return (
    <Link
      href={'/' as Route}
      className={cn(
        'inline-flex shrink-0 items-center transition-transform hover:-translate-y-[1px]',
        className,
      )}
      aria-label="eSawda — home"
      data-variant={variant}
    >
      <Image
        src={src}
        alt="eSawda"
        width={width}
        height={height}
        priority
        unoptimized
        sizes={`${width}px`}
        className="select-none"
        style={{ height, width: 'auto' }}
        onError={() => {
          if (src !== '/logo.jpeg') setSrc('/logo.jpeg');
        }}
      />
    </Link>
  );
}
