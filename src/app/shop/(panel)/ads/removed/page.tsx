import type { Metadata } from 'next';
import { requireUser } from '@/lib/session';
import { AdsListView } from '../AdsListView';

export const metadata: Metadata = { title: 'Removed Ads' };
export const dynamic = 'force-dynamic';

export default async function RemovedAdsPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; condition?: string }> }) {
  const user = await requireUser('/shop/ads/removed');
  const sp = await searchParams;
  return (
    <AdsListView
      user={user}
      statusFilter="removed"
      title="Removed Ads"
      description="Ads you've taken down. Not visible to buyers."
      basePath="/shop/ads/removed"
      page={Math.max(1, parseInt(sp.page ?? '1', 10) || 1)}
      q={(sp.q ?? '').trim()}
      conditionFilter={sp.condition ?? ''}
    />
  );
}
