import type { Metadata } from 'next';
import { requireUser } from '@/lib/session';
import { AdsListView } from '../AdsListView';

export const metadata: Metadata = { title: 'Expired Products' };
export const dynamic = 'force-dynamic';

export default async function ExpiredAdsPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; condition?: string }> }) {
  const user = await requireUser('/shop/ads/expire');
  const sp = await searchParams;
  return (
    <AdsListView
      user={user}
      statusFilter="expire"
      title="Expired Products"
      description="Listings past their expiry date. Resubmit them to publish again."
      basePath="/shop/ads/expire"
      page={Math.max(1, parseInt(sp.page ?? '1', 10) || 1)}
      q={(sp.q ?? '').trim()}
      conditionFilter={sp.condition ?? ''}
    />
  );
}