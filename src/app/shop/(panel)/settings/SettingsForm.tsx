'use client';

import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { FormField, FormTextarea } from '@/components/forms/FormField';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useToast } from '@/components/ui/Toast';
import { api, ApiError } from '@/lib/api';
import { readToken } from '@/lib/auth';
import type { User } from '@/types/api';

export function SettingsForm({ user }: { user: User }) {
  const { notify } = useToast();
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name:        user.name,
    email:       user.email,
    phone:       user.phone ?? '',
    city:        (user as unknown as { city?: string }).city ?? '',
    country:     (user as unknown as { country?: string }).country ?? '',
    tagline:     (user as unknown as { tagline?: string }).tagline ?? '',
    description: (user as unknown as { description?: string }).description ?? '',
  });

  // ── avatar upload state ────────────────────────────────────────────
  // The profile photo is submitted separately via multipart/form-data to
  // POST /me/avatar so we don't have to convert the rest of this form
  // (which is JSON-only today). Preview is generated locally so the user
  // sees the new photo instantly before the request completes.
  const [avatarFile,    setAvatarFile]    = useState<File | null>(null);
  const [avatarUrl,     setAvatarUrl]     = useState<string>(user.avatar_url);
  const [avatarBusy,    setAvatarBusy]    = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const preview = useMemo(
    () => (avatarFile ? URL.createObjectURL(avatarFile) : avatarUrl),
    [avatarFile, avatarUrl],
  );

  const pickAvatar = () => fileInputRef.current?.click();

  const onAvatarChosen = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      notify('danger', 'Photo must be under 5MB.');
      return;
    }
    setAvatarFile(file);
    setAvatarBusy(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const { data } = await api<{ user: User }>('/me/avatar', {
        method: 'POST', body: fd, token: readToken(),
      });
      setAvatarUrl(data.user.avatar_url);
      setAvatarFile(null);
      notify('success', 'Profile photo updated.');
    } catch (err) {
      setAvatarFile(null);
      notify('danger', err instanceof ApiError ? err.message : 'Upload failed.');
    } finally {
      setAvatarBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setErrors({});
    try {
      await api<{ user: User }>('/me', { method: 'PUT', body: form, token: readToken() });
      notify('success', 'Profile updated.');
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
    <form onSubmit={submit} className="surface-card p-6 space-y-5">
      {/* Profile photo — upload handled inline via /me/avatar */}
      <div className="flex items-center gap-5 border-b border-line pb-5">
        <Avatar src={preview} alt={form.name} size="xl" />
        <div>
          <p className="text-sm font-semibold text-ink">Profile photo</p>
          <p className="text-xs text-ink-muted">PNG, JPG, or WebP. Max 5MB.</p>
          <div className="mt-2 flex gap-2">
            <Button
              type="button" variant="outline" size="sm"
              onClick={pickAvatar} disabled={avatarBusy}
            >
              {avatarBusy ? 'Uploading…' : 'Change photo'}
            </Button>
            <input
              ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp"
              onChange={onAvatarChosen} className="hidden"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Full name"  name="name"    value={form.name}    onChange={(e) => set('name', e.target.value)}    required error={errors.name} />
        <FormField label="Email"      name="email"   type="email" value={form.email}   onChange={(e) => set('email', e.target.value)}   required error={errors.email} />
        <FormField label="Phone"      name="phone"   value={form.phone}   onChange={(e) => set('phone', e.target.value)}   error={errors.phone} />
        <FormField label="City"       name="city"    value={form.city}    onChange={(e) => set('city', e.target.value)}    error={errors.city} />
        <FormField label="Country"    name="country" value={form.country} onChange={(e) => set('country', e.target.value)} error={errors.country} />
        <FormField label="Tagline"    name="tagline" value={form.tagline} onChange={(e) => set('tagline', e.target.value)} hint="One-line intro shown on your seller page" error={errors.tagline} />
      </div>

      <FormTextarea
        label="About you"
        name="description"
        rows={5}
        value={form.description}
        onChange={(e) => set('description', e.target.value)}
        hint="Tell buyers about yourself. 2000 characters max."
        error={errors.description}
      />

      <div className="flex justify-end">
        <Button type="submit" variant="filled" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</Button>
      </div>
    </form>
  );
}
