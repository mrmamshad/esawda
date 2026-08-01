'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { ShopSidebar, buildShopGroups } from './ShopSidebar';
import { ShopTopbar } from './ShopTopbar';
import type { User } from '@/types/api';

export type ShopCounts = {
  active?:     number;
  pending?:    number;
  sold_out?:   number;
  removed?:    number;
  drafts?:     number;
  wishlisted?: number;
  messages?:   number;
};

/**
 * New shop shell — matches the admin architecture (collapsible left
 * rail + sticky topbar) but with a warmer, storefront-focused vibe.
 */
export function ShopShellV2({
  user, counts, children,
}: { user: User; counts?: ShopCounts; children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('esawda-shop-nav');
      if (raw === 'collapsed') setCollapsed(true);
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem('esawda-shop-nav', collapsed ? 'collapsed' : 'expanded'); } catch {}
  }, [collapsed]);

  const groups = buildShopGroups(counts);

  return (
    <div className="shop-scope min-h-[100dvh]" style={{ background: 'var(--shp-bg)', color: 'var(--shp-fg)' }}>
      <ShopSidebar user={user} collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} groups={groups} />
      <div
        className={
          'flex min-h-[100dvh] flex-col transition-[padding] duration-200 ' +
          (collapsed ? 'md:pl-16' : 'md:pl-64')
        }
      >
        <ShopTopbar user={user} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
