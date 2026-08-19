import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import { Star, ExternalLink, Store, ShoppingBag } from 'lucide-react';
import type { User } from '@/types/api';

/**
 * Storefront header at the top of the Shop Dashboard.
 * Shows: avatar + shop name + star rating + username + KPI chips.
 * Distinct from admin — feels product/shop centric, not corporate.
 */
export function StoreHero({
  user, rating, reviewsCount, totalOrders, activeOrders,
}: {
  user: User;
  rating: number;
  reviewsCount: number;
  totalOrders: number;
  activeOrders: number;
}) {
  const shopName = user.name || user.username || 'My Shop';

  return (
    <section
      className="relative overflow-hidden rounded-2xl border p-6 md:p-7"
      style={{
        background:
          'linear-gradient(135deg, rgba(228,51,86,0.06) 0%, rgba(249,115,22,0.04) 100%), var(--shp-surface)',
        borderColor: 'var(--shp-border)',
        boxShadow: 'var(--shp-shadow-sm)',
      }}
    >
      {/* Decorative blobs to give the shop hero life */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-40px] top-[-40px] h-40 w-40 rounded-full opacity-40 blur-3xl"
          style={{ background: 'var(--shp-brand)' }} />
        <div className="absolute right-40 bottom-[-40px] h-32 w-32 rounded-full opacity-30 blur-3xl"
          style={{ background: 'var(--shp-accent)' }} />
      </div>

      <div className="relative flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-4 flex-1 min-w-[240px]">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2" style={{ boxShadow: '0 0 0 4px var(--shp-brand-soft)' }}>
            {user.avatar_set ? (
              <Image src={user.avatar_url} alt={shopName} fill sizes="64px" className="object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-lg font-bold" style={{ background: 'var(--shp-brand-soft)', color: 'var(--shp-brand)' }}>
                {shopName.trim().charAt(0).toUpperCase() || 'S'}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight md:text-xl" style={{ color: 'var(--shp-fg)' }}>
                {shopName}
              </h2>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                style={{ background: 'var(--shp-brand-soft)', color: 'var(--shp-brand)' }}
              >
                <Store size={10} /> Verified shop
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-[13px]" style={{ color: 'var(--shp-fg-muted)' }}>
              <Star size={13} className="fill-current" style={{ color: 'var(--shp-gold)' }} />
              <span className="font-semibold tabular-nums" style={{ color: 'var(--shp-fg)' }}>{rating.toFixed(1)}</span>
              <span style={{ color: 'var(--shp-fg-faint)' }}>/ 5</span>
              {reviewsCount > 0 && <span style={{ color: 'var(--shp-fg-faint)' }}>· {reviewsCount} reviews</span>}
              <span className="mx-1" style={{ color: 'var(--shp-fg-faint)' }}>·</span>
              <span className="font-mono text-xs" style={{ color: 'var(--shp-fg-faint)' }}>@{user.username}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <MiniStat label="Total Orders"  value={totalOrders}  icon={<ShoppingBag size={15} />} tone="brand" />
          <MiniStat label="Active Orders" value={activeOrders} icon={<ShoppingBag size={15} />} tone="accent" />
          <Link
            href={`/store/${user.username}` as Route} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 self-center rounded-lg border px-3 py-2 text-[12px] font-semibold transition hover:opacity-80"
            style={{ borderColor: 'var(--shp-border)', color: 'var(--shp-fg)' }}
          >
            View public store <ExternalLink size={12} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function MiniStat({
  label, value, icon, tone,
}: { label: string; value: number; icon: React.ReactNode; tone: 'brand' | 'accent' }) {
  return (
    <div
      className="flex items-center gap-2.5 rounded-lg border px-3 py-2"
      style={{ borderColor: 'var(--shp-border)', background: 'var(--shp-surface)' }}
    >
      <span
        className="grid h-8 w-8 place-items-center rounded-md"
        style={{
          background: tone === 'brand' ? 'var(--shp-brand-soft)' : 'var(--shp-accent-soft)',
          color:      tone === 'brand' ? 'var(--shp-brand)'      : 'var(--shp-accent)',
        }}
      >
        {icon}
      </span>
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: 'var(--shp-fg-faint)' }}>
          {label}
        </p>
        <p className="text-base font-bold tabular-nums leading-tight" style={{ color: 'var(--shp-fg)' }}>
          {value}
        </p>
      </div>
    </div>
  );
}
