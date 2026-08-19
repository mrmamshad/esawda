import Link from 'next/link';
import Image from 'next/image';
import type { Route } from 'next';
import { MapPin, MessageCircle, ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PriceTag } from '@/components/ui/PriceTag';
import { FavouriteButton } from '@/components/interactive/FavouriteButton';
import type { Ad } from '@/types/api';
import { cn } from '@/lib/cn';

/** Reusable placeholder for cards without a thumbnail. Uses locked tokens. */
function ThumbFallback({ className }: { className?: string }) {
  return (
    <div className={cn('flex h-full w-full items-center justify-center bg-brand-50 text-brand-500', className)}>
      <ImageIcon size={28} strokeWidth={1.5} />
    </div>
  );
}

type Variant = 'featured' | 'contact' | 'list-row' | 'mini';

/**
 * The single card used across every grid, rail, and chat sidebar. The
 * `variant` prop switches layout — matching the four different card
 * treatments across the reference frames:
 *
 *   featured  → Browse-page 3-col grid (image + Featured badge + title)
 *   contact   → Seller-profile 4-col grid (adds "Contact" full-width btn)
 *   list-row  → Ad-detail right sidebar "Ads from same seller"
 *   mini      → Chat right rail "From the ad"
 */
export function ListingCard({
  ad,
  variant = 'featured',
  subtitle,
  href,
  className,
}: { ad: Ad; variant?: Variant; subtitle?: string; href?: string; className?: string }) {
  const url = (href ?? `/ads/${ad.url_slug}`) as Route;
  const thumb = ad.thumbnail && !ad.thumbnail.endsWith('/thumb-fallback.png') ? ad.thumbnail : null;
  const isDataUri = !!thumb && thumb.startsWith('data:');

  if (variant === 'list-row') return (
    <Link href={url} className={cn('flex gap-3 rounded-card border border-line bg-white p-3 transition hover:shadow-card', className)}>
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
        {thumb ? (
          <Image src={thumb} alt={ad.title} fill sizes="64px" className="object-cover" unoptimized={isDataUri || thumb.startsWith('/')} />
        ) : <ThumbFallback />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-ink-muted">{ad.category?.name ?? 'Product'}</p>
            <p className="truncate text-sm font-semibold text-ink">{ad.title}</p>
            {subtitle && <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p>}
            {ad.location.city && (
              <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-brand-700">
                <MapPin size={12} /> {ad.location.city}{ad.location.country ? `, ${ad.location.country}` : ''}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] uppercase tracking-wide text-ink-muted">Price</span>
            <span className="text-sm font-bold text-ink">$ {ad.price.toLocaleString('en-US')}</span>
            <MessageCircle size={14} className="text-brand-700" aria-label="chat" />
          </div>
        </div>
      </div>
    </Link>
  );

  if (variant === 'mini') return (
    <Link href={url} className={cn('flex items-center gap-2 rounded-lg bg-surface-muted p-2', className)}>
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
        {thumb ? (
          <Image src={thumb} alt={ad.title} fill sizes="48px" className="object-cover" unoptimized={isDataUri || thumb.startsWith('/')} />
        ) : <ThumbFallback />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-ink-muted">{ad.category?.name ?? 'Product'}</p>
        <p className="truncate text-sm font-semibold text-ink">{ad.title}</p>
        <p className="text-xs text-ink-muted">Price <span className="ml-1 font-bold text-ink">$ {ad.price.toLocaleString('en-US')}</span></p>
      </div>
    </Link>
  );

  // "featured" and "contact" variants share the top block.
  return (
    <div className={cn('surface-card overflow-hidden flex flex-col', className)}>
      <Link href={url} className="relative block aspect-[4/3] overflow-hidden bg-surface-muted">
        {thumb ? (
          <Image
            src={thumb}
            alt={ad.title}
            fill
            sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
            unoptimized={isDataUri || thumb.startsWith('/')}
          />
        ) : <ThumbFallback />}
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {ad.paid && (
            <Badge tone="paid" className="rounded-md px-2 py-0.5">Paid</Badge>
          )}
          {ad.featured && (
            <Badge tone="featured" className="rounded-md px-2 py-0.5">Featured</Badge>
          )}
          {ad.urgent && (
            <Badge tone="urgent" className="rounded-md px-2 py-0.5">Urgent</Badge>
          )}
          {ad.highlight && (
            <Badge className="rounded-md px-2 py-0.5" tone="highlight">Highlight</Badge>
          )}
          {ad.bundle_items && ad.bundle_items.length > 1 && (
            <Badge className="rounded-md px-2 py-0.5" tone="highlight">Bundle · {ad.bundle_items.length} items</Badge>
          )}
          {ad.condition && (
            <span className={cn(
              'rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest shadow-sm',
              ad.condition === 'new'
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-500 text-white',
            )}>
              {ad.condition === 'new' ? 'Brand New' : 'Used'}
            </span>
          )}
        </div>
        <FavouriteButton adId={ad.id} className="absolute right-3 top-3" />
      </Link>

      <div className="flex-1 p-4">
        <p className="text-xs text-ink-muted">{ad.category?.name ?? 'Product'}</p>
        <Link href={url} className="mt-1 block truncate text-lg font-bold text-ink hover:text-brand-700">
          {ad.title}
        </Link>

        {variant === 'contact' && (
          <>
            {subtitle && <p className="mt-1 text-sm text-ink-muted line-clamp-1">{subtitle}</p>}
            {ad.location.city && (
              <p className="mt-2 inline-flex items-center gap-1 text-sm text-brand-700">
                <MapPin size={14} /> {ad.location.city}{ad.location.country ? `, ${ad.location.country}` : ''}
              </p>
            )}
            <PriceTag amount={ad.price} label="Price" size="sm" className="mt-2" />
          </>
        )}
      </div>

      {variant === 'contact' && (
        <div className="p-4 pt-0">
          <Button fullWidth variant="filled">Contact</Button>
        </div>
      )}
    </div>
  );
}
