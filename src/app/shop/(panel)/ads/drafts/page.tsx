import type { Metadata } from 'next';
import { requireUser } from '@/lib/session';
import { AdsListView } from '../AdsListView';

export const metadata: Metadata = { title: 'Drafts' };
export const dynamic = 'force-dynamic';

export default async function DraftsPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; condition?: string }> }) {
  const user = await requireUser('/shop/ads/drafts');
  const sp = await searchParams;
  return (
    <AdsListView
      user={user}
      statusFilter="draft"
      title="Drafts"
      description="Saved but not yet submitted for review."
      basePath="/shop/ads/drafts"
      page={Math.max(1, parseInt(sp.page ?? '1', 10) || 1)}
      q={(sp.q ?? '').trim()}
      conditionFilter={sp.condition ?? ''}
    />
  );
}
