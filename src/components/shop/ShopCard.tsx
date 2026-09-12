import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import { ArrowUpRight, BadgeCheck, MapPin, PackageCheck } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import type { Shop } from '@/types/api';

/** Public shop profile card for the Shops directory. */
export function ShopCard({ shop }: { shop: Shop }) {
  const href = `/store/${shop.username}` as Route;
  const banner = shop.shop_banner_url || shop.cover_url;
  const location = [shop.location.city, shop.location.country].filter(Boolean).join(', ')
    || shop.location.address;

  return (
    <article className="surface-card group flex h-full min-w-0 flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-cardHover">
      <Link href={href} className="relative block h-32 overflow-hidden bg-brand-900" tabIndex={-1}>
        {banner ? (
          <Image
            src={banner}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
            unoptimized
          />
        ) : (
          <>
            <span className="absolute -right-8 -top-12 h-36 w-36 rounded-full border-[24px] border-white/10" />
            <span className="absolute -bottom-14 left-10 h-28 w-28 rounded-full border-[20px] border-brand-400/20" />
          </>
        )}
        <span className="absolute inset-0 bg-brand-950/20" />
        {shop.shop_category && (
          <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-brand-950/70 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            {shop.shop_category}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col px-5 pb-5">
        <div className="relative -mt-10 flex items-end justify-between gap-3">
          <Link href={href} aria-label={`Open ${shop.shop_name}`} className="rounded-full btn-focus">
            <Avatar
              src={shop.avatar_url}
              alt={shop.shop_name}
              size="xl"
              online={shop.online}
              className="ring-4 ring-white"
            />
          </Link>
          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
            <PackageCheck size={15} className="text-brand-700" />
            {shop.stats.active_products.toLocaleString('en-US')} products
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="line-clamp-1 text-lg font-bold text-ink">
              <Link href={href} className="rounded-sm transition hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                {shop.shop_name}
              </Link>
            </h2>
          </div>
          {shop.shop_verified && (
            <span title="Verified shop" aria-label="Verified shop" className="mt-0.5 text-green-600">
              <BadgeCheck size={20} />
            </span>
          )}
        </div>

        <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-ink-muted">
          {shop.shop_description || 'Browse products and discover what this shop has to offer.'}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4 text-sm">
          <span className="inline-flex min-w-0 items-center gap-1.5 text-ink-muted">
            <MapPin size={14} className="shrink-0 text-brand-700" />
            <span className="truncate">{location || 'Bangladesh'}</span>
          </span>
          <Link href={href} className="inline-flex shrink-0 items-center gap-1 font-semibold text-brand-700 hover:text-brand-600">
            Visit <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
