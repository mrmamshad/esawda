import type { Metadata } from 'next';
import { requireUser } from '@/lib/session';
import { AdsListView } from '../AdsListView';

export const metadata: Metadata = { title: 'Pending Products' };
export const dynamic = 'force-dynamic';

export default async function PendingAdsPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; condition?: string }> }) {
  const user = await requireUser('/shop/ads/pending');
  const sp = await searchParams;
  return (
    <AdsListView
      user={user}
      statusFilter="pending"
      title="Pending Products"
      description="Awaiting moderator approval."
      basePath="/shop/ads/pending"
      page={Math.max(1, parseInt(sp.page ?? '1', 10) || 1)}
      q={(sp.q ?? '').trim()}
      conditionFilter={sp.condition ?? ''}
    />
  );
}
