'use client';

import { useState, type FormEvent } from 'react';
import { FormField, FormTextarea } from '@/components/forms/FormField';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { api, ApiError } from '@/lib/api';

export function ContactForm() {
  const { notify } = useToast();
  const [busy, setBusy] = useState(false);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const set = <K extends keyof typeof form>(k: K, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setErrs({});
    try {
      await api('/contact', { method: 'POST', body: form });
      notify('success', "Thanks — we'll be in touch shortly.");
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      if (err instanceof ApiError) {
        const f: Record<string, string> = {};
        for (const [k, v] of Object.entries(err.fields ?? {})) f[k] = Array.isArray(v) ? v[0]! : String(v);
        setErrs(f);
        notify('danger', err.message);
      } else notify('danger', 'Something went wrong.');
    } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="surface-card space-y-5 p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Your name" name="name" value={form.name} onChange={(e) => set('name', e.target.value)} required error={errs.name} />
        <FormField label="Email"     name="email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required error={errs.email} />
      </div>
      <FormField label="Subject" name="subject" value={form.subject} onChange={(e) => set('subject', e.target.value)} error={errs.subject} />
      <FormTextarea label="Message" name="message" rows={6} value={form.message} onChange={(e) => set('message', e.target.value)} required hint="At least 5 characters." error={errs.message} />
      <div className="flex justify-end">
        <Button type="submit" variant="filled" disabled={busy}>{busy ? 'Sending…' : 'Send message'}</Button>
      </div>
    </form>
  );
}
