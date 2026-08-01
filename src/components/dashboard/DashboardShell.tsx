/**
 * BACK-COMPAT SHIM (2026-07-24).
 *
 * The old DashboardShell used its own emerald sidebar layout. It's now
 * an alias over the new ShopShellV2 so every sub-page inside /shop
 * gets the new "shop panel" chrome (coral warm palette, grouped nav,
 * click-outside dropdowns) without needing individual refactors.
 *
 * `DashboardCounts` maps 1:1 onto `ShopCounts`, so downstream callers
 * that pass counts still work.
 */
import type { ReactNode } from 'react';
import { ShopShellV2, type ShopCounts } from '@/components/shop/v2/ShopShellV2';
import type { User } from '@/types/api';

export type DashboardCounts = ShopCounts & {
  ads?: number;
  favourites?: number;
};

export function DashboardShell({
  user, counts, children,
}: {
  user: User | null;
  counts?: DashboardCounts;
  children: ReactNode;
}) {
  if (!user) return <>{children}</>;
  return (
    <ShopShellV2 user={user} counts={counts}>
      {children}
    </ShopShellV2>
  );
}
