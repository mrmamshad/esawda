'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';
import type { User } from '@/types/api';

/**
 * New admin shell (2026-07-24). Completely detached from the public
 * marketplace Header — the sidebar and topbar are dedicated to admin
 * work. Nothing in this tree references the customer-facing nav.
 */
export function AdminShellV2({
  user, children,
}: { user: User; children: ReactNode }) {
  // Sidebar collapse — persist across navigations.
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('esawda-admin-nav');
      if (raw === 'collapsed') setCollapsed(true);
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem('esawda-admin-nav', collapsed ? 'collapsed' : 'expanded'); } catch {}
  }, [collapsed]);

  return (
    <div className="admin-scope adm-bg min-h-[100dvh]">
      <AdminSidebar user={user} collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      {/*
        `md:pl-16` (64px) when collapsed, `md:pl-60` (240px) otherwise.
        Tailwind ships both classes in the build so switching is instant
        without any JS/CSS-var indirection.
      */}
      <div
        className={
          'flex min-h-[100dvh] flex-col transition-[padding] duration-200 ' +
          (collapsed ? 'md:pl-16' : 'md:pl-60')
        }
      >
        <AdminTopbar user={user} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
