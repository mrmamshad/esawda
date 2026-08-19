import Link from 'next/link';
import Image from 'next/image';
import type { Route } from 'next';
import { MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatMoney, timeAgo } from '@/lib/format';
import type { Ad } from '@/types/api';

type Status = 'active' | 'pending' | 'expired' | 'hidden' | string;

const statusTone = (s: Status): 'success' | 'urgent' | 'muted' => {
  if (s === 'active')  return 'success';
  if (s === 'pending') return 'urgent';
  return 'muted';
};

/**
 * List-row layout used by My Ads / Favourites tables. Image + meta + status
 * badge + row actions area. Reuses locked tokens.
 */
export function TableRow({
  ad,
  status,
  actions,
}: {
  ad: Ad;
  status?: Status;
  actions?: React.ReactNode;
}) {
  const url = `/ads/${ad.url_slug}` as Route;
  const thumb = ad.thumbnail || '/thumb-fallback.png';

  return (
    <div className="flex flex-col gap-3 border-b border-line px-4 py-4 last:border-b-0 md:flex-row md:items-center">
      <Link href={url} className="relative h-16 w-24 shrink-0 overflow-hidden rounded-field bg-surface-muted md:h-16 md:w-20">
        <Image src={thumb} alt={ad.title} fill sizes="96px" className="object-cover" unoptimized={thumb.startsWith('/')} />
      </Link>

      <div className="min-w-0 flex-1">
        <Link href={url} className="block truncate text-sm font-semibold text-ink hover:text-brand-700">
          {ad.title}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
          <span>{ad.category?.name ?? 'Ad'}</span>
          {ad.location.city && (
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} /> {ad.location.city}
            </span>
          )}
          <span>Posted {timeAgo(ad.created_at)} ago</span>
        </div>
      </div>

      <div className="flex items-center gap-4 md:w-40 md:justify-end">
        <span className="text-sm font-bold text-ink">{formatMoney(ad.price)}</span>
        {(ad.paid || ad.featured || ad.urgent) && (
          <div className="flex flex-col gap-1">
            {ad.paid && <Badge tone="paid">Paid</Badge>}
            {ad.featured && <Badge tone="featured">Featured</Badge>}
            {ad.urgent && <Badge tone="urgent">Urgent</Badge>}
          </div>
        )}
      </div>

      {status && (
        <div className="md:w-28">
          <Badge tone={statusTone(status)}>{status[0]!.toUpperCase() + status.slice(1)}</Badge>
        </div>
      )}

      {actions && <div className="flex flex-wrap items-center gap-2 md:justify-end">{actions}</div>}
    </div>
  );
}
