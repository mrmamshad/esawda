'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Logo } from './Logo';
import { MobileDrawer } from './MobileDrawer';
import { SearchAutocomplete } from '@/components/interactive/SearchAutocomplete';
import { UserMenu } from './UserMenu';
import { cn } from '@/lib/cn';
import type { User } from '@/types/api';

/**
 * eSawda header — reference-matched top bar.
 *
 * Design copy of the customer-supplied reference (eSawda landing sample):
 *  ┌─────────────────────────────────────────────────────────────────┐
 *  │  [logo]        Home  Services  Features  About Us  Contact  [Get Started] │
 *  └─────────────────────────────────────────────────────────────────┘
 *
 * The header sits directly on the page — no floating pill anymore — so
 * it visually matches the reference exactly. Nav items are simple text
 * links (no dropdown chevrons) and the CTA is a solid red rounded pill.
 *
 * `variant` is preserved for API compatibility with existing callers:
 *   default   → dark ink text on light canvas
 *   onDark    → white text on dark hero photography
 *   compact   → same as default with tighter padding
 */
type NavItem = { label: string; href: Route };

const NAV: NavItem[] = [
  { label: 'Home',      href: '/' as Route },
  { label: 'Products',  href: '/ads' as Route },
  { label: 'About Us',  href: '/about' as Route },
  { label: 'Contact',   href: '/contact' as Route },
];

export function Header({
  variant = 'default',
  user,
  showSearch = false,
  className,
}: { variant?: 'default' | 'onDark' | 'compact'; user?: User | null; showSearch?: boolean; className?: string }) {
  const onDark = variant === 'onDark';
  const compact = variant === 'compact';

  // Small scroll cue: after user scrolls a touch we drop a soft shadow on
  // the header background so it lifts off the page when content flows
  // beneath it. Keeps the layout identical, only the surface changes.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const inkText   = onDark ? 'text-white' : 'text-[#0F1524]';
  const navText   = onDark ? 'text-white/85 hover:text-white' : 'text-[#0F1524]/80 hover:text-[#0F1524]';
  const surface   = scrolled
    ? (onDark
        ? 'bg-black/45 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_24px_-16px_rgba(0,0,0,0.45)]'
        : 'bg-white/90 backdrop-blur-xl border-b border-black/5 shadow-[0_8px_24px_-16px_rgba(15,20,40,0.18)]')
    : 'bg-transparent border-b border-transparent';

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 w-full transition-[background-color,box-shadow,border-color] duration-300',
        surface,
        inkText,
        className,
      )}
    >
      <div
        className={cn(
          'mx-auto flex w-full max-w-[1440px] items-center gap-6 px-6 md:px-12 lg:px-16',
          compact ? 'h-16' : 'h-[84px]',
        )}
      >
        <Logo variant={onDark ? 'onDark' : 'default'} height={compact ? 40 : 48} />

        {/* Center nav — reference-matched plain text links */}
        {showSearch ? (
          <div className="hidden md:block md:flex-1 md:max-w-md mx-auto">
            <SearchAutocomplete />
          </div>
        ) : (
          <nav className="hidden lg:flex flex-1 items-center justify-center gap-8">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'text-[15px] font-medium tracking-[0.1px] transition-colors',
                  navText,
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right cluster — user chip / Get Started + optional Post Ad */}
        <div className="ml-auto flex items-center gap-2 md:gap-3">
          {user ? (
            <>
              <UserMenu user={user} onDark={onDark} />
              <Link href={'/shop/ads/new' as Route} className="hidden sm:inline-flex">
                <Button variant="filled" size="sm" leftIcon={<Plus size={16} />}>Post Ad</Button>
              </Link>
            </>
          ) : (
            <Link href={'/shop/ads/new' as Route} className="hidden sm:inline-flex">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-[14px] font-semibold text-white transition active:translate-y-[1px] hover:brightness-95"
                style={{
                  backgroundColor: '#FF003F',
                  boxShadow: '0 10px 22px -10px rgba(255,0,63,0.55)',
                }}
              >
                Post an Ad
              </button>
            </Link>
          )}

          <MobileDrawer onDark={onDark} />
        </div>
      </div>
    </header>
  );
}

/**
 * Spacer that reserves the vertical space the fixed header occupies, so
 * page content below doesn't slide under it. Height matches the header
 * (84px default, 64px compact) with a tiny breathing gap.
 */
export function HeaderSpacer({ compact = false }: { compact?: boolean }) {
  return <div aria-hidden className={compact ? 'h-16' : 'h-[84px]'} />;
}
