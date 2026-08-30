'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import {
  LayoutDashboard, Users, Store, PackageCheck, FolderTree, CreditCard, PackageOpen,
  Receipt, Newspaper, Settings, ChevronsLeft, ChevronsRight, LogOut, ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { AdminLogo } from './AdminLogo';
import { useClickOutside } from './useClickOutside';
import type { User } from '@/types/api';

/**
 * Admin left rail — Stripe/Vercel-style:
 *   • 240px expanded / 64px collapsed
 *   • Grouped nav with section labels
 *   • Active state: coral accent bar + soft-tinted pill
 *   • Bottom user card with dropdown
 *
 * State is local (`useState`) since the whole shell is client-side.
 * Persists collapsed state in localStorage under `esawda-admin-nav`.
 */

type NavItem = { href: Route; label: string; icon: ReactNode };
type NavGroup = { title: string; items: NavItem[] };

const GROUPS: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { href: '/admin' as Route, label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
    ],
  },
  {
    title: 'Marketplace',
    items: [
      { href: '/admin/ads' as Route,        label: 'Products',   icon: <PackageCheck size={17} /> },
      { href: '/admin/categories' as Route, label: 'Categories', icon: <FolderTree size={17} /> },
      { href: '/admin/plans' as Route,      label: 'Plans',      icon: <CreditCard size={17} /> },
    ],
  },
  {
    title: 'People',
    items: [
      { href: '/admin/users' as Route, label: 'Users', icon: <Users size={17} /> },
      { href: '/admin/shops' as Route, label: 'Shops', icon: <Store size={17} /> },
    ],
  },
  {
    title: 'Finance',
    items: [
      { href: '/admin/transactions' as Route, label: 'Transactions', icon: <Receipt size={17} /> },
      { href: '/admin/orders' as Route, label: 'Orders', icon: <PackageOpen size={17} /> },
    ],
  },
  {
    title: 'Content',
    items: [
      { href: '/admin/blog' as Route, label: 'Blog', icon: <Newspaper size={17} /> },
    ],
  },
  {
    title: 'System',
    items: [
      { href: '/admin/settings' as Route, label: 'Settings', icon: <Settings size={17} /> },
    ],
  },
];

export function AdminSidebar({
  user, collapsed, onToggle,
}: { user: User; collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useClickOutside<HTMLDivElement>(profileOpen, () => setProfileOpen(false));

  return (
    <aside
      style={{ background: 'var(--adm-surface)', borderColor: 'var(--adm-border)' }}
      className={cn(
        'fixed inset-y-0 left-0 z-40 hidden shrink-0 flex-col border-r transition-[width] duration-200 md:flex',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* ── Brand ── */}
      <div className="flex h-16 items-center justify-between px-4">
        <AdminLogo collapsed={collapsed} />
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="grid h-7 w-7 place-items-center rounded-md text-[color:var(--adm-fg-muted)] hover:bg-[color:var(--adm-bg)]"
        >
          {collapsed ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
        </button>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto px-2.5 pb-4">
        {GROUPS.map((group) => (
          <div key={group.title} className="mt-4 first:mt-1">
            {!collapsed && (
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--adm-fg-faint)' }}>
                {group.title}
              </p>
            )}
            {group.items.map((it) => {
              // Same exact-match-with-child-guard as ShopSidebar so
              // parent rows never highlight simultaneously with a
              // sibling sub-route (e.g. /admin/ads vs /admin/ads/new).
              const hasChild = GROUPS.some((g) =>
                g.items.some((x) => x.href !== it.href && x.href.startsWith(it.href + '/'))
              );
              const active = pathname === it.href || (
                !hasChild && it.href !== '/admin' && (pathname?.startsWith(it.href + '/') ?? false)
              );
              return (
                <NavItemLink key={it.href} item={it} active={active} collapsed={collapsed} />
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── User card at bottom ── */}
      <div className="border-t px-2.5 py-2.5" style={{ borderColor: 'var(--adm-border)' }}>
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition',
              'hover:bg-[color:var(--adm-bg)]',
            )}
          >
            <span
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #FF003F 0%, #4F46E5 100%)' }}
            >
              {(user.name || user.username || '?').slice(0, 2).toUpperCase()}
            </span>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold" style={{ color: 'var(--adm-fg)' }}>
                    {user.name || user.username}
                  </p>
                  <p className="truncate text-[10px]" style={{ color: 'var(--adm-fg-faint)' }}>
                    Administrator
                  </p>
                </div>
                <ChevronDown size={14} className="shrink-0" style={{ color: 'var(--adm-fg-faint)' }} />
              </>
            )}
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.12 }}
                style={{
                  background: 'var(--adm-elevated)',
                  borderColor: 'var(--adm-border)',
                  boxShadow: 'var(--adm-shadow-lg)',
                }}
                className="absolute bottom-full mb-2 w-full min-w-[180px] overflow-hidden rounded-lg border py-1"
              >
                <Link
                  href={'/shop/profile' as Route}
                  onClick={() => setProfileOpen(false)}
                  className="block px-3 py-2 text-xs hover:bg-[color:var(--adm-bg)]"
                  style={{ color: 'var(--adm-fg)' }}
                >
                  Profile
                </Link>
                <Link
                  href={'/auth/logout' as Route}
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-[color:var(--adm-bg)]"
                  style={{ color: 'var(--adm-danger)' }}
                >
                  <LogOut size={13} /> Sign out
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
}

function NavItemLink({ item, active, collapsed }: { item: NavItem; active: boolean; collapsed: boolean }) {
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        'group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition',
        collapsed && 'justify-center px-0',
      )}
      style={{
        color: active ? 'var(--adm-brand)' : 'var(--adm-fg-muted)',
        background: active ? 'var(--adm-brand-soft)' : 'transparent',
      }}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r"
          style={{ background: 'var(--adm-brand)' }}
        />
      )}
      <span className="shrink-0">{item.icon}</span>
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}
