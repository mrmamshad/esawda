'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Route } from 'next';
import { cn } from '@/lib/cn';

/**
 * Shop panel logo — uses the FULL eSawda transparent PNG at compact
 * size. This is intentionally different from the admin's "eS" square
 * mark: shops are still customer-facing so the wordmark reinforces
 * brand recognition when a seller is logged in.
 */
export function ShopLogo({ collapsed = false, className }: { collapsed?: boolean; className?: string }) {
  return (
    <Link
      href={'/shop' as Route}
      aria-label="eSawda shop — home"
      className={cn('inline-flex items-center gap-2', className)}
    >
      {collapsed ? (
        <span
          className="grid h-8 w-8 place-items-center rounded-lg text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #FF003F 0%, #FF003F 100%)' }}
        >
          eS
        </span>
      ) : (
        <Image
          src="/logo.png"
          alt="eSawda"
          width={132}
          height={36}
          priority
          className="select-none"
          style={{ height: 32, width: 'auto' }}
        />
      )}
      {!collapsed && (
        <span
          className="hidden rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest md:inline-block"
          style={{ background: 'var(--shp-brand-soft)', color: 'var(--shp-brand)', borderColor: 'transparent' }}
        >
          Shop
        </span>
      )}
    </Link>
  );
}
