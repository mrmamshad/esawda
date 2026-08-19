import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/session';
import { apiFromServer, ApiError } from '@/lib/api';
import { ShopShellV2, type ShopCounts } from '@/components/shop/v2/ShopShellV2';

export const dynamic = 'force-dynamic';

/**
 * Every /shop/* page renders inside the ShopShellV2 (dedicated
 * sidebar + topbar, warm coral vibe — completely separate from the
 * public marketplace layout).
 *
 * Access is restricted to actual shop owners (user_type = seller).
 * Regular buyers are redirected to the lightweight /dashboard.
 *
 * Sidebar counts come from `/me/shop/stats` so the nav pills always
 * show accurate numbers. Gracefully falls back to empty counts if the
 * endpoint fails.
 */
export default async function ShopPanelLayout({ children }: { children: ReactNode }) {
  const user = await requireUser('/shop');

  if (!user.is_shop && user.user_type !== 'seller') {
    redirect('/dashboard');
  }

  let counts: ShopCounts = {};
  try {
    const res = await apiFromServer<{ ads: Record<string, number>; wishlist_count?: number }>(
      '/me/shop/stats', { cache: 'no-store' },
    );
    counts = {
      active:     res.data.ads?.active,
      pending:    res.data.ads?.pending,
      sold_out:   res.data.ads?.sold_out,
      removed:    res.data.ads?.removed,
      drafts:     res.data.ads?.draft,
      expired:    res.data.ads?.expire,
      wishlisted: res.data.wishlist_count,
    };
  } catch (e) {
    if (!(e instanceof ApiError)) throw e;
  }

  return <ShopShellV2 user={user} counts={counts}>{children}</ShopShellV2>;
}
