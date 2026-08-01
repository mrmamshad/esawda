'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { readToken } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { DataTable, type Column } from '@/components/admin/DataTable';

type Row = { id: number; name: string; slug: string | null; monthly_price: number | null; annual_price: number | null; badge: string | null; recommended: boolean | number; status: string | null };

export function PlanManager({ initial }: { initial: Row[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(initial);
  const [form, setForm] = useState({ name: '', monthly_price: '', annual_price: '', badge: '' });
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const r = await api<Row[]>('/admin/plans', { token: readToken() });
    setRows(r.data);
    router.refresh();
  };

  const create = async () => {
    if (!form.name.trim()) return;
    setBusy(true);
    try {
      await api('/admin/plans', {
        method: 'POST', token: readToken(),
        body: {
          name: form.name.trim(),
          monthly_price: parseFloat(form.monthly_price || '0'),
          annual_price:  parseFloat(form.annual_price  || '0'),
          badge: form.badge || null,
        },
      });
      setForm({ name: '', monthly_price: '', annual_price: '', badge: '' });
      await refresh();
    } finally { setBusy(false); }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete plan?')) return;
    await api(`/admin/plans/${id}`, { method: 'DELETE', token: readToken() });
    await refresh();
  };

  const cols: Column<Row>[] = [
    { key: 'name',    header: 'Name',    render: (r) => <span className="font-semibold text-ink">{r.name}</span> },
    { key: 'monthly', header: 'Monthly', render: (r) => `৳${r.monthly_price ?? 0}` },
    { key: 'annual',  header: 'Annual',  render: (r) => `৳${r.annual_price ?? 0}` },
    { key: 'badge',   header: 'Badge',   render: (r) => r.badge ?? '—' },
    { key: 'act',     header: '',        render: (r) => (
      <Button size="sm" variant="outline" onClick={() => remove(r.id)}>Delete</Button>
    ), className: 'text-right' },
  ];

  return (
    <>
      <div className="surface-card grid gap-3 p-4 md:grid-cols-5">
        <input placeholder="Name"    value={form.name}          onChange={(e) => setForm({ ...form, name: e.target.value })}          className="rounded-field border border-line px-3 py-2 text-sm md:col-span-2" />
        <input placeholder="Monthly" value={form.monthly_price} onChange={(e) => setForm({ ...form, monthly_price: e.target.value })} className="rounded-field border border-line px-3 py-2 text-sm" type="number" min={0} step="0.01" />
        <input placeholder="Annual"  value={form.annual_price}  onChange={(e) => setForm({ ...form, annual_price: e.target.value })}  className="rounded-field border border-line px-3 py-2 text-sm" type="number" min={0} step="0.01" />
        <Button variant="filled" onClick={create} disabled={busy}>Add plan</Button>
      </div>

      <DataTable rows={rows} columns={cols} empty="No plans yet." />
    </>
  );
}
