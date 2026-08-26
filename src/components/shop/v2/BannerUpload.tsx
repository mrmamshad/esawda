'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import Image from 'next/image';
import { ImageUp } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { readToken } from '@/lib/auth';
import type { User } from '@/types/api';

/**
 * Shop banner uploader. Shown on the shop dashboard; lets the owner set the
 * wide banner that also appears on their public store page. Uploads go to
 * POST /me/shop-banner (multipart, field name `banner`).
 */
export function BannerUpload({ user }: { user: User }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(user.shop_banner_url ?? null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const pick = () => inputRef.current?.click();

  const upload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setErr(null);
    const fd = new FormData();
    fd.append('banner', file);
    try {
      const { data } = await api<{ user: User }>('/me/shop-banner', { method: 'POST', token: readToken(), body: fd });
      setUrl(data.user.shop_banner_url ?? null);
      // Reset so re-uploading the same file re-triggers onChange.
      if (inputRef.current) inputRef.current.value = '';
    } catch (e2) {
      setErr(e2 instanceof ApiError ? e2.message : 'Upload failed. Try a jpg/png/webp under 5MB.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      className="rounded-2xl border p-5"
      style={{ background: 'var(--shp-surface)', borderColor: 'var(--shp-border)', boxShadow: 'var(--shp-shadow-sm)' }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-md" style={{ background: 'var(--shp-brand-soft)', color: 'var(--shp-brand)' }}>
          <ImageUp size={16} />
        </span>
        <div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--shp-fg)' }}>Update banner</h3>
          <p className="text-[11.5px]" style={{ color: 'var(--shp-fg-faint)' }}>
            Wide banner shown at the top of your public store. Recommended 1920×400.
          </p>
        </div>
      </div>

      {url && (
        <div className="relative mb-3 h-28 w-full overflow-hidden rounded-lg border" style={{ borderColor: 'var(--shp-border)' }}>
          <Image src={url} alt="Shop banner" fill sizes="100vw" className="object-cover" unoptimized />
        </div>
      )}

      <button
        type="button"
        onClick={pick}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold text-white transition active:translate-y-[1px] disabled:opacity-60"
        style={{ background: 'var(--shp-brand)' }}
      >
        <ImageUp size={14} /> {busy ? 'Uploading…' : url ? 'Change banner' : 'Upload banner'}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={upload} />
      {err && <p className="mt-2 text-xs" style={{ color: 'var(--shp-danger)' }}>{err}</p>}
    </section>
  );
}
