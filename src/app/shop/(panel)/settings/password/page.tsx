import Link from 'next/link';
import type { Route } from 'next';
import type { Metadata } from 'next';
import { requireUser } from '@/lib/session';
import { PasswordForm } from './PasswordForm';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = { title: 'Change password' };
export const dynamic = 'force-dynamic';

export default async function PasswordPage() {
  const user = await requireUser('/shop/settings/password');
  return (
    <ToastProvider>
      <>
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink">Change password</h1>
            <p className="text-sm text-ink-muted">Use a strong password you don't reuse elsewhere.</p>
          </div>
          <div className="inline-flex items-center gap-1 rounded-pill bg-brand-100/60 p-1">
            <Link href={'/shop/settings' as Route} className="rounded-pill px-4 h-9 inline-flex items-center text-sm font-medium text-ink-muted hover:text-ink">Profile</Link>
            <span className="rounded-pill bg-brand-700 px-4 h-9 inline-flex items-center text-sm font-medium text-white">Password</span>
          </div>
        </header>
        <PasswordForm />
      </>
    </ToastProvider>
  );
}
