'use client';

import { useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import { LogIn, ShieldCheck, Store } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { saveToken } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import type { User } from '@/types/api';

/**
 * A single reusable sign-in card that renders differently for each role
 * (buyer, seller, admin). All three post to the same `/auth/login`
 * endpoint but:
 *   - the header copy is role-specific,
 *   - the post-login redirect defaults to the role's home,
 *   - for the admin variant we additionally verify `user_type === 'admin'`
 *     before honouring the login (otherwise we surface an error and
 *     leave the token unset).
 */

export type LoginRole = 'buyer' | 'seller' | 'admin';

const ROLE_META: Record<LoginRole, {
  title:    string;
  subtitle: string;
  icon:     React.ReactNode;
  accent:   string;   // Tailwind color class for icon bubble
  home:     Route;    // default post-login redirect
  ctaLabel: string;
}> = {
  buyer:  {
    title:    'Welcome back',
    subtitle: 'Sign in to post ads, message sellers, and manage your listings.',
    icon:     <LogIn size={22} />,
    accent:   'bg-brand-50 text-brand-700',
    home:     '/' as Route,
    ctaLabel: 'Sign in',
  },
  seller: {
    title:    'Seller Portal',
    subtitle: 'Manage your listings, chat with buyers and track earnings.',
    icon:     <Store size={22} />,
    accent:   'bg-emerald-50 text-emerald-700',
    home:     '/shop' as Route,
    ctaLabel: 'Sign in to Seller Panel',
  },
  admin:  {
    title:    'Administrator Access',
    subtitle: 'Staff only. Manage users, ads, plans and platform settings.',
    icon:     <ShieldCheck size={22} />,
    accent:   'bg-amber-50 text-amber-700',
    home:     '/admin' as Route,
    ctaLabel: 'Sign in to Admin',
  },
};

export type RoleLoginFormProps = {
  role: LoginRole;
};

export function RoleLoginForm({ role }: RoleLoginFormProps) {
  const router  = useRouter();
  const params  = useSearchParams();
  const meta    = ROLE_META[role];

  const [identifier, setId]   = useState('');
  const [password,   setPw]   = useState('');
  const [busy,       setBusy] = useState(false);
  const [error,      setError]= useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const { data } = await api<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body:   { identifier, password },
      });

      // Admin gate: only real admins may pass here. Everyone else gets a
      // clear "not authorised" and we don't store any credentials.
      if (role === 'admin' && !data.user.is_admin && data.user.user_type !== 'admin') {
        setError('This account does not have administrator access.');
        setBusy(false);
        return;
      }

      saveToken(data.token);

      // Honour explicit ?redirect=... first, otherwise land the user on
      // the panel that matches their actual role. This means a
      // shop-owner who happens to open the buyer login card still ends
      // up in the seller panel rather than the marketing home page.
      const nextRaw = params.get('redirect');
      const roleHome: Route =
        data.user.is_admin || data.user.user_type === 'admin'
          ? ('/admin' as Route)
          : data.user.is_shop
              || data.user.user_type === 'shop'
              || data.user.user_type === 'seller'
            ? ('/shop' as Route)
            : meta.home;

      // Guard against open-redirect: only allow same-origin relative paths.
      const next = nextRaw && nextRaw.startsWith('/') && !nextRaw.startsWith('//')
        ? (nextRaw as Route)
        : roleHome;

      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed. Please try again.');
    } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="surface-card p-8">
        <div className="mb-6 flex items-start gap-3">
          <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${meta.accent}`}>
            {meta.icon}
          </span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{meta.title}</h1>
            <p className="mt-1 text-sm text-slate-500">{meta.subtitle}</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email or username</span>
            <input
              type="text"
              autoComplete="username"
              required
              value={identifier}
              onChange={(e) => setId(e.target.value)}
              className="mt-1 block w-full rounded-lg border-0 bg-brand-50/60 px-4 py-3 text-slate-900 outline-none ring-1 ring-transparent focus:ring-2 focus:ring-brand-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPw(e.target.value)}
              className="mt-1 block w-full rounded-lg border-0 bg-brand-50/60 px-4 py-3 text-slate-900 outline-none ring-1 ring-transparent focus:ring-2 focus:ring-brand-500"
            />
          </label>

          {error && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <Button type="submit" variant="filled" className="w-full" disabled={busy}>
            {busy ? 'Signing in…' : meta.ctaLabel}
          </Button>

          <div className="flex items-center justify-between pt-2 text-sm">
            <Link href={'/auth/forgot' as Route} className="text-brand-700 hover:underline">Forgot password?</Link>
            {role !== 'admin' && (
              <Link href={'/auth/signup' as Route} className="text-brand-700 hover:underline">Create account</Link>
            )}
          </div>
        </form>
      </div>

      {role === 'admin' && (
        <p className="mt-4 text-center text-xs text-slate-500">
          Prefer the classic panel?{' '}
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, '')}/admin/login`}
            className="text-brand-700 underline"
          >
            Open Filament admin
          </a>
        </p>
      )}
    </div>
  );
}
