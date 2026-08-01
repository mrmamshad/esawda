'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Search, Bell, PlusSquare, ChevronRight, LogOut, User as UserIcon, ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClickOutside } from '@/components/admin/v2/useClickOutside';
import type { User } from '@/types/api';

/**
 * Shop-side topbar — same interaction model as the admin topbar
 * (breadcrumb, search, quick-new, avatar) but wearing the shop
 * warm-coral palette and a shorter, more "storefront" tone.
 *
 * No theme toggle in the shop panel — sellers get one consistent
 * light experience so product images always look right.
 */
export function ShopTopbar({ user }: { user: User }) {
  const pathname = usePathname();
  const crumbs = deriveCrumbs(pathname);
  const [scrolled, setScrolled] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useClickOutside<HTMLDivElement>(avatarOpen, () => setAvatarOpen(false));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const initials = (user.name || user.username || '?').slice(0, 2).toUpperCase();

  return (
    <header
      style={{
        background: 'var(--shp-surface)',
        borderColor: 'var(--shp-border)',
        boxShadow: scrolled ? 'var(--shp-shadow-sm)' : 'none',
      }}
      className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b px-4 md:px-6 transition-shadow"
    >
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5">
        {crumbs.map((c, i) => (
          <span key={c.href + i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={13} style={{ color: 'var(--shp-fg-faint)' }} />}
            {i === crumbs.length - 1 ? (
              <span className="text-[13px] font-semibold" style={{ color: 'var(--shp-fg)' }}>{c.label}</span>
            ) : (
              <Link
                href={c.href as Route}
                className="text-[13px] font-medium transition hover:opacity-80"
                style={{ color: 'var(--shp-fg-muted)' }}
              >
                {c.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      <div className="hidden md:block md:flex-1 md:max-w-md">
        <label className="relative block">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--shp-fg-faint)' }} />
          <input
            type="search"
            placeholder="Search your ads, messages…"
            className="h-9 w-full rounded-lg border pl-9 pr-3 text-[13px] outline-none transition focus:ring-2"
            style={{ background: 'var(--shp-bg)', borderColor: 'var(--shp-border)', color: 'var(--shp-fg)' }}
          />
        </label>
      </div>

      <div className="flex items-center gap-1.5">
        <Link
          href={'/shop/ads/new' as Route}
          className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-[12.5px] font-semibold text-white transition sm:inline-flex active:translate-y-[1px]"
          style={{ background: 'var(--shp-brand)' }}
        >
          <PlusSquare size={14} /> Post ad
        </Link>

        <button
          type="button"
          aria-label="Notifications"
          className="relative grid h-9 w-9 place-items-center rounded-lg transition hover:bg-[color:var(--shp-bg)]"
          style={{ color: 'var(--shp-fg-muted)' }}
        >
          <Bell size={16} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full" style={{ background: 'var(--shp-brand)' }} />
        </button>

        <div className="relative" ref={avatarRef}>
          <button
            onClick={() => setAvatarOpen((v) => !v)}
            aria-label="Account menu"
            className="ml-1 grid h-8 w-8 place-items-center rounded-full text-[10px] font-semibold text-white transition hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #E43356 0%, #F97316 100%)' }}
            title={user.name || user.username}
          >
            {initials}
          </button>
          <AnimatePresence>
            {avatarOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.12 }}
                style={{ background: 'var(--shp-elevated)', borderColor: 'var(--shp-border)', boxShadow: 'var(--shp-shadow-lg)' }}
                className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-lg border py-1"
              >
                <div className="border-b px-3 py-2.5" style={{ borderColor: 'var(--shp-border)' }}>
                  <p className="truncate text-[12.5px] font-semibold" style={{ color: 'var(--shp-fg)' }}>
                    {user.name || user.username}
                  </p>
                  <p className="truncate text-[11px]" style={{ color: 'var(--shp-fg-faint)' }}>
                    {user.email}
                  </p>
                </div>
                <ItemLink href="/shop/profile"           icon={<UserIcon size={13} />}    label="Shop profile"      onClick={() => setAvatarOpen(false)} />
                <ItemLink href={`/store/${user.username}`} icon={<ExternalLink size={13} />} label="View public store" newTab onClick={() => setAvatarOpen(false)} />
                <div className="my-1 h-px" style={{ background: 'var(--shp-border)' }} />
                <ItemLink href="/auth/logout"             icon={<LogOut size={13} />}      label="Sign out"           danger onClick={() => setAvatarOpen(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

function ItemLink({
  href, icon, label, danger, newTab, onClick,
}: { href: string; icon: React.ReactNode; label: string; danger?: boolean; newTab?: boolean; onClick?: () => void }) {
  return (
    <Link
      href={href as Route}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noopener noreferrer' : undefined}
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 text-[12.5px] transition hover:bg-[color:var(--shp-bg)]"
      style={{ color: danger ? 'var(--shp-danger)' : 'var(--shp-fg)' }}
    >
      {icon} {label}
    </Link>
  );
}

function deriveCrumbs(pathname: string | null): { label: string; href: string }[] {
  if (!pathname) return [{ label: 'Shop', href: '/shop' }];
  const parts = pathname.replace(/^\/+|\/+$/g, '').split('/');
  if (parts[0] !== 'shop') return [{ label: 'Shop', href: '/shop' }];
  const rest = parts.slice(1);
  if (rest.length === 0) return [{ label: 'Dashboard', href: '/shop' }];
  const crumbs = [{ label: 'Shop', href: '/shop' }];
  let acc = '/shop';
  for (const seg of rest) {
    acc += '/' + seg;
    crumbs.push({ label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '), href: acc });
  }
  return crumbs;
}
