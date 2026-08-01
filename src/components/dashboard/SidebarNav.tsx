'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type SidebarItem = {
  href: string;
  label: string;
  icon: ReactNode;
  count?: number;
  /** Force exact-match highlighting (default: startsWith). */
  exact?: boolean;
};

export type SidebarGroup = { title?: string; items: SidebarItem[] };

/**
 * Grouped left-rail nav. Supports either a flat item list (legacy) or a
 * grouped structure with section headings like "STORE MANAGEMENT",
 * "SALES & ADS", "ACCOUNT" — mirrors the Figma shop dashboard.
 */
export function SidebarNav({
  items, groups, className,
}: {
  items?: SidebarItem[];
  groups?: SidebarGroup[];
  className?: string;
}) {
  const path = usePathname();
  const rendered = groups ?? (items ? [{ items }] : []);

  return (
    <nav className={cn('surface-card flex flex-col gap-4 p-3', className)}>
      {rendered.map((group, gi) => (
        <div key={gi} className="flex flex-col gap-1">
          {group.title && (
            <p className="mt-1 mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-ink-faint">
              {group.title}
            </p>
          )}
          {group.items.map((it) => {
            const active = it.exact
              ? path === it.href
              : path === it.href || (it.href !== '/shop' && it.href !== '/admin' && path?.startsWith(it.href + '/'));
            return (
              <Link
                key={it.href}
                href={it.href as Route}
                className={cn(
                  'group flex items-center gap-3 rounded-pill px-3 h-10 text-sm font-medium btn-focus transition',
                  active ? 'bg-brand-700 text-white shadow-sm' : 'text-ink hover:bg-brand-50',
                )}
              >
                <span className={cn('flex h-5 w-5 items-center justify-center', active ? 'text-white' : 'text-brand-500')}>
                  {it.icon}
                </span>
                <span className="flex-1 truncate">{it.label}</span>
                {typeof it.count === 'number' && it.count > 0 && (
                  <span className={cn(
                    'inline-flex min-w-5 items-center justify-center rounded-pill px-2 text-xs font-semibold',
                    active ? 'bg-white/25 text-white' : 'bg-brand-100 text-brand-800',
                  )}>
                    {it.count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
