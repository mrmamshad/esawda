'use client';

import { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Store, User, Phone, MapPin, Tag, FileText,
  BadgeCheck, BadgeX, Ban, ShieldCheck, KeyRound, Save, Pencil, X,
  ImageIcon, Upload, FileCheck2, AlertCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { readToken } from '@/lib/auth';
import type { AdminShopRow } from '../ShopsTableClient';

function SectionTitle({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
      {icon} {label}
    </h3>
  );
}

function InfoField({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</span>
      <span className="text-sm text-gray-800">{value || <span className="italic text-gray-300">—</span>}</span>
    </div>
  );
}

function InputField({
  label, name, value, onChange, type = 'text',
}: {
  label: string; name: string; value: string;
  onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition"
      />
    </div>
  );
}

export function ShopDetailClient({ shop: initial, defaultEditing = false }: { shop: AdminShopRow; defaultEditing?: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(defaultEditing);
  const [saving, setSaving] = useState(false);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const [form, setForm] = useState({
    name:             initial.name ?? '',
    shop_name:        initial.shop_name ?? '',
    email:            initial.email ?? '',
    phone:            initial.phone ?? '',
    address:          initial.address ?? '',
    shop_address:     initial.shop_address ?? '',
    shop_category:    initial.shop_category ?? '',
    shop_description: initial.shop_description ?? '',
  });

  // Media file refs
  const avatarRef  = useRef<HTMLInputElement>(null);
  const coverRef   = useRef<HTMLInputElement>(null);
  const bannerRef  = useRef<HTMLInputElement>(null);
  const nidRef     = useRef<HTMLInputElement>(null);
  const tradeRef   = useRef<HTMLInputElement>(null);

  const [avatarFile,  setAvatarFile]  = useState<File | null>(null);
  const [coverFile,   setCoverFile]   = useState<File | null>(null);
  const [bannerFile,  setBannerFile]  = useState<File | null>(null);
  const [nidFile,     setNidFile]     = useState<File | null>(null);
  const [tradeFile,   setTradeFile]   = useState<File | null>(null);

  const set = (key: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  const call = async (path: string, label: string, body?: Record<string, unknown>) => {
    setBusyAction(label);
    try {
      await api(`/admin/users/${initial.id}${path}`, { method: 'POST', token: readToken(), body });
      toast.success(`${label} successful`);
      start(() => router.refresh());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action failed');
    } finally { setBusyAction(null); }
  };

  const save = async () => {
    setSaving(true);
    try {
      // If any files selected, use FormData — otherwise JSON PATCH
      const hasFiles = avatarFile || coverFile || bannerFile || nidFile || tradeFile;
      if (hasFiles) {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
        if (avatarFile)  fd.append('avatar', avatarFile);
        if (coverFile)   fd.append('cover', coverFile);
        if (bannerFile)  fd.append('banner', bannerFile);
        if (nidFile)     fd.append('documents[nid]', nidFile);
        if (tradeFile)   fd.append('documents[trade_licence]', tradeFile);
        await api(`/admin/users/${initial.id}`, { method: 'POST', token: readToken(), body: fd });
      } else {
        await api(`/admin/users/${initial.id}`, { method: 'PATCH', token: readToken(), body: form });
      }
      toast.success('Shop updated successfully');
      setEditing(false);
      setAvatarFile(null); setCoverFile(null); setBannerFile(null);
      setNidFile(null); setTradeFile(null);
      start(() => router.refresh());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    } finally { setSaving(false); }
  };

  const resetPassword = async () => {
    const pw = window.prompt(`New password for ${initial.shop_name || initial.username} (min 8 chars):`);
    if (!pw) return;
    if (pw.length < 8) { toast.error('Password must be at least 8 characters.'); return; }
    await call('/reset-password', 'Password reset', { password: pw });
  };

  const isVerified = !!initial.shop_verified_at;
  const isActive = (initial.shop_status ?? 'active') === 'active';
  const isFree = !initial.group_id || initial.group_id === 'free';
  const isBusy = !!busyAction || pending;

  return (
    <div className="space-y-6">

      {/* Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
            {isActive ? 'Active' : 'Inactive'}
          </span>
          {isVerified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              <BadgeCheck size={12} /> Verified
            </span>
          )}
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${isFree ? 'bg-gray-100 text-gray-500' : 'bg-brand-50 text-brand-700'}`}>
            {isFree ? 'Free Plan' : initial.group_id}
          </span>
          {initial.plan_expires_at && (
            <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-xs text-gray-500">
              Expires: {initial.plan_expires_at.slice(0, 10)}
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => isVerified ? call('/unverify-shop', 'Unverify') : call('/verify-shop', 'Verify')}
            disabled={isBusy}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-semibold transition disabled:opacity-50 ${isVerified ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100' : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
          >
            {isVerified ? <BadgeX size={13} /> : <BadgeCheck size={13} />}
            {busyAction === (isVerified ? 'Unverify' : 'Verify') ? 'Processing…' : isVerified ? 'Unverify' : 'Verify'}
          </button>
          <button
            onClick={() => call(isActive ? '/deactivate-shop' : '/activate-shop', isActive ? 'Deactivate' : 'Activate')}
            disabled={isBusy}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-semibold transition disabled:opacity-50 ${isActive ? 'border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100' : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'}`}
          >
            {isActive ? <Ban size={13} /> : <ShieldCheck size={13} />}
            {isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={resetPassword}
            disabled={isBusy}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
          >
            <KeyRound size={13} /> Reset Password
          </button>
        </div>
      </div>

      {/* Listings Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Listings', value: initial.listings_total ?? 0, color: 'text-gray-900' },
          { label: 'Active', value: initial.listings_active ?? 0, color: 'text-green-600' },
          { label: 'Pending', value: initial.listings_pending ?? 0, color: 'text-orange-500' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="mt-1 text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-bold text-gray-800">Shop & Owner Details</h2>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-100"
            >
              <Pencil size={13} /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                <X size={13} /> Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-800 disabled:opacity-50"
              >
                <Save size={13} /> {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        <div className="p-6 space-y-8">
          {/* Shop Information */}
          <div>
            <SectionTitle icon={<Store size={13} />} label="Shop Information" />
            {!editing ? (
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <InfoField label="Shop Name" value={initial.shop_name} />
                <InfoField label="Username" value={`@${initial.username}`} />
                <InfoField label="Shop Address" value={initial.shop_address || initial.address} />
                <InfoField label="Category" value={(initial as any).shop_category} />
                <div className="col-span-2">
                  <InfoField label="Description" value={(initial as any).shop_description} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Shop Name" name="shop_name" value={form.shop_name} onChange={set('shop_name')} />
                <InputField label="Shop Address" name="shop_address" value={form.shop_address} onChange={set('shop_address')} />
                <InputField label="Category" name="shop_category" value={form.shop_category} onChange={set('shop_category')} />
                <div className="col-span-2 flex flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Description</label>
                  <textarea
                    value={form.shop_description}
                    onChange={(e) => set('shop_description')(e.target.value)}
                    rows={4}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* Owner Information */}
          <div>
            <SectionTitle icon={<User size={13} />} label="Owner Information" />
            {!editing ? (
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <InfoField label="Owner Name" value={initial.name} />
                <InfoField label="Email" value={initial.email} />
                <InfoField label="Phone" value={initial.phone} />
                <InfoField label="Address" value={initial.address} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Owner Name" name="name" value={form.name} onChange={set('name')} />
                <InputField label="Email" name="email" value={form.email} onChange={set('email')} type="email" />
                <InputField label="Phone" name="phone" value={form.phone} onChange={set('phone')} />
                <InputField label="Address" name="address" value={form.address} onChange={set('address')} />
              </div>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* Shop Photos */}
          <div>
            <SectionTitle icon={<ImageIcon size={13} />} label="Shop Photos" />
            <div className="grid grid-cols-3 gap-4">
              {/* Avatar */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Profile Photo</span>
                {initial.avatar_url ? (
                  <img src={initial.avatar_url} alt="Avatar" className="h-20 w-20 rounded-xl object-cover border border-gray-200" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-gray-300">
                    <ImageIcon size={24} />
                  </div>
                )}
                {editing && (
                  <>
                    <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={e => setAvatarFile(e.target.files?.[0] ?? null)} />
                    <button type="button" onClick={() => avatarRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
                      <Upload size={12} /> {avatarFile ? avatarFile.name.slice(0, 16) + '…' : 'Upload'}
                    </button>
                  </>
                )}
              </div>
              {/* Cover */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Cover (800×315)</span>
                {initial.cover_url ? (
                  <img src={initial.cover_url} alt="Cover" className="h-20 w-full rounded-xl object-cover border border-gray-200" />
                ) : (
                  <div className="flex h-20 w-full items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-gray-300">
                    <ImageIcon size={24} />
                  </div>
                )}
                {editing && (
                  <>
                    <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={e => setCoverFile(e.target.files?.[0] ?? null)} />
                    <button type="button" onClick={() => coverRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
                      <Upload size={12} /> {coverFile ? coverFile.name.slice(0, 16) + '…' : 'Upload'}
                    </button>
                  </>
                )}
              </div>
              {/* Banner */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Banner (1920×600)</span>
                {initial.shop_banner_url ? (
                  <img src={initial.shop_banner_url} alt="Banner" className="h-20 w-full rounded-xl object-cover border border-gray-200" />
                ) : (
                  <div className="flex h-20 w-full items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-gray-300">
                    <ImageIcon size={24} />
                  </div>
                )}
                {editing && (
                  <>
                    <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={e => setBannerFile(e.target.files?.[0] ?? null)} />
                    <button type="button" onClick={() => bannerRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
                      <Upload size={12} /> {bannerFile ? bannerFile.name.slice(0, 16) + '…' : 'Upload'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Documents */}
          <div>
            <SectionTitle icon={<FileText size={13} />} label="Supporting Documents" />
            <div className="grid grid-cols-2 gap-4">
              {/* NID */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600">NID (National ID)</span>
                  {initial.documents?.nid
                    ? <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700"><FileCheck2 size={11} /> Uploaded</span>
                    : <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-400"><AlertCircle size={11} /> Not uploaded</span>
                  }
                </div>
                {initial.documents?.nid && (
                  <a href={initial.documents.nid} target="_blank" rel="noreferrer" className="text-xs text-brand-700 underline hover:text-brand-800">View document ↗</a>
                )}
                {editing && (
                  <>
                    <input ref={nidRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => setNidFile(e.target.files?.[0] ?? null)} />
                    <button type="button" onClick={() => nidRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
                      <Upload size={12} /> {nidFile ? nidFile.name.slice(0, 20) + '…' : initial.documents?.nid ? 'Replace NID' : 'Upload NID'}
                    </button>
                  </>
                )}
              </div>
              {/* Trade Licence */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600">Trade Licence</span>
                  {initial.documents?.trade_licence
                    ? <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700"><FileCheck2 size={11} /> Uploaded</span>
                    : <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-400"><AlertCircle size={11} /> Not uploaded</span>
                  }
                </div>
                {initial.documents?.trade_licence && (
                  <a href={initial.documents.trade_licence} target="_blank" rel="noreferrer" className="text-xs text-brand-700 underline hover:text-brand-800">View document ↗</a>
                )}
                {editing && (
                  <>
                    <input ref={tradeRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => setTradeFile(e.target.files?.[0] ?? null)} />
                    <button type="button" onClick={() => tradeRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
                      <Upload size={12} /> {tradeFile ? tradeFile.name.slice(0, 20) + '…' : initial.documents?.trade_licence ? 'Replace' : 'Upload Trade Licence'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Verification & Dates */}
          <div>
            <SectionTitle icon={<BadgeCheck size={13} />} label="Verification & Dates" />
            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              <InfoField label="Verified At" value={initial.shop_verified_at ? initial.shop_verified_at.slice(0, 10) : 'Not verified'} />
              <InfoField label="Joined" value={initial.created_at ? initial.created_at.slice(0, 10) : '—'} />
              <InfoField label="Shop Status" value={initial.shop_status ?? 'active'} />
              <InfoField label="Post Policy" value={initial.post_policy ?? 'inherit'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
