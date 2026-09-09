'use client';

import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { readToken } from '@/lib/auth';
import type { AdminCategoryRow, AdminSubcategoryRow } from './types';

/**
 * Per-category subcategory manager. Opens from the Categories table and
 * lets an admin list, add, rename/reorder, and delete the subcategories
 * of one parent category.
 */
export function SubcategoryManager({
  category,
  onClose,
  onChanged,
}: {
  category: AdminCategoryRow;
  onClose: () => void;
  onChanged: () => Promise<void>;
}) {
  const [rows, setRows] = useState<AdminSubcategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editOrder, setEditOrder] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api<AdminSubcategoryRow[]>(`/admin/subcategories?category=${category.cat_id}`, {
        token: readToken(),
      });
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      if (!(e instanceof ApiError)) throw e;
      toast.error('Could not load subcategories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const add = async () => {
    if (!name.trim()) return;
    setAdding(true);
    try {
      await api('/admin/subcategories', {
        method: 'POST',
        token: readToken(),
        body: { main_cat_id: category.cat_id, sub_cat_name: name.trim() },
      });
      setName('');
      toast.success('Subcategory added');
      await load();
      await onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Subcategory could not be added');
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (row: AdminSubcategoryRow) => {
    setEditingId(row.sub_cat_id);
    setEditName(row.sub_cat_name);
    setEditOrder(row.cat_order?.toString() ?? '');
  };

  const saveEdit = async (row: AdminSubcategoryRow) => {
    if (!editName.trim()) return;
    try {
      await api(`/admin/subcategories/${row.sub_cat_id}`, {
        method: 'PUT',
        token: readToken(),
        body: { sub_cat_name: editName.trim(), ...(editOrder.trim() ? { cat_order: Number(editOrder) } : {}) },
      });
      setEditingId(null);
      toast.success('Subcategory updated');
      await load();
      await onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Subcategory could not be updated');
    }
  };

  const remove = async (row: AdminSubcategoryRow) => {
    if (!confirm(`Delete “${row.sub_cat_name}”? Subcategories in use cannot be deleted.`)) return;
    try {
      await api(`/admin/subcategories/${row.sub_cat_id}`, { method: 'DELETE', token: readToken() });
      toast.success('Subcategory deleted');
      await load();
      await onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Subcategory could not be deleted');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/55 p-4" role="presentation" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="subcategory-manager-title"
        onMouseDown={(event) => event.stopPropagation()}
        className="max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-2xl border p-5 shadow-2xl sm:p-6"
        style={{ background: 'var(--adm-surface)', borderColor: 'var(--adm-border)' }}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--adm-brand)' }}>
              {category.cat_name}
            </p>
            <h2 id="subcategory-manager-title" className="mt-1 text-xl font-bold" style={{ color: 'var(--adm-fg)' }}>
              Subcategories
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close subcategory manager" className="inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-black/5">
            <X size={19} />
          </button>
        </div>

        <div className="mb-4 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void add(); } }}
            maxLength={100}
            placeholder="New subcategory name…"
            className="h-11 min-w-0 flex-1 rounded-lg border border-[var(--adm-border)] bg-[var(--adm-bg)] px-3 text-sm text-[var(--adm-fg)] outline-none focus:ring-2"
          />
          <button
            type="button"
            onClick={() => void add()}
            disabled={adding || !name.trim()}
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: 'var(--adm-brand)' }}
          >
            <Plus size={15} /> Add
          </button>
        </div>

        {loading ? (
          <p className="py-6 text-center text-sm" style={{ color: 'var(--adm-fg-muted)' }}>Loading…</p>
        ) : rows.length === 0 ? (
          <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm" style={{ borderColor: 'var(--adm-border)', color: 'var(--adm-fg-muted)' }}>
            No subcategories yet — add the first one above.
          </p>
        ) : (
          <ul className="divide-y rounded-xl border" style={{ borderColor: 'var(--adm-border)' }}>
            {rows.map((row) => (
              <li key={row.sub_cat_id} className="flex items-center gap-2 px-3 py-2.5">
                {editingId === row.sub_cat_id ? (
                  <>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      maxLength={100}
                      className="h-9 min-w-0 flex-1 rounded-lg border border-[var(--adm-border)] bg-[var(--adm-bg)] px-2.5 text-sm text-[var(--adm-fg)] outline-none focus:ring-2"
                    />
                    <input
                      value={editOrder}
                      onChange={(e) => setEditOrder(e.target.value)}
                      type="number"
                      min={0}
                      max={9999}
                      placeholder="Order"
                      className="h-9 w-20 rounded-lg border border-[var(--adm-border)] bg-[var(--adm-bg)] px-2.5 text-sm text-[var(--adm-fg)] outline-none focus:ring-2"
                    />
                    <button type="button" onClick={() => void saveEdit(row)} className="rounded-lg px-3 py-2 text-sm font-semibold text-white" style={{ background: 'var(--adm-brand)' }}>
                      Save
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} className="rounded-lg px-2 py-2 text-sm font-semibold" style={{ color: 'var(--adm-fg-muted)' }}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold" style={{ color: 'var(--adm-fg)' }}>{row.sub_cat_name}</p>
                      <p className="truncate font-mono text-[11px]" style={{ color: 'var(--adm-fg-faint)' }}>
                        {row.slug ?? '—'} · order {row.cat_order ?? '—'} · {row.posts_count ?? 0} products
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => startEdit(row)}
                      aria-label={`Edit ${row.sub_cat_name}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-black/5"
                      style={{ color: 'var(--adm-fg-muted)' }}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(row)}
                      aria-label={`Delete ${row.sub_cat_name}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
