import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { PageSurface } from '@/components/layout/PageSurface';
import { getSessionUser } from '@/lib/session';
import { apiFromServer, ApiError } from '@/lib/api';
import type { Category } from '@/types/api';
import AdForm from '@/app/shop/(panel)/ads/new/AdForm';

export const metadata: Metadata = {
  title: 'Post a Product',
};

export const dynamic = 'force-dynamic';

/**
 * Public "Post a Product" composer — no login wall. Signed-out visitors
 * land here straight from the homepage and see a name/phone/password
 * register card on the form; on submit the account is auto-created and the
 * listing is posted for admin review. Signed-in sellers get the full form
 * with no register card (they post from the /shop panel normally).
 */
export default async function PublicPostPage() {
  const user = await getSessionUser();

  // Shop owners always post from the /shop panel, where listing is gated
  // behind an active subscription (no free trial). Sending them there keeps
  // the paywall in one place. Guests and regular single users stay here.
  if (user?.is_shop || user?.user_type === 'seller') {
    redirect('/shop/ads/new');
  }

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
    // Non-fatal — the form stays usable with empty lists.
    if (e instanceof ApiError) { cats = []; settings = {}; }
  }

  return (
    <PageSurface>
      <Header user={user ?? undefined} />
      <HeaderSpacer />
      <main className="container-page py-10">
        <AdForm
          categories={cats}
          settings={settings}
          mode="public"
          guest={!user}
          hasActivePlan={Boolean(user?.plan_active)}
          adsRemaining={Number(user?.ads_remaining ?? 0)}
          planName={String(user?.group_id ?? 'free')}
          planExpiresAt={user?.plan_expires_at ?? null}
        />
      </main>
    </PageSurface>
  );
}
