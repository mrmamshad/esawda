'use client';

import { Suspense, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Route } from 'next';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { PageSurface } from '@/components/layout/PageSurface';
import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/Button';
import { api, ApiError } from '@/lib/api';
import { saveToken } from '@/lib/auth';
import type { User } from '@/types/api';

function ResetForm() {
  const params = useSearchParams();
  const token  = params.get('token') ?? '';
  const router = useRouter();
  const [pw, setPw]         = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy]     = useState(false);
  const [errs, setErrs]     = useState<Record<string, string>>({});
  const [gErr, setGErr]     = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) { setGErr('Reset link is invalid or missing.'); return; }
    if (pw !== confirm) { setErrs({ password_confirmation: 'Passwords do not match.' }); return; }
    setBusy(true); setErrs({}); setGErr(null);
    try {
      const { data } = await api<{ user: User; token: string }>('/auth/reset', {
        method: 'POST',
        body: { token, password: pw, password_confirmation: confirm },
      });
      saveToken(data.token);
      router.push('/shop' as Route);
      router.refresh();
    } catch (e2) {
      if (e2 instanceof ApiError) {
        const fields: Record<string, string> = {};
        for (const [k, v] of Object.entries(e2.fields ?? {})) fields[k] = Array.isArray(v) ? v[0]! : String(v);
        setErrs(fields);
        setGErr(e2.message);
      } else setGErr('Reset failed.');
    } finally { setBusy(false); }
  };

  if (!token) {
    return (
      <div className="w-full max-w-md surface-card p-8 text-center">
        <h1 className="text-xl font-bold text-ink">Invalid reset link</h1>
        <p className="mt-2 text-sm text-ink-muted">The token is missing or expired.</p>
        <div className="mt-6"><Link href={'/auth/forgot' as Route} className="contents"><Button variant="filled">Request a new link</Button></Link></div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="w-full max-w-md surface-card space-y-5 p-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">Set a new password</h1>
        <p className="mt-1 text-sm text-ink-muted">Use a strong password you don't reuse elsewhere.</p>
      </div>
      <FormField label="New password" name="password" type="password" required minLength={8} value={pw}
        onChange={(e) => setPw(e.target.value)} hint="At least 8 characters." error={errs.password} />
      <FormField label="Confirm password" name="password_confirmation" type="password" required minLength={8} value={confirm}
        onChange={(e) => setConfirm(e.target.value)} error={errs.password_confirmation} />
      {gErr && !errs.password && !errs.password_confirmation && (
        <div className="rounded-field border border-danger/40 bg-danger/5 px-3 py-2 text-sm text-danger">{gErr}</div>
      )}
      <Button type="submit" fullWidth disabled={busy}>{busy ? 'Resetting…' : 'Reset password'}</Button>
    </form>
  );
}

export default function ResetPage() {
  return (
    <PageSurface>
      <Header />
      <HeaderSpacer />
      <main className="grid place-items-center px-6 py-16">
        <Suspense fallback={<div className="w-full max-w-md surface-card p-8"><p className="text-sm text-ink-muted">Loading…</p></div>}>
          <ResetForm />
        </Suspense>
      </main>
    </PageSurface>
  );
}
