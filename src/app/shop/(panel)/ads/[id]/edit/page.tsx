import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { apiFromServer, ApiError } from '@/lib/api';
import { requireUser } from '@/lib/session';
import { EditAdForm } from './EditAdForm';
import type { AdDetail } from '@/types/api';

export const metadata: Metadata = { title: 'Edit ad' };
export const dynamic = 'force-dynamic';

/**
 * Owner-only ad edit page. Loads the existing listing via /me/ads/{id}
 * (or /ads/{id} as a fallback) and hydrates the edit form. Submission
 * goes through PUT /api/v1/ads/{id} which re-enters moderation.
 */
export default async function EditAdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numericId = parseInt(id, 10);
  if (!numericId) notFound();

  const user = await requireUser(`/shop/ads/${id}/edit`);

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
        <h1 className="text-2xl font-bold text-ink">Edit ad</h1>
        <p className="text-sm text-ink-muted">Changes go back into moderation before republishing.</p>
      </header>
      <EditAdForm ad={ad} />
    </main>
  );
}
