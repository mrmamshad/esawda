'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { PageSurface } from '@/components/layout/PageSurface';
import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/Button';
import { api, ApiError } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [busy, setBusy]   = useState(false);
  const [done, setDone]   = useState(false);
  const [err, setErr]     = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      await api('/auth/forgot', { method: 'POST', body: { email } });
      setDone(true);
    } catch (e2) {
      setErr(e2 instanceof ApiError ? e2.message : 'Something went wrong.');
    } finally { setBusy(false); }
  };

  return (
    <PageSurface>
      <Header />
      <HeaderSpacer />
      <main className="grid place-items-center px-6 py-16">
        <div className="w-full max-w-md surface-card p-8">
          {done ? (
            <>
              <h1 className="text-2xl font-bold text-ink">Check your inbox</h1>
              <p className="mt-2 text-sm text-ink-muted">
                If an account exists for <span className="font-medium text-ink">{email}</span>, we've sent a password reset link.
                It expires in 30 minutes.
              </p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Link href={'/login' as Route} className="contents">
                  <Button variant="filled" fullWidth>Back to login</Button>
                </Link>
                <Button variant="outline" fullWidth onClick={() => { setDone(false); setEmail(''); }}>Try another email</Button>
              </div>
            </>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-ink">Forgot password?</h1>
                <p className="mt-1 text-sm text-ink-muted">Enter the email on your account and we'll send you a reset link.</p>
              </div>
              <FormField
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                error={err ?? undefined}
              />
              <Button type="submit" fullWidth disabled={busy || !email}>{busy ? 'Sending…' : 'Send reset link'}</Button>
              <div className="text-center text-sm">
                <Link href={'/login' as Route} className="text-brand-700 hover:underline">Back to login</Link>
              </div>
            </form>
          )}
        </div>
      </main>
    </PageSurface>
  );
}
