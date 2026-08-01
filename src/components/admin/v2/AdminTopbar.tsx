'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Search, Bell, Plus, ChevronRight, LogOut,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { useClickOutside } from './useClickOutside';
import type { User } from '@/types/api';

/**
 * Sticky topbar — 64px tall, sits above the content on scroll.
 * Contains: breadcrumb, global search, quick-new dropdown, theme
 * toggle, notification bell, and avatar. NEVER shows the public site's
 * "Explore / Post Ad / EN" chrome.
 */
export function AdminTopbar({ user }: { user: User }) {
  const pathname = usePathname();
  const crumbs = deriveCrumbs(pathname);
  const [scrolled, setScrolled] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const newRef    = useClickOutside<HTMLDivElement>(newOpen,    () => setNewOpen(false));
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
        background: 'var(--adm-surface)',
        borderColor: 'var(--adm-border)',
        boxShadow: scrolled ? 'var(--adm-shadow-sm)' : 'none',
      }}
      className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b px-4 md:px-6 transition-shadow"
    >
      {/* ── Breadcrumb ── */}
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5">
        {crumbs.map((c, i) => (
          <span key={c.href + i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={13} style={{ color: 'var(--adm-fg-faint)' }} />}
            {i === crumbs.length - 1 ? (
              <span className="text-[13px] font-semibold" style={{ color: 'var(--adm-fg)' }}>{c.label}</span>
            ) : (
              <Link
                href={c.href as Route}
                className="text-[13px] font-medium transition hover:opacity-80"
                style={{ color: 'var(--adm-fg-muted)' }}
              >
                {c.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* ── Search ── */}
      <div className="hidden md:block md:flex-1 md:max-w-md">
        <label className="relative block">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--adm-fg-faint)' }} />
          <input
            type="search"
            placeholder="Search users, ads, transactions…"
            className="h-9 w-full rounded-lg border pl-9 pr-14 text-[13px] outline-none transition focus:ring-2"
            style={{
              background: 'var(--adm-bg)',
              borderColor: 'var(--adm-border)',
              color: 'var(--adm-fg)',
            }}
          />
          <kbd
            className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-md border px-1.5 py-0.5 text-[10px] font-mono md:inline-block"
            style={{
              background: 'var(--adm-surface)',
              borderColor: 'var(--adm-border)',
              color: 'var(--adm-fg-faint)',
            }}
          >⌘K</kbd>
        </label>
      </div>

      {/* ── Right cluster ── */}
      <div className="flex items-center gap-1.5">
        {/* Quick-new dropdown */}
        <div className="relative" ref={newRef}>
          <button
            onClick={() => { setNewOpen((v) => !v); setAvatarOpen(false); }}
            className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-[12.5px] font-semibold text-white transition sm:inline-flex active:translate-y-[1px]"
            style={{ background: 'var(--adm-brand)' }}
          >
            <Plus size={14} /> New
          </button>
          <AnimatePresence>
            {newOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.12 }}
                style={{
                  background: 'var(--adm-elevated)',
                  borderColor: 'var(--adm-border)',
                  boxShadow: 'var(--adm-shadow-lg)',
                }}
                className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-lg border py-1"
              >
                {[
                  // Admin quick-new stays inside the admin panel so operators
                  // never bounce out to the public/shop chrome mid-workflow.
                  { href: '/admin/ads/new',  label: 'New ad' },
                  { href: '/admin/users',    label: 'New user' },
                  { href: '/admin/blog/new', label: 'New blog post' },
                ].map((it) => (
                  <Link
                    key={it.href}
                    href={it.href as Route}
                    onClick={() => setNewOpen(false)}
                    className="block px-3 py-2 text-[12.5px] hover:bg-[color:var(--adm-bg)]"
                    style={{ color: 'var(--adm-fg)' }}
                  >
                    {it.label}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <IconBtn label="Notifications">
          <Bell size={16} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full" style={{ background: 'var(--adm-brand)' }} />
        </IconBtn>

        {/* Avatar with click-open dropdown */}
        <div className="relative" ref={avatarRef}>
          <button
            onClick={() => { setAvatarOpen((v) => !v); setNewOpen(false); }}
            aria-label="Account menu"
            className="ml-1 grid h-8 w-8 place-items-center rounded-full text-[10px] font-semibold text-white transition hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #E43356 0%, #4F46E5 100%)' }}
            title={user.name || user.username}
          >
            {initials}
          </button>
          <AnimatePresence>
            {avatarOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.12 }}
                style={{
                  background: 'var(--adm-elevated)',
                  borderColor: 'var(--adm-border)',
                  boxShadow: 'var(--adm-shadow-lg)',
                }}
                className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-lg border py-1"
              >
                <div className="border-b px-3 py-2.5" style={{ borderColor: 'var(--adm-border)' }}>
                  <p className="truncate text-[12.5px] font-semibold" style={{ color: 'var(--adm-fg)' }}>
                    {user.name || user.username}
                  </p>
                  <p className="truncate text-[11px]" style={{ color: 'var(--adm-fg-faint)' }}>
                    {user.email}
                  </p>
                </div>
                <MenuLink href="/auth/logout"   icon={<LogOut   size={13} />} label="Sign out"   danger onClick={() => setAvatarOpen(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

function MenuLink({
  href, icon, label, danger, onClick,
}: { href: string; icon: React.ReactNode; label: string; danger?: boolean; onClick?: () => void }) {
  return (
    <Link
      href={href as Route}
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 text-[12.5px] transition hover:bg-[color:var(--adm-bg)]"
      style={{ color: danger ? 'var(--adm-danger)' : 'var(--adm-fg)' }}
    >
      {icon} {label}
    </Link>
  );
}

function IconBtn({
  children, onClick, label,
}: { children: React.ReactNode; onClick?: () => void; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'relative grid h-9 w-9 place-items-center rounded-lg transition',
        'hover:bg-[color:var(--adm-bg)]',
      )}
      style={{ color: 'var(--adm-fg-muted)' }}
    >
      {children}
    </button>
  );
}

function deriveCrumbs(pathname: string | null): { label: string; href: string }[] {
  if (!pathname) return [{ label: 'Dashboard', href: '/admin' }];
  const parts = pathname.replace(/^\/+|\/+$/g, '').split('/');
  if (parts[0] !== 'admin') return [{ label: 'Dashboard', href: '/admin' }];
  const rest = parts.slice(1);
  if (rest.length === 0) return [{ label: 'Dashboard', href: '/admin' }];
  const crumbs = [{ label: 'Dashboard', href: '/admin' }];
  let acc = '/admin';
  for (const seg of rest) {
    acc += '/' + seg;
    crumbs.push({ label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '), href: acc });
  }
  return crumbs;
}
