'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import { api, ApiError } from '@/lib/api';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { PageSurface } from '@/components/layout/PageSurface';
import { Button } from '@/components/ui/Button';
import type { User } from '@/types/api';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '', name: '' });
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setErrors({}); setError(null);
    try {
      const { data } = await api<{ user: User; token: string }>('/auth/register', {
        method: 'POST',
        body: {
          username: form.username, email: form.email, name: form.name,
          password: form.password, password_confirmation: form.confirm,
        },
      });
      document.cookie = `eshauda_token=${data.token}; path=/; max-age=2592000; samesite=lax`;
      router.push('/' as Route);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.fields) setErrors(err.fields);
      } else { setError('Unexpected error. Please try again.'); }
    } finally { setBusy(false); }
  };

  const Field = ({ label, name, type = 'text' }: { label: string; name: keyof typeof form; type?: string }) => (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        type={type} value={form[name]} onChange={set(name)} required
        className="mt-1 h-11 w-full rounded-field bg-surface-muted px-3 outline-none focus:ring-2 focus:ring-brand-500"
      />
      {errors[name]?.[0] && <span className="mt-1 block text-xs text-danger">{errors[name]![0]}</span>}
    </label>
  );

  return (
    <PageSurface>
      <Header />
      <HeaderSpacer />
      <div className="grid place-items-center px-6 py-12">
        <form onSubmit={submit} className="w-full max-w-md space-y-4 surface-card p-8">
          <div>
            <h1 className="text-2xl font-bold text-ink">Create your account</h1>
            <p className="mt-1 text-sm text-ink-muted">Free to join. Start posting ads in seconds.</p>
          </div>

          <Field label="Full name" name="name" />
          <Field label="Username"  name="username" />
          <Field label="Email"     name="email" type="email" />
          <Field label="Password"  name="password" type="password" />
          <Field label="Confirm password" name="confirm" type="password" />

          {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{error}</div>}

          <Button type="submit" fullWidth disabled={busy}>{busy ? 'Creating…' : 'Create account'}</Button>

          <div className="text-center text-sm text-ink-muted">
            Already a member? <Link href={'/auth/login' as Route} className="text-brand-700 hover:underline">Sign in</Link>
          </div>
        </form>
      </div>
    </PageSurface>
  );
}
