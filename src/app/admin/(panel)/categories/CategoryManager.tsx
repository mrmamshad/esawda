'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { readToken } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { DataTable, type Column } from '@/components/admin/DataTable';

type Row = { cat_id: number; cat_name: string; slug: string | null; cat_order: number | null; icon: string | null };

export function CategoryManager({ initial }: { initial: Row[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(initial);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const r = await api<Row[]>('/admin/categories', { token: readToken() });
    setRows(r.data);
    router.refresh();
  };

  const create = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      await api('/admin/categories', { method: 'POST', token: readToken(), body: { cat_name: name.trim() } });
      setName('');
      await refresh();
    } finally { setBusy(false); }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete category?')) return;
    await api(`/admin/categories/${id}`, { method: 'DELETE', token: readToken() });
    await refresh();
  };

  const cols: Column<Row>[] = [
    { key: 'id',    header: '#',     render: (r) => <span className="font-mono text-xs">{r.cat_id}</span> },
    { key: 'name',  header: 'Name',  render: (r) => <span className="font-semibold text-ink">{r.cat_name}</span> },
    { key: 'slug',  header: 'Slug',  render: (r) => <span className="text-ink-muted">{r.slug ?? '—'}</span> },
    { key: 'ord',   header: 'Order', render: (r) => r.cat_order ?? '—' },
    { key: 'act',   header: '',      render: (r) => (
      <Button size="sm" variant="outline" onClick={() => remove(r.cat_id)}>Delete</Button>
    ), className: 'text-right' },
  ];

  return (
    <>
      <div className="surface-card flex flex-wrap items-end gap-3 p-4">
        <div className="flex-1 min-w-0">
          <label className="block text-xs uppercase tracking-widest text-ink-muted">New category</label>
          <input
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Electronics"
            className="mt-1 w-full rounded-field border border-line px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <Button variant="filled" onClick={create} disabled={busy}>Add category</Button>
      </div>

      <DataTable rows={rows} columns={cols} empty="No categories yet." />
    </>
  );
}
