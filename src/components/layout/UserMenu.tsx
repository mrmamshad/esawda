'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { LayoutDashboard, Heart, Package, Settings, LogOut, Receipt, Store, ShieldCheck } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/cn';
import type { User } from '@/types/api';

/**
 * Header user chip → dropdown menu. Wraps the avatar/name pill in a
 * button that toggles a floating panel with quick links (Dashboard, My
 * Ads, Favourites, Settings) and — most importantly — the **Logout**
 * action. Clicking Logout hits `/auth/logout` which runs the sanctum
 * revoke + cookie clear before bouncing home.
 *
 * Closes on: outside click, Escape, or route change (via Link's implicit
 * navigation — panel unmounts when the header re-renders).
 */
export function UserMenu({ user, onDark = false }: { user: User; onDark?: boolean }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      {/*
        Header chip = just the round avatar. Name / handle move into the
        dropdown panel below (see the header row). Keeps the top bar clean
        even for long display names, and matches the pattern used by
        bikroy / gmail / github.
      */}
      {/*
        Bare round avatar — no outer chip, no double border. The <Avatar>
        component already ships with a subtle white `ring-2` so we don't
        add another one here; instead the button just handles focus/hover
        via a soft glow ring that only appears on interaction.
      */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user.name}`}
        title={user.name}
        className={cn(
          'group relative inline-flex items-center justify-center rounded-full transition',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
          onDark ? 'focus-visible:ring-offset-brand-900' : 'focus-visible:ring-offset-white',
        )}
      >
        <span className="block transition duration-200 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-brand-500/20 rounded-full">
          <Avatar src={user.avatar_url} alt={user.name} size="sm" online={user.online} />
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-2xl border border-line bg-white shadow-2xl"
        >
          <div className="flex items-center gap-3 border-b border-line bg-surface-muted px-4 py-3">
            <Avatar src={user.avatar_url} alt={user.name} size="md" online={user.online} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
              <p className="truncate text-xs text-ink-muted">{user.email}</p>
            </div>
          </div>

          {/*
            All quick links point at the real /shop/* panel routes — that
            surface already implements the DashboardShell / SidebarNav
            design pattern (see components/dashboard/DashboardShell.tsx),
            so we don't need to duplicate five near-identical pages under
            /dashboard/*. `/dashboard` itself already redirects to /shop.

            "My Public Store" is only shown when the user is actually a
            seller (has a public store page); regular buyers don't see it.
          */}
          <nav className="py-1 text-sm">
            {/*
              Role-aware routing:
              - Admins → jump straight to /admin panel
              - Shops  → /shop dashboard (Figma "Shop Dashboard")
              - Buyers → /dashboard (simple buyer profile)
            */}
            {user.is_admin && (
              <Item href={'/admin' as Route}            icon={<ShieldCheck size={16} />}     label="Admin Panel"       onClick={() => setOpen(false)} />
            )}
            {user.is_shop ? (
              <>
                <Item href={'/shop' as Route}           icon={<LayoutDashboard size={16} />} label="Shop Dashboard"    onClick={() => setOpen(false)} />
                <Item href={'/shop/ads' as Route}       icon={<Package size={16} />}         label="My Ads"            onClick={() => setOpen(false)} />
                <Item href={`/store/${user.username}` as Route} icon={<Store size={16} />}   label="My Public Store"   onClick={() => setOpen(false)} />
              </>
            ) : (
              <Item href={'/dashboard' as Route}        icon={<LayoutDashboard size={16} />} label="My Dashboard"       onClick={() => setOpen(false)} />
            )}
            <Item href={'/shop/favourites' as Route}    icon={<Heart size={16} />}           label="Favourites"        onClick={() => setOpen(false)} />
            <Item href={'/shop/messages' as Route}      icon={<Store size={16} />}           label="Messages"          onClick={() => setOpen(false)} />
            <Item href={'/shop/transactions' as Route}  icon={<Receipt size={16} />}         label="Transactions"      onClick={() => setOpen(false)} />
            <Item href={'/shop/settings' as Route}      icon={<Settings size={16} />}        label="Account Settings"  onClick={() => setOpen(false)} />
          </nav>

          <div className="border-t border-line py-1">
            <Link
              href={'/auth/logout' as Route}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-red-50"
              role="menuitem"
            >
              <LogOut size={16} />
              <span className="font-medium">Log out</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function Item({
  href, icon, label, onClick,
}: { href: Route; icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      role="menuitem"
      className="flex items-center gap-2 px-4 py-2 text-ink hover:bg-surface-muted"
    >
      <span className="text-ink-muted">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
