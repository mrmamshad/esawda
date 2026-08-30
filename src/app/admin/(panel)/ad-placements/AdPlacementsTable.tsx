'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import { Pencil, Trash2, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { readToken } from '@/lib/auth';
import { PLACEMENT_PAGES, PLACEMENT_BY_SLUG, type PlacementTemplate } from '@/config/adPlacements';

export type AdminAdPlacementRow = {
  id: number;
  slug: string;
  title: string | null;
  size: string;
  image_url: string | null;
  link_url: string | null;
  alt_text: string | null;
  status: boolean;
  starts_at: string | null;
  expires_at: string | null;
};

export function AdPlacementsTable({ initialRows }: { initialRows: AdminAdPlacementRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<AdminAdPlacementRow[]>(initialRows);
  useEffect(() => { setRows(initialRows); }, [initialRows]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [pending, start] = useTransition();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ slug: string; row?: AdminAdPlacementRow } | null>(null);

  const refresh = () => start(() => router.refresh());

  const remove = async (r: AdminAdPlacementRow) => {
    if (!confirm(`Delete ad for "${r.slug}"?`)) return;
    setBusyId(r.id);
    try {
      await api(`/admin/ads/placements/${r.id}`, { method: 'DELETE', token: readToken() });
      toast.success('Deleted');
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    } finally { setBusyId(null); }
  };

  // Build a lookup: slug → existing row
  const bySlug = useMemo(() => {
    const m = new Map<string, AdminAdPlacementRow>();
    for (const r of rows) m.set(r.slug, r);
    return m;
  }, [rows]);

  // Count configured slots per page
  const pageCount = (page: (typeof PLACEMENT_PAGES)[number]) =>
    page.slots.filter((s) => bySlug.has(s.slug)).length;

  const togglePage = (key: string) => setExpanded((prev) => (prev === key ? null : key));

  return (
    <>
      <div className="space-y-4">
        {PLACEMENT_PAGES.map((page) => {
          const count = pageCount(page);
          const total = page.slots.length;
          const open = expanded === page.key;
          return (
            <section
              key={page.key}
              className="rounded-xl border"
              style={{ background: 'var(--adm-surface)', borderColor: 'var(--adm-border)', boxShadow: 'var(--adm-shadow-sm)' }}
            >
              {/* Page header — clickable to expand */}
              <button
                type="button"
                onClick={() => togglePage(page.key)}
                className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-black/[0.015]"
              >
                <div className="flex items-center gap-3">
                  <span style={{ color: 'var(--adm-fg-faint)' }}>
                    {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </span>
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--adm-fg)' }}>{page.name}</p>
                    <p className="text-[11.5px]" style={{ color: 'var(--adm-fg-faint)' }}>{page.description}</p>
                  </div>
                </div>
                <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{
                  background: 'var(--adm-brand-soft)',
                  color: 'var(--adm-brand)',
                }}>
                  {count} / {total} slots
                </span>
              </button>

              {/* Slot rows (only when expanded) */}
              {open && (
                <div className="border-t px-5 py-3" style={{ borderColor: 'var(--adm-border)' }}>
                  <div className="space-y-2">
                    {page.slots.map((tmpl) => {
                      const row = bySlug.get(tmpl.slug);
                      return (
                        <SlotRow
                          key={tmpl.slug}
                          template={tmpl}
                          row={row}
                          busyId={busyId}
                          onEdit={() => setEditing({ slug: tmpl.slug, row })}
                          onDelete={row ? () => remove(row) : undefined}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {editing && (
        <PlacementModal
          slug={editing.slug}
          row={editing.row}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}
    </>
  );
}

/* ── Single slot row ──────────────────────────────────────────── */

function SlotRow({
  template, row, busyId, onEdit, onDelete,
}: {
  template: PlacementTemplate;
  row?: AdminAdPlacementRow;
  busyId: number | null;
  onEdit: () => void;
  onDelete?: () => void;
}) {
  const img = row?.image_url;
  const expired = row?.expires_at && new Date(row.expires_at).getTime() < Date.now();
  return (
    <div
      className="flex items-center gap-3 rounded-lg border px-3 py-2.5"
      style={{ borderColor: 'var(--adm-border)' }}
    >
      {/* Small image preview */}
      <div className="relative h-9 w-20 shrink-0 overflow-hidden rounded-md border" style={{ borderColor: 'var(--adm-border)' }}>
        {img ? (
          <Image src={img} alt="" fill sizes="80px" className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-black/[0.03] text-[10px]" style={{ color: 'var(--adm-fg-faint)' }}>
            — 
          </div>
        )}
      </div>

      {/* Position info */}
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-medium" style={{ color: 'var(--adm-fg)' }}>{template.label}</p>
        <p className="text-[10.5px]" style={{ color: 'var(--adm-fg-faint)' }}>{template.hint}</p>
      </div>

      {/* Status badge */}
      <div className="shrink-0 text-right">
        {row ? (
          <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${expired ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {row.status ? (expired ? 'Expired' : 'Active') : 'Inactive'}
          </span>
        ) : (
          <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">Not set</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          onClick={onEdit}
          disabled={busyId === row?.id}
          className="rounded p-1.5 transition hover:bg-black/[0.04] disabled:opacity-40"
          title={row ? 'Edit' : 'Add ad'}
          style={{ color: 'var(--adm-fg-muted)' }}
        >
          {row ? <Pencil size={14} /> : <Plus size={14} />}
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={busyId === row?.id}
            className="rounded p-1.5 transition hover:bg-red-50 disabled:opacity-40"
            style={{ color: 'var(--adm-danger)' }}
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Edit / Create modal ──────────────────────────────────────── */

function PlacementModal({
  slug, row, onClose, onSaved,
}: {
  slug: string;
  row?: AdminAdPlacementRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const tmpl = PLACEMENT_BY_SLUG[slug];
  const [title, setTitle] = useState(row?.title ?? tmpl?.label ?? '');
  const [linkUrl, setLinkUrl] = useState(row?.link_url ?? '');
  const [altText, setAltText] = useState(row?.alt_text ?? '');
  const [expiresAt, setExpiresAt] = useState(row?.expires_at?.slice(0, 10) ?? '');
  const [startsAt, setStartsAt] = useState(row?.starts_at?.slice(0, 10) ?? '');
  const [status, setStatus] = useState(row?.status ?? true);
  const [image, setImage] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setBusy(true);
    const fd = new FormData();
    fd.append('slug', slug);
    if (title.trim()) fd.append('title', title.trim());
    fd.append('size', tmpl?.size ?? 'wide');
    if (linkUrl.trim()) fd.append('link_url', linkUrl.trim());
    if (altText.trim()) fd.append('alt_text', altText.trim());
    if (startsAt) fd.append('starts_at', startsAt);
    if (expiresAt) fd.append('expires_at', expiresAt);
    fd.append('status', status ? '1' : '0');
    if (image) fd.append('image', image);

    try {
      if (row) {
        await api(`/admin/ads/placements/${row.id}`, { method: 'PUT', token: readToken(), body: fd });
        toast.success('Slot updated');
      } else {
        await api('/admin/ads/placements', { method: 'POST', token: readToken(), body: fd });
        toast.success('Slot created');
      }
      onSaved();
    } catch (e2) {
      if (e2 instanceof ApiError) setErr(e2.message);
      else setErr('Could not save.');
    } finally { setBusy(false); }
  };

  const inpCls = 'w-full rounded-md border px-3 py-2 text-[13px] outline-none focus:ring-2';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl p-6" style={{ background: 'var(--adm-surface)' }} onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-1 text-base font-bold" style={{ color: 'var(--adm-fg)' }}>{tmpl?.label || slug}</h3>
        <p className="mb-4 text-[12px]" style={{ color: 'var(--adm-fg-faint)' }}>{tmpl?.hint || ''} · {slug}</p>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--adm-fg-muted)' }}>Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={inpCls} style={{ borderColor: 'var(--adm-border)', color: 'var(--adm-fg)', background: 'var(--adm-bg)' }} />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--adm-fg-muted)' }}>Link URL</label>
              <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className={inpCls} style={{ borderColor: 'var(--adm-border)', color: 'var(--adm-fg)', background: 'var(--adm-bg)' }} placeholder="https://…" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--adm-fg-muted)' }}>Starts</label>
              <input type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className={inpCls} style={{ borderColor: 'var(--adm-border)', color: 'var(--adm-fg)', background: 'var(--adm-bg)' }} />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--adm-fg-muted)' }}>Expires</label>
              <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={inpCls} style={{ borderColor: 'var(--adm-border)', color: 'var(--adm-fg)', background: 'var(--adm-bg)' }} />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--adm-fg-muted)' }}>Image {row ? '(leave empty to keep current)' : ''}</label>
              <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} className={inpCls} style={{ borderColor: 'var(--adm-border)', color: 'var(--adm-fg)', background: 'var(--adm-bg)' }} />
            </div>
          </div>

          <label className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--adm-fg)' }}>
            <input type="checkbox" checked={status} onChange={(e) => setStatus(e.target.checked)} />
            Active
          </label>

          {err && <p className="rounded bg-red-50 px-3 py-2 text-xs text-red-700">{err}</p>}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border px-3 py-2 text-[12.5px] font-semibold" style={{ borderColor: 'var(--adm-border)', color: 'var(--adm-fg-muted)' }}>Cancel</button>
            <button type="submit" disabled={busy} className="rounded-lg px-3 py-2 text-[12.5px] font-semibold text-white disabled:opacity-60" style={{ background: 'var(--adm-brand)' }}>{busy ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}