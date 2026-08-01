'use client';

import { useMemo, useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import { AdminTable } from '@/components/admin/v2/AdminTable';
import { RowActionsMenu, type RowAction } from '@/components/admin/v2/RowActionsMenu';
import { api } from '@/lib/api';
import { readToken } from '@/lib/auth';

export type AdminPlanRow = {
  id: number;
  name: string;
  slug: string | null;
  monthly_price: number | null;
  annual_price: number | null;
  badge: string | null;
  recommended: boolean | number;
  status: string | null;
};

export function PlansTableClient({ initialRows }: { initialRows: AdminPlanRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<AdminPlanRow[]>(initialRows);
  const [form, setForm] = useState({ name: '', monthly_price: '', annual_price: '', badge: '' });
  const [busyId, setBusyId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [pending, start] = useTransition();

  const refresh = async () => {
    const r = await api<AdminPlanRow[]>('/admin/plans', { token: readToken() });
    setRows(Array.isArray(r.data) ? r.data : []);
    start(() => router.refresh());
  };

  const create = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
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
      toast.success('Plan created');
      setForm({ name: '', monthly_price: '', annual_price: '', badge: '' });
      await refresh();
    } catch (e2) {
      toast.error(e2 instanceof Error ? e2.message : 'Create failed');
    } finally { setCreating(false); }
  };

  const remove = async (id: number) => {
    if (!confirm(`Delete plan #${id}?`)) return;
    setBusyId(id);
    try {
      await api(`/admin/plans/${id}`, { method: 'DELETE', token: readToken() });
      toast.success('Plan deleted');
      await refresh();
    } catch (e2) {
      toast.error(e2 instanceof Error ? e2.message : 'Delete failed');
    } finally { setBusyId(null); }
  };

  const columns = useMemo<ColumnDef<AdminPlanRow, any>[]>(() => [
    {
      id: 'id', accessorKey: 'id', header: '#',
      cell: (info) => <span className="font-mono text-[11px]" style={{ color: 'var(--adm-fg-faint)' }}>{info.getValue() as number}</span>,
      size: 60,
    },
    {
      id: 'name', accessorKey: 'name', header: 'Name',
      cell: (info) => {
        const r = info.row.original;
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium" style={{ color: 'var(--adm-fg)' }}>{r.name}</span>
            {r.badge && (
              <span
                className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest"
                style={{ background: 'var(--adm-brand-soft)', color: 'var(--adm-brand)' }}
              >
                {r.badge}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'monthly', accessorKey: 'monthly_price', header: 'Monthly',
      cell: (info) => <span className="tabular-nums font-semibold" style={{ color: 'var(--adm-fg)' }}>৳{new Intl.NumberFormat('en-IN').format((info.getValue() as number | null) ?? 0)}</span>,
      size: 120,
    },
    {
      id: 'annual', accessorKey: 'annual_price', header: 'Annual',
      cell: (info) => <span className="tabular-nums font-semibold" style={{ color: 'var(--adm-fg)' }}>৳{new Intl.NumberFormat('en-IN').format((info.getValue() as number | null) ?? 0)}</span>,
      size: 120,
    },
    {
      id: 'actions', header: '', enableSorting: false, size: 60,
      cell: (info) => {
        const r = info.row.original;
        const actions: RowAction[] = [
          { label: 'Delete', icon: <Trash2 size={13} />, danger: true, disabled: busyId === r.id || pending,
            onClick: () => remove(r.id) },
        ];
        return <div className="flex justify-end"><RowActionsMenu actions={actions} /></div>;
      },
    },
  ], [busyId, pending]);

  const inp = 'h-9 w-full rounded-md border px-3 text-[13px] outline-none focus:ring-2';

  return (
    <>
      <form
        onSubmit={create}
        className="mb-4 grid grid-cols-1 items-end gap-3 rounded-xl border p-4 md:grid-cols-5"
        style={{ background: 'var(--adm-surface)', borderColor: 'var(--adm-border)', boxShadow: 'var(--adm-shadow-sm)' }}
      >
        <div className="md:col-span-2">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--adm-fg-faint)' }}>Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Business" className={inp} style={{ background: 'var(--adm-bg)', borderColor: 'var(--adm-border)', color: 'var(--adm-fg)' }} />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--adm-fg-faint)' }}>Monthly</label>
          <input type="number" min={0} step="0.01" value={form.monthly_price} onChange={(e) => setForm({ ...form, monthly_price: e.target.value })} className={inp} style={{ background: 'var(--adm-bg)', borderColor: 'var(--adm-border)', color: 'var(--adm-fg)' }} />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--adm-fg-faint)' }}>Annual</label>
          <input type="number" min={0} step="0.01" value={form.annual_price} onChange={(e) => setForm({ ...form, annual_price: e.target.value })} className={inp} style={{ background: 'var(--adm-bg)', borderColor: 'var(--adm-border)', color: 'var(--adm-fg)' }} />
        </div>
        <button
          type="submit" disabled={creating}
          className="inline-flex h-9 items-center justify-center rounded-md px-3 text-[12.5px] font-semibold text-white transition disabled:opacity-50 active:translate-y-[1px]"
          style={{ background: 'var(--adm-brand)' }}
        >
          {creating ? 'Adding…' : 'Add plan'}
        </button>
      </form>

      <AdminTable
        title="Membership plans"
        description={`${rows.length} tier${rows.length === 1 ? '' : 's'}`}
        columns={columns}
        data={rows}
        searchable
        searchPlaceholder="Search plan…"
        emptyTitle="No plans yet"
        emptyDescription="Add your first pricing tier above."
      />
    </>
  );
}
