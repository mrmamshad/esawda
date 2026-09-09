'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import { api, ApiError } from '@/lib/api';
import { saveToken } from '@/lib/auth';
import { normalizeBdMobile, isValidBdMobile } from '@/lib/phone';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { PageSurface } from '@/components/layout/PageSurface';
import { PasswordInput } from '@/components/forms/PasswordInput';
import { Button } from '@/components/ui/Button';
import type { User } from '@/types/api';

type FormKey = 'mobile' | 'email' | 'password' | 'confirm' | 'name';
type FormState = Record<FormKey, string>;

/** Module-scope so the function identity is stable — keeps the input mounted,
 *  preserving focus while typing. (Inline component + closure re-created the
 *  handler every keystroke, which remounted the field and dropped focus.) */
function Field({ label, name, value, onChange, error, type = 'text', inputMode, maxLength, placeholder, hint }: {
  label: string; name: FormKey; value: string;
  onChange: (k: FormKey, v: string) => void; error?: string; type?: string;
  inputMode?: 'numeric' | 'email' | 'text'; maxLength?: number; placeholder?: string; hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      {type === 'password' ? (
        <PasswordInput
          value={value} required
          onChange={(e) => onChange(name, e.target.value)}
          className="mt-1 h-11 w-full rounded-field bg-surface-muted px-3 outline-none focus:ring-2 focus:ring-brand-500"
        />
      ) : (
        <input
          type={type} value={value} required
          inputMode={inputMode} maxLength={maxLength} placeholder={placeholder}
          autoComplete={name === 'mobile' ? 'tel' : undefined}
          onChange={(e) => onChange(name, e.target.value)}
          className="mt-1 h-11 w-full rounded-field bg-surface-muted px-3 outline-none focus:ring-2 focus:ring-brand-500"
        />
      )}
      {hint && !error && <span className="mt-1 block text-xs font-medium text-red-600">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
}

const MOBILE_HINT = '11 digits, starts with 013–019.';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ mobile: '', email: '', password: '', confirm: '', name: '' });
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);

  const set = (k: FormKey, v: string) => setForm((prev) => ({
    ...prev,
    [k]: k === 'mobile' ? normalizeBdMobile(v) : v,
  }));

  const mobileInvalid = form.mobile.length > 0 && !isValidBdMobile(form.mobile);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidBdMobile(form.mobile)) {
      setErrors({ mobile: ['Enter an 11-digit Bangladeshi mobile number, e.g. 01712345678.'] });
      return;
    }
    setBusy(true); setErrors({}); setError(null);
    try {
      const { data } = await api<{ user: User; token: string }>('/auth/register', {
        method: 'POST',
        body: {
          phone: form.mobile, email: form.email, name: form.name,
          password: form.password, password_confirmation: form.confirm,
        },
      });
      saveToken(data.token);
      const redirectTo = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('redirect')
        : null;
      const next = redirectTo?.startsWith('/') && !redirectTo.startsWith('//')
        ? redirectTo
        : '/';
      router.push(next as Route);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.fields) setErrors(err.fields);
      } else { setError('Unexpected error. Please try again.'); }
    } finally { setBusy(false); }
  };

  return (
    <PageSurface>
      <Header />
      <HeaderSpacer />
      <div className="grid place-items-center px-6 py-12">
        <form onSubmit={submit} className="w-full max-w-md space-y-4 surface-card p-8">
          <div>
            <h1 className="text-2xl font-bold text-ink">Create your account</h1>
            <p className="mt-1 text-sm text-ink-muted">Free to join. Start posting products in seconds.</p>
          </div>

          <Field label="Full name" name="name" value={form.name} onChange={set} error={errors.name?.[0]} />
          <Field
            label="Mobile number" name="mobile" type="tel" value={form.mobile} onChange={set}
            error={errors.phone?.[0] ?? errors.mobile?.[0]}
            inputMode="numeric" maxLength={11} placeholder="01XXXXXXXXX"
            hint={mobileInvalid ? MOBILE_HINT : undefined}
          />
          <Field label="Email"     name="email" type="email" value={form.email} onChange={set} error={errors.email?.[0]} />
          <Field label="Password"  name="password" type="password" value={form.password} onChange={set} error={errors.password?.[0]} />
          <Field label="Confirm password" name="confirm" type="password" value={form.confirm} onChange={set} error={errors.confirm?.[0]} />

          {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{error}</div>}

          <Button type="submit" fullWidth disabled={busy}>{busy ? 'Creating…' : 'Create account'}</Button>

          <div className="text-center text-sm text-ink-muted">
            Already a member? <Link href={'/login' as Route} className="text-brand-700 hover:underline">Sign in</Link>
          </div>
        </form>
      </div>
    </PageSurface>
  );
}
