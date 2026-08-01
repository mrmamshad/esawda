'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type AdminNavItem = { href: Route; label: string; icon: ReactNode };

export function AdminSidebar({ items }: { items: AdminNavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="rounded-lg border border-line bg-white p-2">
      {items.map((item) => {
        const active = item.href === '/admin'
          ? pathname === '/admin'
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition',
              active
                ? 'bg-brand-50 font-semibold text-brand-800'
                : 'text-ink-muted hover:bg-slate-50 hover:text-ink',
            )}
          >
            <span className={cn(active ? 'text-brand-700' : 'text-ink-muted')}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
