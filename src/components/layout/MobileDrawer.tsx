'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { Menu, X, ChevronRight, LogOut, LogIn, UserPlus } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthGate } from '@/components/interactive/AuthGate';
import { cn } from '@/lib/cn';

// All authenticated destinations live under /shop/* (the DashboardShell
// panel). /dashboard is a legacy redirect to /shop, so linking directly
// to /shop/* avoids the extra hop.
const LINKS: { href: string; label: string }[] = [
  { href: '/ads',                   label: 'Browse ads' },
  { href: '/shop/ads/new',        label: 'Post ad' },
  { href: '/shop',                label: 'Dashboard' },
  { href: '/shop/ads',            label: 'My ads' },
  { href: '/shop/favourites',     label: 'Favourites' },
  { href: '/shop/transactions',   label: 'Transactions' },
  { href: '/messages',              label: 'Messages' },
  { href: '/shop/settings',       label: 'Settings' },
  { href: '/membership',            label: 'Membership' },
  { href: '/blog',                  label: 'Blog' },
  { href: '/faq',                   label: 'FAQ' },
  { href: '/contact',               label: 'Contact' },
];

/**
 * Mobile navigation drawer. Renders the eSawda wordmark, the primary link
 * list, and — new — a user card header + Log out footer when signed in
 * (mirrors what the desktop `<UserMenu>` shows). Signed-out visitors get
 * Sign in / Register CTAs at the bottom instead.
 */
export function MobileDrawer({ onDark = false }: { onDark?: boolean }) {
  const [open, setOpen] = useState(false);
  const { user } = useAuthGate();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className={cn(
          'inline-flex h-10 w-10 items-center justify-center rounded-pill btn-focus md:hidden',
          onDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-brand-50 text-brand-700 hover:bg-brand-100',
        )}
      >
        <Menu size={18} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-brand-950/50" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-popover flex flex-col">
            <div className="flex items-center justify-between border-b border-line p-4">
              <span className="text-lg font-bold">
                <span className="text-brand-500">e</span>
                <span className="text-brand-900">Shauda</span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-pill text-ink-muted hover:bg-brand-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* User card — only for authenticated visitors */}
            {user && (
              <div className="flex items-center gap-3 border-b border-line bg-surface-muted px-4 py-3">
                <Avatar src={user.avatar_url} alt={user.name} size="md" online={user.online} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                  <p className="truncate text-xs text-ink-muted">{user.email}</p>
                </div>
              </div>
            )}

            <nav className="flex-1 overflow-y-auto p-2">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href as Route}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-field px-3 py-3 text-sm font-medium text-ink hover:bg-brand-50"
                >
                  <span>{l.label}</span>
                  <ChevronRight size={16} className="text-ink-faint" />
                </Link>
              ))}
            </nav>

            {/* Auth footer */}
            <div className="border-t border-line p-3">
              {user ? (
                <Link
                  href={'/auth/logout' as Route}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-field px-3 py-3 text-sm font-semibold text-danger hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Log out
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={'/auth/login' as Route}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-field border border-line px-3 py-2.5 text-sm font-semibold text-ink hover:bg-brand-50"
                  >
                    <LogIn size={14} />
                    Sign in
                  </Link>
                  <Link
                    href={'/auth/signup' as Route}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-field bg-brand-500 px-3 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
                  >
                    <UserPlus size={14} />
                    Register
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
