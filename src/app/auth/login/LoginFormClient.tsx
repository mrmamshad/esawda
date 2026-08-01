'use client';

import { useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import type { User } from '@/types/api';

/** Compute the correct landing page for a freshly-authenticated user. */
function landingFor(user: User): Route {
  if (user.is_admin || user.user_type === 'admin') return '/admin' as Route;
  if (user.is_shop || user.user_type === 'shop' || user.user_type === 'seller') {
    return '/shop' as Route;
  }
  return '/' as Route;
}

export function LoginFormClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [identifier, setId] = useState('');
  const [password, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const { data } = await api<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: { identifier, password },
      });

      document.cookie = `eshauda_token=${data.token}; path=/; max-age=2592000; samesite=lax`;

      // Honour ?redirect=... first (same-origin only), then fall back to
      // the role-specific home. This means a shop owner / admin who
      // lands on /auth/login without a redirect goes straight to their
      // own panel instead of the marketing home.
      const nextRaw = params.get('redirect');
      const safeNext =
        nextRaw && nextRaw.startsWith('/') && !nextRaw.startsWith('//')
          ? (nextRaw as Route)
          : landingFor(data.user);

      router.push(safeNext);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  // Shared input styling — white background with a soft warm border and
  // a red focus ring. This is the ONLY thing we tweaked from the original
  // form: the old `bg-surface-muted` cream fill looked flat, so it now
  // sits on white with a subtle border and a proper focus state.
  const inputCls =
    'mt-1 h-11 w-full rounded-field border border-[#EDE1D5] bg-white px-3 text-[15px] text-ink outline-none transition ' +
    'focus:border-transparent focus:ring-2 focus:ring-brand-700';

  return (
    <form onSubmit={submit} className="w-full max-w-md space-y-5 surface-card p-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-muted">Sign in to post ads, message sellers, and manage your listings.</p>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-ink">Email or username</span>
        <input
          type="text"
          value={identifier}
          onChange={(e) => setId(e.target.value)}
          required
          autoComplete="username"
          className={inputCls}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-ink">Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPw(e.target.value)}
          required
          minLength={8}
          autoComplete="current-password"
          className={inputCls}
        />
      </label>

      {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{error}</div>}

      <Button type="submit" fullWidth disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Button>

      <div className="flex items-center justify-between text-sm">
        <Link href={'/auth/forgot' as Route} className="text-brand-700 hover:underline">Forgot password?</Link>
        <Link href={'/auth/signup' as Route} className="text-brand-700 hover:underline">Create account</Link>
      </div>
    </form>
  );
}
