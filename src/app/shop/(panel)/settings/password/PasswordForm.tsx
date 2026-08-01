'use client';

import { useState, type FormEvent } from 'react';
import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { api, ApiError } from '@/lib/api';
import { readToken } from '@/lib/auth';

export function PasswordForm() {
  const { notify } = useToast();
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ current_password: '', password: '', password_confirmation: '' });

  const set = <K extends keyof typeof form>(k: K, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setErrors({});
    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: 'Passwords do not match.' });
      setBusy(false);
      return;
    }
    try {
      await api('/me/password', { method: 'POST', body: form, token: readToken() });
      notify('success', 'Password updated.');
      setForm({ current_password: '', password: '', password_confirmation: '' });
    } catch (err) {
      if (err instanceof ApiError) {
        const fieldErrs: Record<string, string> = {};
        for (const [k, v] of Object.entries(err.fields ?? {})) fieldErrs[k] = Array.isArray(v) ? v[0]! : String(v);
        setErrors(fieldErrs);
        notify('danger', err.message);
      } else {
        notify('danger', 'Something went wrong.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="surface-card max-w-lg space-y-4 p-6">
      <FormField
        label="Current password" name="current_password" type="password"
        value={form.current_password}
        onChange={(e) => set('current_password', e.target.value)}
        required error={errors.current_password}
      />
      <FormField
        label="New password" name="password" type="password"
        value={form.password}
        onChange={(e) => set('password', e.target.value)}
        required hint="At least 8 characters." error={errors.password}
      />
      <FormField
        label="Confirm new password" name="password_confirmation" type="password"
        value={form.password_confirmation}
        onChange={(e) => set('password_confirmation', e.target.value)}
        required error={errors.password_confirmation}
      />
      <div className="flex justify-end">
        <Button type="submit" variant="filled" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</Button>
      </div>
    </form>
  );
}
