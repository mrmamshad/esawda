'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, CheckCircle2, XCircle, MapPin, Tag, Package, User, Calendar, Eye, Star } from 'lucide-react';
import { cn } from '@/lib/cn';
import { api } from '@/lib/api';
import { readToken } from '@/lib/auth';
import { StatusBadge } from '@/components/admin/v2/StatusBadge';

export type AdDetail = {
  id: number;
  title: string;
  description?: string | null;
  price: number;
  negotiable?: boolean;
  status?: string;
  condition?: string;
  featured?: boolean;
  images?: { url: string; thumb: string }[];
  location?: { city?: string; state?: string; country?: string; address?: string } | null;
  category?: { name: string } | null;
  sub_category?: { name: string } | null;
  seller?: { username: string; name?: string | null } | null;
  custom_fields?: { field_id: number; type: string; value: string }[];
  tags?: string[];
  view_count?: number;
  expires_at?: string | null;
  created_at?: string | null;
};

type Props = {
  adId: number | null;
  initialStatus?: string;
  onClose: () => void;
  onApprove?: (id: number) => void;
  onReject?: (id: number, reason: string) => void;
};

export function ProductPreviewDrawer({ adId, initialStatus, onClose, onApprove, onReject }: Props) {
  const [ad, setAd] = useState<AdDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [busy, setBusy] = useState(false);

  const open = adId !== null;

  const fetchAd = useCallback(async (id: number) => {
    setLoading(true);
    setAd(null);
    setImgIdx(0);
    setRejecting(false);
    setRejectReason('');
    try {
      const res = await api(`/admin/ads/${id}`, { token: readToken() });
      setAd((res as any)?.data ?? res);
    } catch {
      setAd(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (adId !== null) fetchAd(adId);
  }, [adId, fetchAd]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleApprove = async () => {
    if (!adId) return;
    setBusy(true);
    try {
      await api(`/admin/ads/${adId}/approve`, { method: 'POST', token: readToken() });
      onApprove?.(adId);
      onClose();
    } catch (e) { /* parent handles toast */ } finally { setBusy(false); }
  };

  const handleReject = async () => {
    if (!adId) return;
    setBusy(true);
    try {
      await api(`/admin/ads/${adId}/reject`, { method: 'POST', token: readToken(), body: { reason: rejectReason } });
      onReject?.(adId, rejectReason);
      onClose();
    } catch (e) { /* parent handles toast */ } finally { setBusy(false); }
  };

  const isPending = (ad?.status ?? initialStatus) === 'pending';
  const images = ad?.images ?? [];
  const fmt = (iso?: string | null) => iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const currency = '৳';

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn('fixed inset-0 z-40 bg-brand-950/30 backdrop-blur-sm transition-opacity duration-200',
          open ? 'opacity-100' : 'pointer-events-none opacity-0')}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className={cn(
        'fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out',
        open ? 'translate-x-0' : 'translate-x-full',
      )}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-ink">Product Preview</span>
            {ad && <StatusBadge value={ad.status ?? initialStatus ?? 'pending'} />}
          </div>
          <button type="button" onClick={onClose} className="text-ink-faint hover:text-ink" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
            </div>
          )}

          {!loading && !ad && (
            <p className="p-8 text-center text-sm text-ink-muted">Failed to load product.</p>
          )}

          {!loading && ad && (
            <div className="divide-y divide-line">

              {/* Image gallery */}
              {images.length > 0 && (
                <div className="p-4">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface-muted">
                    <img
                      src={images[imgIdx]?.url}
                      alt={ad.title}
                      className="h-full w-full object-contain"
                    />
                    {images.length > 1 && (
                      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setImgIdx(i)}
                            className={cn('h-2 w-2 rounded-full transition-all', i === imgIdx ? 'w-5 bg-white' : 'bg-white/60')}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  {images.length > 1 && (
                    <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                      {images.map((img, i) => (
                        <button key={i} onClick={() => setImgIdx(i)}
                          className={cn('h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                            i === imgIdx ? 'border-brand-600' : 'border-transparent opacity-60 hover:opacity-100')}>
                          <img src={img.thumb} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {images.length === 0 && (
                <div className="flex h-32 items-center justify-center bg-surface-muted text-sm text-ink-muted">
                  No images uploaded
                </div>
              )}

              {/* Title & price */}
              <div className="px-5 py-4">
                <h2 className="text-lg font-semibold text-ink">{ad.title}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <span className="text-xl font-bold text-brand-700">{currency}{ad.price.toLocaleString()}</span>
                  {ad.negotiable && <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Negotiable</span>}
                  {ad.condition && <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-ink-muted capitalize">{ad.condition}</span>}
                  {ad.featured && <span className="flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700"><Star size={10} /> Featured</span>}
                </div>
              </div>

              {/* Meta info */}
              <div className="grid grid-cols-2 gap-3 px-5 py-4 text-sm">
                {ad.seller && (
                  <div className="flex items-start gap-2">
                    <User size={14} className="mt-0.5 shrink-0 text-ink-muted" />
                    <div>
                      <p className="text-xs text-ink-muted">Seller</p>
                      <p className="font-medium text-ink">@{ad.seller.username}</p>
                    </div>
                  </div>
                )}
                {ad.category && (
                  <div className="flex items-start gap-2">
                    <Package size={14} className="mt-0.5 shrink-0 text-ink-muted" />
                    <div>
                      <p className="text-xs text-ink-muted">Category</p>
                      <p className="font-medium text-ink">{ad.category.name}{ad.sub_category ? ` › ${ad.sub_category.name}` : ''}</p>
                    </div>
                  </div>
                )}
                {ad.location?.city && (
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="mt-0.5 shrink-0 text-ink-muted" />
                    <div>
                      <p className="text-xs text-ink-muted">Location</p>
                      <p className="font-medium text-ink">{[ad.location.city, ad.location.state, ad.location.country].filter(Boolean).join(', ')}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <Calendar size={14} className="mt-0.5 shrink-0 text-ink-muted" />
                  <div>
                    <p className="text-xs text-ink-muted">Posted</p>
                    <p className="font-medium text-ink">{fmt(ad.created_at)}</p>
                  </div>
                </div>
                {(ad.view_count ?? 0) > 0 && (
                  <div className="flex items-start gap-2">
                    <Eye size={14} className="mt-0.5 shrink-0 text-ink-muted" />
                    <div>
                      <p className="text-xs text-ink-muted">Views</p>
                      <p className="font-medium text-ink">{ad.view_count}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {ad.description && (
                <div className="px-5 py-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink-muted">Description</p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{ad.description}</p>
                </div>
              )}

              {/* Custom fields */}
              {(ad.custom_fields ?? []).length > 0 && (
                <div className="px-5 py-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-muted">Details</p>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    {ad.custom_fields!.map((cf) => (
                      <div key={cf.field_id}>
                        <dt className="text-xs text-ink-muted capitalize">{cf.type}</dt>
                        <dd className="font-medium text-ink">{cf.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* Tags */}
              {(ad.tags ?? []).length > 0 && (
                <div className="px-5 py-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink-muted">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ad.tags!.map((tag) => (
                      <span key={tag} className="flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-0.5 text-xs text-ink-muted">
                        <Tag size={10} />{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reject reason input */}
              {rejecting && (
                <div className="px-5 py-4">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-ink-muted">
                    Rejection reason <span className="text-ink-faint">(optional — sent to seller)</span>
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                    placeholder="e.g. Prohibited item, incomplete description…"
                    className="w-full rounded-lg border border-line bg-surface-muted px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {!loading && ad && isPending && (
          <div className="border-t border-line bg-white px-5 py-4">
            {!rejecting ? (
              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={busy}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                >
                  <CheckCircle2 size={16} /> Approve
                </button>
                <button
                  onClick={() => setRejecting(true)}
                  disabled={busy}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                >
                  <XCircle size={16} /> Reject
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setRejecting(false)}
                  className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink hover:bg-surface-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={busy}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  <XCircle size={16} /> {busy ? 'Rejecting…' : 'Confirm Reject'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
