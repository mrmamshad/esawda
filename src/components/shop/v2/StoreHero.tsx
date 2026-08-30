import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import { Star, BadgeCheck, ExternalLink, ShoppingBag } from 'lucide-react';
import type { User } from '@/types/api';
import { BannerUpload } from '@/components/shop/v2/BannerUpload';

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
  const shopName  = user.shop_name || user.name || user.username || 'My Shop';
  const ownerName = user.name || user.username;

  return (
    <section
      className="overflow-hidden rounded-2xl border"
      style={{
        background: 'var(--shp-surface)',
        borderColor: 'var(--shp-border)',
        boxShadow: 'var(--shp-shadow-sm)',
      }}
    >
      <BannerUpload user={user} />

      <div className="px-5 pb-5 sm:px-6 md:px-7 md:pb-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div
              className="relative -mt-9 h-[76px] w-[76px] shrink-0 overflow-hidden rounded-2xl border-4 sm:-mt-10 sm:h-20 sm:w-20"
              style={{
                background: 'var(--shp-surface)',
                borderColor: 'var(--shp-surface)',
                boxShadow: '0 10px 28px rgba(20, 15, 24, 0.16)',
              }}
            >
              {user.avatar_set ? (
                <Image src={user.avatar_url} alt={shopName} fill sizes="80px" className="object-cover" />
              ) : (
                <div
                  className="grid h-full w-full place-items-center text-xl font-bold"
                  style={{ background: 'var(--shp-brand-soft)', color: 'var(--shp-brand)' }}
                >
                  {shopName.trim().charAt(0).toUpperCase() || 'S'}
                </div>
              )}
            </div>

            <div className="min-w-0 pt-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-bold tracking-tight md:text-xl" style={{ color: 'var(--shp-fg)' }}>
                  {shopName}
                </h2>
                {user.shop_verified === true && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                    style={{ background: 'var(--shp-brand-soft)', color: 'var(--shp-brand)' }}
                  >
                    <BadgeCheck size={11} /> Verified
                  </span>
                )}
              </div>
              {ownerName && (
                <p className="mt-0.5 text-[13px]" style={{ color: 'var(--shp-fg-muted)' }}>
                  Owner: <span className="font-semibold" style={{ color: 'var(--shp-fg)' }}>{ownerName}</span>
                </p>
              )}
              <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[13px]" style={{ color: 'var(--shp-fg-muted)' }}>
                <Star size={13} className="fill-current" style={{ color: 'var(--shp-gold)' }} />
                <span className="font-semibold tabular-nums" style={{ color: 'var(--shp-fg)' }}>{rating.toFixed(1)}</span>
                <span style={{ color: 'var(--shp-fg-faint)' }}>/ 5</span>
                {reviewsCount > 0 && <span style={{ color: 'var(--shp-fg-faint)' }}>· {reviewsCount} reviews</span>}
                <span className="mx-0.5" style={{ color: 'var(--shp-fg-faint)' }}>·</span>
                <span className="font-mono text-xs" style={{ color: 'var(--shp-fg-faint)' }}>@{user.username}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center lg:justify-end">
            <MiniStat label="Total Orders" value={totalOrders} icon={<ShoppingBag size={15} />} tone="brand" />
            <MiniStat label="Active Orders" value={activeOrders} icon={<ShoppingBag size={15} />} tone="accent" />
            <Link
              href={`/store/${user.username}` as Route}
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-2 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[12px] font-semibold transition hover:bg-black/[0.025] sm:self-center"
              style={{ borderColor: 'var(--shp-border)', color: 'var(--shp-fg)' }}
            >
              View public store <ExternalLink size={12} />
            </Link>
          </div>
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
