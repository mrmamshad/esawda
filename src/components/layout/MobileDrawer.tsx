'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  LogOut,
  LogIn,
  UserPlus,
  Car,
  Smartphone,
  WashingMachine,
  Home,
  Cpu,
  Sofa,
  Bike,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Logo } from './Logo';
import { startPageScroll, stopPageScroll } from '@/components/interactive/SmoothScroll';
import { useAuthGate } from '@/components/interactive/AuthGate';
import { cn } from '@/lib/cn';

type NavLink = { href: Route; label: string };
type CategoryLink = { href: Route; label: string; icon: ReactNode };

const GUEST_PRIMARY: NavLink[] = [
  { href: '/' as Route,            label: 'Home' },
  { href: '/ads' as Route,         label: 'Browse ads' },
  { href: '/shops' as Route,       label: 'Browse shops' },
  { href: '/post/product' as Route, label: 'Post ad' },
];

const GUEST_OTHERS: NavLink[] = [
  { href: '/about' as Route,   label: 'About us' },
  { href: '/blog' as Route,    label: 'Blog' },
  { href: '/contact' as Route, label: 'Contact' },
];

const CATEGORY_LINKS: CategoryLink[] = [
  { href: '/category/vehicles' as Route,    label: 'Vehicles',    icon: <Car size={14} /> },
  { href: '/category/smartphones' as Route, label: 'Smartphones', icon: <Smartphone size={14} /> },
  { href: '/category/appliances' as Route,  label: 'Appliances',  icon: <WashingMachine size={14} /> },
  { href: '/category/houses' as Route,      label: 'Houses',      icon: <Home size={14} /> },
  { href: '/category/electronics' as Route, label: 'Electronics', icon: <Cpu size={14} /> },
  { href: '/category/furniture' as Route,   label: 'Furniture',   icon: <Sofa size={14} /> },
  { href: '/category/bikes' as Route,       label: 'Bikes',       icon: <Bike size={14} /> },
];

function getAuthLinks(isSeller: boolean): NavLink[] {
  if (isSeller) {
    return [
      { href: '/ads' as Route,               label: 'Browse ads' },
      { href: '/shops' as Route,             label: 'Browse shops' },
      { href: '/shop' as Route,              label: 'Dashboard' },
      { href: '/shop/ads' as Route,          label: 'My products' },
      { href: '/shop/orders' as Route,       label: 'Orders' },
      { href: '/messages' as Route,          label: 'Messages' },
      { href: '/shop/transactions' as Route, label: 'Transactions' },
      { href: '/shop/settings' as Route,     label: 'Settings' },
    ];
  }

  return [
    { href: '/ads' as Route,          label: 'Browse ads' },
    { href: '/shops' as Route,        label: 'Browse shops' },
    { href: '/dashboard' as Route,    label: 'Dashboard' },
    { href: '/messages' as Route,     label: 'Messages' },
    { href: '/post/product' as Route, label: 'Post ad' },
    { href: '/membership' as Route,   label: 'Membership' },
    { href: '/contact' as Route,      label: 'Support' },
  ];
}

/**
 * Mobile navigation drawer.
 *
 * UX rules:
 * - Signed-out visitors see a compact buyer-first menu (no dashboard clutter).
 * - Categories and secondary pages live behind accordions ("Categories", "Others").
 * - Signed-in visitors see role-aware shortcuts.
 */
export function MobileDrawer({ onDark = false }: { onDark?: boolean }) {
  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [othersOpen, setOthersOpen] = useState(false);
  const { user } = useAuthGate();

  const isSeller = Boolean(user?.is_shop || user?.user_type === 'seller');
  const authLinks = getAuthLinks(isSeller);

  // When opening after page scroll, always start the drawer from a clean state.
  useEffect(() => {
    if (!open) return;
    setCategoriesOpen(false);
    setOthersOpen(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    stopPageScroll();
    return () => { startPageScroll(); };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setCategoriesOpen(false);
      setOthersOpen(false);
    }
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
        <div className="fixed inset-0 z-[120] md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-brand-950/55"
            onClick={() => setOpen(false)}
          />

          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="absolute right-0 top-0 flex h-[100dvh] w-80 max-w-[88vw] flex-col overflow-hidden bg-white shadow-popover"
          >
            <div className="flex items-center justify-between border-b border-line p-4">
              <div className="shrink-0">
                <Logo height={34} />
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-pill text-ink-muted hover:bg-brand-50"
              >
                <X size={18} />
              </button>
            </div>

            {user && (
              <div className="flex items-center gap-3 border-b border-line bg-surface-muted px-4 py-3">
                <Avatar src={user.avatar_url} alt={user.name} size="md" online={user.online} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                  <p className="truncate text-xs text-ink-muted">{user.email}</p>
                </div>
              </div>
            )}

            <nav data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
              {user ? (
                <>
                  {authLinks.map((l) => (
                    <DrawerLink key={l.href} href={l.href} label={l.label} onClick={() => setOpen(false)} />
                  ))}
                </>
              ) : (
                <>
                  {GUEST_PRIMARY.map((l) => (
                    <DrawerLink key={l.href} href={l.href} label={l.label} onClick={() => setOpen(false)} />
                  ))}

                  <AccordionRow
                    label="Categories"
                    open={categoriesOpen}
                    onToggle={() => setCategoriesOpen((v) => !v)}
                  />
                  {categoriesOpen && (
                    <div className="mb-2 mt-1 space-y-1 pl-2">
                      {CATEGORY_LINKS.map((c) => (
                        <Link
                          key={c.href}
                          href={c.href}
                          onClick={() => setOpen(false)}
                          className="flex items-center justify-between rounded-field px-3 py-2.5 text-[13px] font-medium text-ink hover:bg-brand-50"
                        >
                          <span className="inline-flex items-center gap-2">
                            <span className="text-brand-700">{c.icon}</span>
                            {c.label}
                          </span>
                          <ChevronRight size={15} className="text-ink-faint" />
                        </Link>
                      ))}
                    </div>
                  )}

                  <AccordionRow
                    label="Others"
                    open={othersOpen}
                    onToggle={() => setOthersOpen((v) => !v)}
                  />
                  {othersOpen && (
                    <div className="mb-2 mt-1 space-y-1 pl-2">
                      {GUEST_OTHERS.map((l) => (
                        <DrawerLink key={l.href} href={l.href} label={l.label} onClick={() => setOpen(false)} compact />
                      ))}
                    </div>
                  )}
                </>
              )}
            </nav>

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
                    href={'/login' as Route}
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

function DrawerLink({
  href,
  label,
  onClick,
  compact = false,
}: {
  href: Route;
  label: string;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center justify-between rounded-field px-3 text-sm font-medium text-ink hover:bg-brand-50',
        compact ? 'py-2.5' : 'py-3',
      )}
    >
      <span>{label}</span>
      <ChevronRight size={16} className="text-ink-faint" />
    </Link>
  );
}

function AccordionRow({
  label,
  open,
  onToggle,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="mt-1 flex w-full items-center justify-between rounded-field px-3 py-3 text-sm font-semibold text-ink hover:bg-brand-50"
      aria-expanded={open}
    >
      <span>{label}</span>
      <ChevronDown
        size={16}
        className={cn('text-ink-faint transition-transform', open && 'rotate-180')}
      />
    </button>
  );
}
