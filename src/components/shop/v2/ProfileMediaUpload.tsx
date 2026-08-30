'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import Image from 'next/image';
import { Camera, ImageUp } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { readToken } from '@/lib/auth';
import type { User } from '@/types/api';

/**
 * Inline profile-media uploader for the shop dashboard.
 * Two tiles: Profile photo (avatar) + Cover — both upload via the existing
 * /me/avatar and /me/cover endpoints and update the page state immediately.
 */
export function ProfileMediaUpload({ user }: { user: User }) {
  return (
    <section
      className="rounded-2xl border p-5"
      style={{ background: 'var(--shp-surface)', borderColor: 'var(--shp-border)', boxShadow: 'var(--shp-shadow-sm)' }}
    >
      <h3 className="mb-1 text-sm font-bold" style={{ color: 'var(--shp-fg)' }}>Profile media</h3>
      <p className="mb-4 text-[11.5px]" style={{ color: 'var(--shp-fg-faint)' }}>
        Your profile photo and cover appear on your public store page.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <TileUpload
          label="Profile photo"
          hint="Square, at least 256×256"
          endpoint="/me/avatar"
          formField="avatar"
          currentUrl={user.avatar_url}
          icon={<Camera size={18} />}
        />
        <TileUpload
          label="Cover"
          hint="Wide, e.g. 1920×300"
          endpoint="/me/cover"
          formField="cover"
          currentUrl={user.cover_url ?? undefined}
          icon={<ImageUp size={18} />}
        />
      </div>
    </section>
  );
}

function TileUpload({
  label, hint, endpoint, formField, currentUrl, icon,
}: {
  label: string;
  hint: string;
  endpoint: string;
  formField: string;
  currentUrl?: string;
  icon: React.ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(currentUrl);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const upload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setErr(null);
    const fd = new FormData();
    fd.append(formField, file);
    try {
      const { data } = await api<{ user: User }>(endpoint, { method: 'POST', token: readToken(), body: fd });
      const newUrl = formField === 'avatar' ? data.user.avatar_url : data.user.cover_url;
      if (newUrl) setPreview(newUrl);
      if (inputRef.current) inputRef.current.value = '';
    } catch (e2) {
      setErr(e2 instanceof ApiError ? e2.message : 'Upload failed. Try a jpg/png/webp under 5MB.');
    } finally { setBusy(false); }
  };

  return (
    <div className="rounded-lg border" style={{ borderColor: 'var(--shp-border)' }}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-t-lg px-4 py-8 transition hover:bg-black/[0.02] disabled:opacity-60"
        style={{ background: 'var(--shp-bg)' }}
      >
        {preview ? (
          <div className="relative h-16 w-16 overflow-hidden rounded-lg">
            <Image src={preview} alt={label} fill sizes="64px" className="object-cover" unoptimized />
          </div>
        ) : (
          <span className="grid h-16 w-16 place-items-center rounded-lg" style={{ background: 'var(--shp-brand-soft)', color: 'var(--shp-brand)' }}>
            {icon}
          </span>
        )}
        <span className="text-xs font-semibold" style={{ color: 'var(--shp-fg)' }}>
          {busy ? 'Uploading…' : preview ? 'Change' : 'Upload'}
        </span>
      </button>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={upload} />
      <div className="border-t px-4 py-3" style={{ borderColor: 'var(--shp-border)' }}>
        <p className="text-[11px] font-semibold" style={{ color: 'var(--shp-fg)' }}>{label}</p>
        <p className="text-[10px]" style={{ color: 'var(--shp-fg-faint)' }}>{hint}</p>
      </div>
      {err && <p className="px-4 pb-2 text-[11px]" style={{ color: 'var(--shp-danger)' }}>{err}</p>}
    </div>
  );
}