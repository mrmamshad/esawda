'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import { Truck, Banknote, PackageCheck } from 'lucide-react';
import { AdminTable } from '@/components/admin/v2/AdminTable';
import { StatusBadge } from '@/components/admin/v2/StatusBadge';
import { RowActionsMenu, type RowAction } from '@/components/admin/v2/RowActionsMenu';
import { api } from '@/lib/api';
import { readToken } from '@/lib/auth';

export type AdminOrderRow = {
  id: number;
  product_id: number;
  buyer_id: number;
  seller_id: number;
  transaction_id: number | null;
  amount: number;
  shipping_status: string;
  courier_name: string | null;
  tracking_no: string | null;
  seller_paid: boolean;
  created_at: string | null;
  product?: { id: number; product_name: string; slug?: string } | null;
  buyer?:  { username: string; email: string | null } | null;
  seller?: { username: string; email: string | null } | null;
  transaction?: { id: number; status: string } | null;
};

const NEXT_STATUS: Record<string, { key: string; label: string } | null> = {
  pending:    { key: 'processing', label: 'Mark processing' },
  processing: { key: 'shipped',    label: 'Mark shipped' },
  shipped:    { key: 'delivered',  label: 'Mark delivered' },
  delivered:  null,
  cancelled:  null,
};

export function OrdersTableClient({ initialRows }: { initialRows: AdminOrderRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<AdminOrderRow[]>(initialRows);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [pending, start] = useTransition();

  // router.refresh() re-renders the server component and hands back fresh
  // rows — keep the client list in sync instead of pinning the first batch.
  useEffect(() => { setRows(initialRows); }, [initialRows]);

  const patch = async (id: number, body: Record<string, unknown>, success: string) => {
    setBusyId(id);
    try {
      await api(`/admin/orders/${id}`, { method: 'PATCH', token: readToken(), body });
      toast.success(success);
      start(() => router.refresh());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action failed');
    } finally { setBusyId(null); }
  };

  const columns = useMemo<ColumnDef<AdminOrderRow, any>[]>(() => [
    {
      id: 'id', accessorKey: 'id', header: '#',
      cell: (info) => <span className="font-mono text-[11px]" style={{ color: 'var(--adm-fg-faint)' }}>ORD-{info.getValue() as number}</span>,
      size: 80,
    },
    {
      id: 'product',
      accessorFn: (r) => r.product?.product_name ?? `Product #${r.product_id}`,
      header: 'Product',
      cell: (info) => <span style={{ color: 'var(--adm-fg)' }}>{info.getValue() as string}</span>,
    },
    {
      id: 'buyer',
      accessorFn: (r) => r.buyer?.username ?? `#${r.buyer_id}`,
      header: 'Buyer',
      cell: (info) => <span className="text-[12.5px]" style={{ color: 'var(--adm-fg-muted)' }}>{info.getValue() as string}</span>,
    },
    {
      id: 'seller',
      accessorFn: (r) => r.seller?.username ?? `#${r.seller_id}`,
      header: 'Seller',
      cell: (info) => <span className="text-[12.5px]" style={{ color: 'var(--adm-fg-muted)' }}>{info.getValue() as string}</span>,
    },
    {
      id: 'amount', accessorKey: 'amount', header: 'Amount',
      cell: (info) => <span className="tabular-nums font-semibold" style={{ color: 'var(--adm-fg)' }}>৳{new Intl.NumberFormat('en-IN').format(info.getValue() as number)}</span>,
      size: 100,
    },
    {
      id: 'status', accessorKey: 'shipping_status', header: 'Fulfilment',
      cell: (info) => <StatusBadge value={info.getValue() as string} />,
      size: 110,
    },
    {
      id: 'courier',
      accessorFn: (r) => r.courier_name ? `${r.courier_name}${r.tracking_no ? ' · ' + r.tracking_no : ''}` : '—',
      header: 'Courier',
      cell: (info) => <span className="text-[12px]" style={{ color: 'var(--adm-fg-muted)' }}>{info.getValue() as string}</span>,
    },
    {
      id: 'sellerPaid', accessorKey: 'seller_paid', header: 'Paid out',
      cell: (info) => info.getValue() ? <span className="text-[12px] font-semibold text-green-600">Paid</span> : <span className="text-[12px]" style={{ color: 'var(--adm-fg-faint)' }}>Pending</span>,
      size: 80,
    },
    {
      id: 'actions', header: '', enableSorting: false, size: 60,
      cell: (info) => {
        const r = info.row.original;
        const actions: RowAction[] = [];
        const next = NEXT_STATUS[r.shipping_status];
        if (next) actions.push({
          label: next.label, icon: <Truck size={13} />, disabled: busyId === r.id || pending,
          onClick: () => patch(r.id, { shipping_status: next.key }, `Order → ${next.key}`),
        });
        if (!r.seller_paid && r.shipping_status !== 'cancelled') actions.push({
          label: 'Mark seller paid', icon: <Banknote size={13} />, disabled: busyId === r.id || pending,
          onClick: () => patch(r.id, { seller_paid: true }, 'Seller marked paid'),
        });
        if (r.shipping_status !== 'cancelled' && r.shipping_status !== 'delivered') actions.push({
          label: 'Cancel order', icon: <PackageCheck size={13} />, danger: true, disabled: busyId === r.id || pending,
          onClick: () => { if (confirm(`Cancel order ORD-${r.id}?`)) patch(r.id, { shipping_status: 'cancelled' }, 'Order cancelled'); },
        });
        return <div className="flex justify-end"><RowActionsMenu actions={actions} /></div>;
      },
    },
  ], [busyId, pending, router]);

  return (
    <AdminTable
      title="Orders"
      description={`${rows.length} order${rows.length === 1 ? '' : 's'}`}
      columns={columns}
      data={rows}
      searchable
      searchPlaceholder="Search product / buyer / seller…"
      emptyTitle="No orders match this filter"
      emptyDescription="Buy-now purchases will appear here once buyers check out."
    />
  );
}
