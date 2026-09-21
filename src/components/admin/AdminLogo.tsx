'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Route } from 'next';
import { cn } from '@/lib/cn';

/**
 * Admin sidebar logo — uses the full eSawda transparent PNG
 * (same asset as the public homepage) instead of a bespoke "eS" square.
 * This gives the admin panel one continuous brand identity with the
 * marketplace so operators always know which product they are in.
 */
export function AdminLogo({ collapsed = false, className }: { collapsed?: boolean; className?: string }) {
  return (
    <Link
      href={'/admin' as Route}
      aria-label="eSawda admin — home"
      className={cn('inline-flex items-center gap-2', className)}
    >
      {collapsed ? (
        <Image
          src="/logo.png" alt="eSawda"
          width={32} height={32}
          priority
          className="select-none"
          style={{ height: 28, width: 'auto' }}
        />
      ) : (
        <Image
          src="/logo.png" alt="eSawda"
          width={132} height={36}
          priority
          className="select-none"
          style={{ height: 32, width: 'auto' }}
        />
      )}
    </Link>
  );
}
