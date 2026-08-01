import type { Metadata } from 'next';
import { requireUser } from '@/lib/session';
import { AdsListView } from '../AdsListView';

export const metadata: Metadata = { title: 'Active Ads' };
export const dynamic = 'force-dynamic';

export default async function ActiveAdsPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; condition?: string }> }) {
  const user = await requireUser('/shop/ads/active');
  const sp = await searchParams;
  return (
    <AdsListView
      user={user}
      statusFilter="active"
      title="Active Ads"
      description="Ads currently visible to buyers."
      basePath="/shop/ads/active"
      page={Math.max(1, parseInt(sp.page ?? '1', 10) || 1)}
      q={(sp.q ?? '').trim()}
      conditionFilter={sp.condition ?? ''}
    />
  );
}
