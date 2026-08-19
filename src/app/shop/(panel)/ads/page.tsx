import type { Metadata } from 'next';
import { requireUser } from '@/lib/session';
import { AdsListView } from './AdsListView';

export const metadata: Metadata = { title: 'All Products' };
export const dynamic = 'force-dynamic';

export default async function AllAdsPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; condition?: string }> }) {
  const user = await requireUser('/shop/ads');
  const sp = await searchParams;
  return (
    <AdsListView
      user={user}
      title="All Products"
      description="Every listing across all statuses."
      basePath="/shop/ads"
      page={Math.max(1, parseInt(sp.page ?? '1', 10) || 1)}
      q={(sp.q ?? '').trim()}
      conditionFilter={sp.condition ?? ''}
    />
  );
}
