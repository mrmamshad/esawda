import type { Metadata } from 'next';
import { requireUser } from '@/lib/session';
import { AdsListView } from '../AdsListView';

export const metadata: Metadata = { title: 'Sold Out Ads' };
export const dynamic = 'force-dynamic';

export default async function SoldOutAdsPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; condition?: string }> }) {
  const user = await requireUser('/shop/ads/sold-out');
  const sp = await searchParams;
  return (
    <AdsListView
      user={user}
      statusFilter="sold_out"
      title="Sold Out Ads"
      description="Marked as sold — can be restocked anytime."
      basePath="/shop/ads/sold-out"
      page={Math.max(1, parseInt(sp.page ?? '1', 10) || 1)}
      q={(sp.q ?? '').trim()}
      conditionFilter={sp.condition ?? ''}
    />
  );
}
