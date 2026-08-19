'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import {
  LayoutDashboard, Crown, PlusSquare, List, CircleCheckBig, Clock, DollarSign,
  Trash2, FileEdit, Heart, MessageSquare, Receipt, Settings, Store, CalendarX,
  ChevronsLeft, ChevronsRight, LogOut, ChevronDown, ExternalLink, Package, ShoppingCart,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { useClickOutside } from '@/components/admin/v2/useClickOutside';
import { ShopLogo } from './ShopLogo';
import type { User } from '@/types/api';

/**
 * Shop-side left rail — mirrors the AdminSidebar architecture but
 * with the "Store Management / Sales & Ads / Account" groups that
 * match the Figma reference. Coral accents match the shop tokens.
 */

type NavItem = { href: Route; label: string; icon: ReactNode; count?: number };
type NavGroup = { title: string; items: NavItem[] };

export function buildShopGroups(counts?: { active?: number; pending?: number; sold_out?: number; removed?: number; drafts?: number; expired?: number; wishlisted?: number; messages?: number }): NavGroup[] {
  return [
    {
      title: 'Store Management',
      items: [
        { href: '/shop' as Route,      label: 'Dashboard',  icon: <LayoutDashboard size={17} /> },
        { href: '/shop/plan' as Route, label: 'Membership', icon: <Crown           size={17} /> },
      ],
    },
    {
      title: 'Sales & Products',
      items: [
        { href: '/shop/ads/new' as Route,      label: 'Post New Product',   icon: <PlusSquare     size={17} /> },
        { href: '/shop/ads/bundle/new' as Route, label: 'Create Bundle',   icon: <Package       size={17} /> },
        { href: '/shop/ads' as Route,          label: 'All Products',        icon: <List           size={17} /> },
        { href: '/shop/ads/active' as Route,   label: 'Active Products',     icon: <CircleCheckBig size={17} />, count: counts?.active },
        { href: '/shop/ads/pending' as Route,  label: 'Pending Products',    icon: <Clock          size={17} />, count: counts?.pending },
        { href: '/shop/ads/sold-out' as Route, label: 'Sold Out Products',   icon: <DollarSign     size={17} />, count: counts?.sold_out },
        { href: '/shop/ads/removed' as Route,  label: 'Removed Products',    icon: <Trash2         size={17} />, count: counts?.removed },
        { href: '/shop/ads/drafts' as Route,   label: 'Drafts',              icon: <FileEdit       size={17} />, count: counts?.drafts },
        { href: '/shop/ads/expire' as Route,   label: 'Expired Products',    icon: <CalendarX      size={17} />, count: counts?.expired },
        { href: '/shop/wishlisted' as Route,   label: 'Wishlisted by Users', icon: <Heart          size={17} />, count: counts?.wishlisted },
      ],
    },
    {
      title: 'Account',
      items: [
        { href: '/shop/messages' as Route,     label: 'Messages',      icon: <MessageSquare size={17} />, count: counts?.messages },
        { href: '/shop/orders' as Route,       label: 'Orders',        icon: <ShoppingCart   size={17} /> },
        { href: '/shop/transactions' as Route, label: 'Transactions',  icon: <Receipt       size={17} /> },
        { href: '/shop/profile' as Route,      label: 'Shop Profile',  icon: <Store         size={17} /> },
        { href: '/shop/settings' as Route,     label: 'Account Setting', icon: <Settings    size={17} /> },
      ],
    },
  ];
}

export function ShopSidebar({
  user, collapsed, onToggle, groups,
}: { user: User; collapsed: boolean; onToggle: () => void; groups: NavGroup[] }) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useClickOutside<HTMLDivElement>(profileOpen, () => setProfileOpen(false));

  return (
    <aside
      style={{ background: 'var(--shp-surface)', borderColor: 'var(--shp-border)' }}
      className={cn(
        'fixed inset-y-0 left-0 z-40 hidden shrink-0 flex-col border-r transition-[width] duration-200 md:flex',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        <ShopLogo collapsed={collapsed} />
        <button
          type="button" onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="grid h-7 w-7 place-items-center rounded-md hover:bg-[color:var(--shp-bg)]"
          style={{ color: 'var(--shp-fg-muted)' }}
        >
          {collapsed ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 pb-4">
        {groups.map((group) => (
          <div key={group.title} className="mt-4 first:mt-1">
            {!collapsed && (
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--shp-fg-faint)' }}>
                {group.title}
              </p>
            )}
            {group.items.map((it) => {
              /*
               * "Active" logic:
               *   - Highlight only on exact-path match. Parent items like
               *     `/shop/ads` must NOT light up when a more specific
               *     sibling (`/shop/ads/active`, `/shop/ads/new`, etc.)
               *     is registered — otherwise both rows glow at once.
               *   - Fallback for items that have no deeper siblings
               *     (e.g. `/shop/messages/123`): still allow a prefix
               *     match so a thread page keeps the "Messages" pill
               *     highlighted.
               */
              const hasChild = groups.some((g) =>
                g.items.some((x) => x.href !== it.href && x.href.startsWith(it.href + '/'))
              );
              const active = pathname === it.href || (
                !hasChild && it.href !== '/shop' && (pathname?.startsWith(it.href + '/') ?? false)
              );
              return <NavItemLink key={it.href} item={it} active={active} collapsed={collapsed} />;
            })}
          </div>
        ))}
      </nav>

      <div className="border-t px-2.5 py-2.5" style={{ borderColor: 'var(--shp-border)' }}>
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition hover:bg-[color:var(--shp-bg)]"
          >
            <span
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #FF003F 0%, #FF003F 100%)' }}
            >
              {(user.name || user.username || '?').slice(0, 2).toUpperCase()}
            </span>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold" style={{ color: 'var(--shp-fg)' }}>
                    {user.name || user.username}
                  </p>
                  <p className="truncate text-[10px]" style={{ color: 'var(--shp-fg-faint)' }}>
                    Shop owner · @{user.username}
                  </p>
                </div>
                <ChevronDown size={14} className="shrink-0" style={{ color: 'var(--shp-fg-faint)' }} />
              </>
            )}
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.12 }}
                style={{
                  background: 'var(--shp-elevated)', borderColor: 'var(--shp-border)', boxShadow: 'var(--shp-shadow-lg)',
                }}
                className="absolute bottom-full mb-2 w-full min-w-[200px] overflow-hidden rounded-lg border py-1"
              >
                <Link
                  href={`/store/${user.username}` as Route} target="_blank" rel="noopener"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-[color:var(--shp-bg)]"
                  style={{ color: 'var(--shp-fg)' }}
                >
                  <ExternalLink size={12} /> View public store
                </Link>
                <Link
                  href={'/shop/profile' as Route} onClick={() => setProfileOpen(false)}
                  className="block px-3 py-2 text-xs hover:bg-[color:var(--shp-bg)]"
                  style={{ color: 'var(--shp-fg)' }}
                >
                  Shop profile
                </Link>
                <div className="my-1 h-px" style={{ background: 'var(--shp-border)' }} />
                <Link
                  href={'/auth/logout' as Route} onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-[color:var(--shp-bg)]"
                  style={{ color: 'var(--shp-danger)' }}
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
        color: active ? 'var(--shp-brand)' : 'var(--shp-fg-muted)',
        background: active ? 'var(--shp-brand-soft)' : 'transparent',
      }}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r"
          style={{ background: 'var(--shp-brand)' }}
        />
      )}
      <span className="shrink-0">{item.icon}</span>
      {!collapsed && <span className="truncate flex-1">{item.label}</span>}
      {!collapsed && typeof item.count === 'number' && item.count > 0 && (
        <span
          className="inline-flex min-w-5 items-center justify-center rounded-full px-2 text-[10px] font-semibold tabular-nums"
          style={{
            background: active ? 'var(--shp-brand)' : 'var(--shp-brand-soft)',
            color:      active ? 'var(--shp-brand-fg)' : 'var(--shp-brand)',
          }}
        >
          {item.count}
        </span>
      )}
    </Link>
  );
}
