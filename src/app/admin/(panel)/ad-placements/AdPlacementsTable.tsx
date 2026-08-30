'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { AdminTable } from '@/components/admin/v2/AdminTable';
import { RowActionsMenu, type RowAction } from '@/components/admin/v2/RowActionsMenu';
import { api, ApiError } from '@/lib/api';
import { readToken } from '@/lib/auth';

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

  const [editing, setEditing] = useState<AdminAdPlacementRow | 'new' | null>(null);

  const refresh = () => start(() => router.refresh());

  const remove = async (r: AdminAdPlacementRow) => {
    if (!confirm(`Delete ad slot "${r.slug}"?`)) return;
    setBusyId(r.id);
    try {
      await api(`/admin/ads/placements/${r.id}`, { method: 'DELETE', token: readToken() });
      toast.success('Ad slot deleted');
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    } finally { setBusyId(null); }
  };

  const columns = useMemo<ColumnDef<AdminAdPlacementRow, any>[]>(() => [
    {
      id: 'slot', accessorKey: 'slug', header: 'Placement',
      cell: (info) => {
        const r = info.row.original;
        return (
          <div className="min-w-0">
            <p className="font-mono text-[11.5px] font-medium" style={{ color: 'var(--adm-fg)' }}>{r.slug}</p>
            {r.title && <p className="text-[11px]" style={{ color: 'var(--adm-fg-faint)' }}>{r.title}</p>}
          </div>
        );
      },
    },
    {
      id: 'size', accessorKey: 'size', header: 'Size',
      cell: (info) => <span className="text-[12.5px] capitalize" style={{ color: 'var(--adm-fg-muted)' }}>{info.getValue() as string}</span>,
      size: 90,
    },
    {
      id: 'image', accessorKey: 'image_url', header: 'Image',
      cell: (info) => {
        const src = info.getValue() as string | null;
        return src ? (
          <div className="relative h-10 w-24 overflow-hidden rounded-md border" style={{ borderColor: 'var(--adm-border)' }}>
            <Image src={src} alt="Ad" fill sizes="96px" className="object-cover" unoptimized />
          </div>
        ) : <span className="text-[11px]" style={{ color: 'var(--adm-fg-faint)' }}>default</span>;
      },
      size: 120,
    },
    {
      id: 'status', accessorKey: 'status', header: 'Status',
      cell: (info) => info.getValue()
        ? <span className="rounded bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">Active</span>
        : <span className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">Inactive</span>,
      size: 90,
    },
    {
      id: 'expiry', accessorKey: 'expires_at', header: 'Expires',
      cell: (info) => {
        const v = info.getValue() as string | null;
        if (!v) return <span className="text-[12px]" style={{ color: 'var(--adm-fg-faint)' }}>Never</span>;
        const expired = new Date(v).getTime() < Date.now();
        return (
          <span className="text-[12px]" style={{ color: expired ? 'var(--adm-danger)' : 'var(--adm-fg-muted)' }}>
            {v.slice(0, 10)}{expired ? ' (expired)' : ''}
          </span>
        );
      },
      size: 130,
    },
    {
      id: 'actions', header: '', enableSorting: false,
      cell: (info) => {
        const r = info.row.original;
        const actions: RowAction[] = [
          { label: 'Edit', icon: <Pencil size={13} />, disabled: busyId === r.id || pending, onClick: () => setEditing(r) },
          { label: 'Delete', icon: <Trash2 size={13} />, danger: true, disabled: busyId === r.id || pending, onClick: () => remove(r) },
        ];
        return <div className="flex justify-end"><RowActionsMenu actions={actions} /></div>;
      },
      size: 60,
    },
  ], [busyId, pending, router]);

  return (
    <>
      <AdminTable
        title="Ad Slots"
        description={`${rows.length} placement${rows.length === 1 ? '' : 's'} configured`}
        columns={columns}
        data={rows}
        searchable
        searchPlaceholder="Search placement id…"
        emptyTitle="No ad slots yet"
        emptyDescription="Add your first placement slot to start serving banner ads."
        headerRight={
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12.5px] font-semibold text-white transition active:translate-y-[1px]"
            style={{ background: 'var(--adm-brand)' }}
          >
            <Plus size={14} /> New slot
          </button>
        }
      />
      {editing && (
        <PlacementModal
          row={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────── */

function PlacementModal({
  row, onClose, onSaved,
}: { row: AdminAdPlacementRow | null; onClose: () => void; onSaved: () => void }) {
  const [slug, setSlug] = useState(row?.slug ?? '');
  const [title, setTitle] = useState(row?.title ?? '');
  const [size, setSize] = useState(row?.size ?? 'wide');
  const [linkUrl, setLinkUrl] = useState(row?.link_url ?? '');
  const [altText, setAltText] = useState(row?.alt_text ?? '');
  const [expiresAt, setExpiresAt] = useState(row?.expires_at?.slice(0, 10) ?? '');
  const [startsAt, setStartsAt] = useState(row?.starts_at?.slice(0, 10) ?? '');
  const [status, setStatus] = useState(row?.status ?? true);
  const [image, setImage] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const SIZES = ['wide', 'large', 'leaderboard', 'mpu', 'infeed', 'skyscraper'];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setBusy(true);
    const fd = new FormData();
    fd.append('slug', slug.trim());
    if (title.trim()) fd.append('title', title.trim());
    fd.append('size', size);
    if (linkUrl.trim()) fd.append('link_url', linkUrl.trim());
    if (altText.trim()) fd.append('alt_text', altText.trim());
    if (startsAt) fd.append('starts_at', startsAt);
    if (expiresAt) fd.append('expires_at', expiresAt);
    fd.append('status', status ? '1' : '0');
    if (image) fd.append('image', image);

    try {
      if (row) {
        await api(`/admin/ads/placements/${row.id}`, { method: 'PUT', token: readToken(), body: fd });
        toast.success('Ad slot updated');
      } else {
        await api('/admin/ads/placements', { method: 'POST', token: readToken(), body: fd });
        toast.success('Ad slot created');
      }
      onSaved();
    } catch (e2) {
      if (e2 instanceof ApiError) setErr(e2.message);
      else setErr('Could not save the ad slot.');
    } finally { setBusy(false); }
  };

  const inp = 'w-full rounded-md border px-3 py-2 text-[13px] outline-none focus:ring-2';
  const labelCls = 'mb-1 block text-[11px] font-semibold uppercase tracking-wider';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl p-6" style={{ background: 'var(--adm-surface)', boxShadow: 'var(--adm-shadow-lg)' }} onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-4 text-base font-bold" style={{ color: 'var(--adm-fg)' }}>
          {row ? `Edit ${row.slug}` : 'New ad slot'}
        </h3>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={labelCls} style={{ color: 'var(--adm-fg-muted)' }}>Placement ID *</label>
              <input required value={slug} onChange={(e) => setSlug(e.target.value)}
                className={inp} placeholder="e.g. home.after_categories" style={{ borderColor: 'var(--adm-border)', color: 'var(--adm-fg)', background: 'var(--adm-bg)' }}
                disabled={!!row} />
            </div>
            <div>
              <label className={labelCls} style={{ color: 'var(--adm-fg-muted)' }}>Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={inp} style={{ borderColor: 'var(--adm-border)', color: 'var(--adm-fg)', background: 'var(--adm-bg)' }} />
            </div>
            <div>
              <label className={labelCls} style={{ color: 'var(--adm-fg-muted)' }}>Size</label>
              <select value={size} onChange={(e) => setSize(e.target.value)} className={inp} style={{ borderColor: 'var(--adm-border)', color: 'var(--adm-fg)', background: 'var(--adm-bg)' }}>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className={labelCls} style={{ color: 'var(--adm-fg-muted)' }}>Link URL</label>
              <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className={inp} style={{ borderColor: 'var(--adm-border)', color: 'var(--adm-fg)', background: 'var(--adm-bg)' }} placeholder="https://… (optional)" />
            </div>
            <div>
              <label className={labelCls} style={{ color: 'var(--adm-fg-muted)' }}>Starts (optional)</label>
              <input type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className={inp} style={{ borderColor: 'var(--adm-border)', color: 'var(--adm-fg)', background: 'var(--adm-bg)' }} />
            </div>
            <div>
              <label className={labelCls} style={{ color: 'var(--adm-fg-muted)' }}>Expires (optional)</label>
              <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={inp} style={{ borderColor: 'var(--adm-border)', color: 'var(--adm-fg)', background: 'var(--adm-bg)' }} />
            </div>
            <div className="col-span-2">
              <label className={labelCls} style={{ color: 'var(--adm-fg-muted)' }}>Image {row ? '(optional — leave empty to keep current)' : ''}</label>
              <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} className={inp} style={{ borderColor: 'var(--adm-border)', color: 'var(--adm-fg)', background: 'var(--adm-bg)' }} />
            </div>
          </div>

          <label className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--adm-fg)' }}>
            <input type="checkbox" checked={status} onChange={(e) => setStatus(e.target.checked)} />
            Active
          </label>

          {err && <p className="rounded bg-red-50 px-3 py-2 text-xs text-red-700">{err}</p>}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border px-3 py-2 text-[12.5px] font-semibold" style={{ borderColor: 'var(--adm-border)', color: 'var(--adm-fg-muted)' }}>
              Cancel
            </button>
            <button type="submit" disabled={busy} className="rounded-lg px-3 py-2 text-[12.5px] font-semibold text-white disabled:opacity-60" style={{ background: 'var(--adm-brand)' }}>
              {busy ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
