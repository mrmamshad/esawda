import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { apiFromServer, ApiError } from '@/lib/api';
import { requireUser } from '@/lib/session';
import { BoostForm } from './BoostForm';
import type { AdDetail } from '@/types/api';

export const metadata: Metadata = { title: 'Boost ad' };
export const dynamic = 'force-dynamic';

/**
 * Ad-upgrade purchase flow. Buyer chooses which boosts to buy, we hit
 * POST /api/v1/checkout/ad-upgrade/{postId} → redirect to SSLCommerz.
 */
export default async function BoostAdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numericId = parseInt(id, 10);
  if (!numericId) notFound();

  const user = await requireUser(`/shop/ads/${id}/boost`);

  let ad: AdDetail | null = null;
  try {
    const res = await apiFromServer<AdDetail>(`/ads/${numericId}`, { cache: 'no-store' });
    ad = res.data;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  if (!ad || ad.seller?.id !== user.id) notFound();

  return (
    <main className="container-page py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Boost this ad</h1>
        <p className="text-sm text-ink-muted">Increase visibility with paid placements. Paid via SSLCommerz.</p>
      </header>
      <BoostForm ad={ad} />
    </main>
  );
}
