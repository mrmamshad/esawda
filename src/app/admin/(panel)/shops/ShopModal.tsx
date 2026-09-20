'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Store, User, Phone, MapPin, Tag, FileText, ShieldCheck, BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { readToken } from '@/lib/auth';
import type { AdminShopRow } from './ShopsTableClient';

type Mode = 'view' | 'edit';

interface Props {
  shop: AdminShopRow | null;
  mode: Mode;
  onClose: () => void;
}

function Field({ label, value, icon }: { label: string; value?: string | number | null; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {icon} {label}
      </span>
      <span className="text-sm text-gray-800">{value || <span className="text-gray-300">—</span>}</span>
    </div>
  );
}

function EditField({
  label, name, value, onChange, type = 'text', icon,
}: {
  label: string; name: string; value: string; onChange: (v: string) => void;
  type?: string; icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {icon} {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
    </div>
  );
}

export function ShopModal({ shop, mode: initialMode, onClose }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [pending, start] = useTransition();
  const [saving, setSaving] = useState(false);

  // Edit form state — mirrors AdminShopRow editable fields
  const [form, setForm] = useState({
    name: '',
    shop_name: '',
    email: '',
    phone: '',
    address: '',
    shop_address: '',
    shop_category: '',
    shop_description: '',
    username: '',
  });

  useEffect(() => {
    setMode(initialMode);
    if (shop) {
      setForm({
        name: shop.name ?? '',
        shop_name: shop.shop_name ?? '',
        email: shop.email ?? '',
        phone: shop.phone ?? '',
        address: shop.address ?? '',
        shop_address: shop.shop_address ?? '',
        shop_category: (shop as any).shop_category ?? '',
        shop_description: (shop as any).shop_description ?? '',
        username: shop.username ?? '',
      });
    }
  }, [shop, initialMode]);

  if (!shop) return null;

  const set = (key: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await api(`/admin/users/${shop.id}`, {
        method: 'PATCH',
        token: readToken(),
        body: {
          name: form.name,
          shop_name: form.shop_name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          shop_address: form.shop_address,
          shop_category: form.shop_category,
          shop_description: form.shop_description,
        },
      });
      toast.success('Shop updated successfully');
      start(() => router.refresh());
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const isVerified = !!shop.shop_verified_at;
  const isActive = (shop.shop_status ?? 'active') === 'active';
  const isFree = !shop.group_id || shop.group_id === 'free';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #FF003F 0%, #4F46E5 100%)' }}
            >
              {shop.shop_name?.slice(0, 2).toUpperCase() || '?'}
            </span>
            <div>
              <h2 className="text-base font-bold text-gray-900">{shop.shop_name || shop.username}</h2>
              <p className="text-xs text-gray-400">@{shop.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {mode === 'view' && (
              <button
                onClick={() => setMode('edit')}
                className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition"
              >
                Edit
              </button>
            )}
            <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100 transition">
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
              {isActive ? 'Active' : 'Inactive'}
            </span>
            {isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                <BadgeCheck size={12} /> Verified
              </span>
            )}
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${isFree ? 'bg-gray-100 text-gray-500' : 'bg-brand-50 text-brand-700'}`}>
              {isFree ? 'Free Plan' : shop.group_id}
            </span>
            {shop.plan_expires_at && (
              <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-xs text-gray-500">
                Expires: {shop.plan_expires_at.slice(0, 10)}
              </span>
            )}
          </div>

          {mode === 'view' ? (
            <>
              {/* Shop Info */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                  <Store size={13} /> Shop Information
                </h3>
                <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <Field label="Shop Name" value={shop.shop_name} icon={<Store size={11} />} />
                  <Field label="Username" value={`@${shop.username}`} icon={<User size={11} />} />
                  <Field label="Shop Address" value={(shop as any).shop_address || shop.address} icon={<MapPin size={11} />} />
                  <Field label="Category" value={(shop as any).shop_category} icon={<Tag size={11} />} />
                  <div className="col-span-2">
                    <Field label="Description" value={(shop as any).shop_description} icon={<FileText size={11} />} />
                  </div>
                </div>
              </div>

              {/* Owner Info */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                  <User size={13} /> Owner Information
                </h3>
                <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <Field label="Owner Name" value={shop.name} icon={<User size={11} />} />
                  <Field label="Email" value={shop.email} />
                  <Field label="Phone" value={shop.phone} icon={<Phone size={11} />} />
                  <Field label="Address" value={shop.address} icon={<MapPin size={11} />} />
                </div>
              </div>

              {/* Stats */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                  <ShieldCheck size={13} /> Listings & Verification
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Total Listings', value: shop.listings_total ?? 0 },
                    { label: 'Active', value: shop.listings_active ?? 0 },
                    { label: 'Pending', value: shop.listings_pending ?? 0 },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
                      <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                      <p className="text-xs text-gray-400">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <Field label="Verified At" value={shop.shop_verified_at ? shop.shop_verified_at.slice(0, 10) : 'Not verified'} />
                  <Field label="Joined" value={shop.created_at ? shop.created_at.slice(0, 10) : '—'} />
                </div>
              </div>
            </>
          ) : (
            /* EDIT MODE */
            <div className="space-y-5">
              {/* Shop Info */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                  <Store size={13} /> Shop Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <EditField label="Shop Name" name="shop_name" value={form.shop_name} onChange={set('shop_name')} icon={<Store size={11} />} />
                  <EditField label="Username" name="username" value={form.username} onChange={set('username')} icon={<User size={11} />} />
                  <EditField label="Shop Address" name="shop_address" value={form.shop_address} onChange={set('shop_address')} icon={<MapPin size={11} />} />
                  <EditField label="Shop Category" name="shop_category" value={form.shop_category} onChange={set('shop_category')} icon={<Tag size={11} />} />
                  <div className="col-span-2 flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Description</label>
                    <textarea
                      value={form.shop_description}
                      onChange={(e) => set('shop_description')(e.target.value)}
                      rows={3}
                      className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Owner Info */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                  <User size={13} /> Owner Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <EditField label="Owner Name" name="name" value={form.name} onChange={set('name')} icon={<User size={11} />} />
                  <EditField label="Email" name="email" value={form.email} onChange={set('email')} type="email" />
                  <EditField label="Phone" name="phone" value={form.phone} onChange={set('phone')} icon={<Phone size={11} />} />
                  <EditField label="Address" name="address" value={form.address} onChange={set('address')} icon={<MapPin size={11} />} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {mode === 'edit' && (
          <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4">
            <button
              onClick={() => setMode('view')}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving || pending}
              className="rounded-lg bg-brand-700 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50 transition"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
