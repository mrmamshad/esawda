import Link from 'next/link';
import type { Route } from 'next';
import type { Metadata } from 'next';
import { requireUser } from '@/lib/session';
import { SettingsForm } from './SettingsForm';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = { title: 'Account settings' };
export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await requireUser('/shop/settings');
  return (
    <ToastProvider>
      <>
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink">Account settings</h1>
            <p className="text-sm text-ink-muted">Update your public profile and contact info.</p>
          </div>
          <div className="inline-flex items-center gap-1 rounded-pill bg-brand-100/60 p-1">
            <span className="rounded-pill bg-brand-700 px-4 h-9 inline-flex items-center text-sm font-medium text-white">Profile</span>
            <Link href={'/shop/settings/password' as Route} className="rounded-pill px-4 h-9 inline-flex items-center text-sm font-medium text-ink-muted hover:text-ink">Password</Link>
          </div>
        </header>
        <SettingsForm user={user} />
      </>
    </ToastProvider>
  );
}
