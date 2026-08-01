import type { ReactNode } from 'react';
import { requireAdmin } from '@/lib/session';
import { AdminShellV2 } from '@/components/admin/v2/AdminShellV2';

export const dynamic = 'force-dynamic';

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin('/admin');
  return <AdminShellV2 user={user}>{children}</AdminShellV2>;
}
