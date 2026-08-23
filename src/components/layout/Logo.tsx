import Link from 'next/link';
import Image from 'next/image';
import type { Route } from 'next';
import { cn } from '@/lib/cn';

/**
 * eSawda brand logo. Transparent PNG shipped in /public/logo.png.
 *
 * The image already has enough weight to hold on both light and coral
 * surfaces — we deliberately do NOT wrap it in a background pill, per
 * the client brief. `variant` is kept for API compatibility.
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
  const width = Math.round(height * 2.7);   // native aspect (2180×808 ≈ 2.7)
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
        src="/logo.png"
        alt="eSawda"
        width={width}
        height={height}
        priority
        sizes={`${width}px`}
        className="select-none"
        style={{ height, width: 'auto' }}
      />
    </Link>
  );
}
