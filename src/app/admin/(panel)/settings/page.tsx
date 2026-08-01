import type { Metadata } from 'next';
import { apiFromServer, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/admin/v2/PageHeader';
import { SettingsForm } from './SettingsForm';

export const metadata: Metadata = { title: 'Settings' };
export const dynamic = 'force-dynamic';

async function safe<T>(fn: () => Promise<T>, fb: T): Promise<T> {
  try { return await fn(); } catch (e) { if (e instanceof ApiError) return fb; throw e; }
}

export default async function AdminSettingsPage() {
  const res = await safe(
    () => apiFromServer<{ settings: Record<string, string> }>('/admin/settings', { cache: 'no-store' }),
    { data: { settings: {} } },
  );
  return (
    <>
      <PageHeader title="Site settings" description="Global key/value configuration for the platform." />
      <SettingsForm initial={res.data.settings ?? {}} />
    </>
  );
}
