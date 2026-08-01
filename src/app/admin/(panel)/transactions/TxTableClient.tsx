'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { AdminTable } from '@/components/admin/v2/AdminTable';
import { StatusBadge } from '@/components/admin/v2/StatusBadge';
import { RowActionsMenu, type RowAction } from '@/components/admin/v2/RowActionsMenu';
import { api } from '@/lib/api';
import { readToken } from '@/lib/auth';

export type AdminTxRow = {
  id: number;
  seller_id: number;
  amount: number;
  status: string;
  transaction_gatway: string;
  purpose: string | null;
  product_name: string | null;
  created_at: string | null;
  seller?: { username: string; email: string } | null;
};

export function TxTableClient({ initialRows }: { initialRows: AdminTxRow[] }) {
  const router = useRouter();
  const [rows] = useState<AdminTxRow[]>(initialRows);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [pending, start] = useTransition();

  const call = async (id: number, path: string, success = 'Done') => {
    setBusyId(id);
    try {
      await api(`/admin/transactions/${id}${path}`, { method: 'POST', token: readToken() });
      toast.success(success);
      start(() => router.refresh());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action failed');
    } finally { setBusyId(null); }
  };

  const columns = useMemo<ColumnDef<AdminTxRow, any>[]>(() => [
    {
      id: 'id', accessorKey: 'id', header: '#',
      cell: (info) => <span className="font-mono text-[11px]" style={{ color: 'var(--adm-fg-faint)' }}>TX-{info.getValue() as number}</span>,
      size: 90,
    },
    {
      id: 'seller',
      accessorFn: (r) => r.seller?.username ?? `#${r.seller_id}`,
      header: 'Seller',
      cell: (info) => <span style={{ color: 'var(--adm-fg)' }}>{info.getValue() as string}</span>,
    },
    {
      id: 'purpose', accessorFn: (r) => r.purpose ?? r.product_name ?? '—', header: 'Purpose',
      cell: (info) => <span className="text-[12.5px] capitalize" style={{ color: 'var(--adm-fg-muted)' }}>{info.getValue() as string}</span>,
    },
    {
      id: 'gateway', accessorKey: 'transaction_gatway', header: 'Gateway',
      cell: (info) => <span className="text-[12.5px] capitalize" style={{ color: 'var(--adm-fg-muted)' }}>{info.getValue() as string}</span>,
      size: 110,
    },
    {
      id: 'amount', accessorKey: 'amount', header: 'Amount',
      cell: (info) => <span className="tabular-nums font-semibold" style={{ color: 'var(--adm-fg)' }}>৳{new Intl.NumberFormat('en-IN').format(info.getValue() as number)}</span>,
      size: 120,
    },
    {
      id: 'status', accessorKey: 'status', header: 'Status',
      cell: (info) => <StatusBadge value={info.getValue() as string} />,
      size: 110,
    },
    {
      id: 'actions', header: '', enableSorting: false, size: 60,
      cell: (info) => {
        const r = info.row.original;
        const actions: RowAction[] = [];
        if (r.status !== 'success') actions.push({
          label: 'Mark paid', icon: <CheckCircle2 size={13} />, disabled: busyId === r.id || pending,
          onClick: () => call(r.id, '/mark-paid', 'Marked paid'),
        });
        if (r.status === 'success') actions.push({
          label: 'Refund', icon: <RotateCcw size={13} />, danger: true, disabled: busyId === r.id || pending,
          onClick: () => { if (confirm(`Refund TX-${r.id}?`)) call(r.id, '/refund', 'Refunded'); },
        });
        return <div className="flex justify-end"><RowActionsMenu actions={actions} /></div>;
      },
    },
  ], [busyId, pending, router]);

  return (
    <AdminTable
      title="Transactions"
      description={`${rows.length} record${rows.length === 1 ? '' : 's'}`}
      columns={columns}
      data={rows}
      searchable
      searchPlaceholder="Search seller / purpose…"
      emptyTitle="No transactions match this filter"
      emptyDescription="Try a different status."
    />
  );
}
