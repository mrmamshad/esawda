import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { ArrowLeft } from 'lucide-react';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/shop/v2/PageHeader';
import { apiFromServer, ApiError } from '@/lib/api';
import { requireUser } from '@/lib/session';
import type { Category } from '@/types/api';
import AdForm from './AdForm';

export const metadata: Metadata = {
  title: 'Post a Product',
};
export const dynamic = 'force-dynamic';

/** Seller product composer. The complete form remains visible as a preview,
 *  but it is locked until the shop has an active plan and listing quota. */
export default async function PostAdPage() {
  const user = await requireUser('/shop/ads/new');
  if (!user.is_shop && user.user_type !== 'seller') redirect('/shop/apply');

  let cats: Category[] = [];
  let settings: Record<string, string> = {};
  try {
    [cats, settings] = await Promise.all([
      apiFromServer<Category[]>('/categories?with_subs=true&with_counts=false', { revalidate: 300 })
        .then((r) => r.data ?? []),
      apiFromServer<{ settings: Record<string, string> }>('/settings', { revalidate: 120 })
        .then((r) => r.data?.settings ?? {}),
    ]);
  } catch (e) {
    // Category/settings load is non-fatal — the form stays usable with empty lists.
    if (e instanceof ApiError) { cats = []; settings = {}; }
  }

  return (
    <>
      <PageHeader
        title="Add New Product"
        description="Create a polished product listing without leaving your shop workspace."
        actions={
          <Link
            href={'/shop/ads' as Route}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[12.5px] font-semibold transition hover:bg-[color:var(--shp-bg)]"
            style={{ borderColor: 'var(--shp-border)', color: 'var(--shp-fg-muted)' }}
          >
            <ArrowLeft size={14} /> Back to products
          </Link>
        }
      />
      <AdForm
        categories={cats}
        settings={settings}
        hasActivePlan={Boolean(user.plan_active)}
        adsRemaining={Number(user.ads_remaining ?? 0)}
        planName={String(user.group_id ?? 'free')}
        planExpiresAt={user.plan_expires_at ?? null}
      />
    </>
  );
}