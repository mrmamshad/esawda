'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, Copy, RotateCcw } from 'lucide-react';
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
  transaction_method: string | null;
  gateway_transaction_id: string | null;
  gateway_transaction_number: string | null;
  purpose: string | null;
  product_name: string | null;
  meta?: string | null;
  created_at: string | null;
  seller?: { username: string; name: string | null; email: string } | null;
};

/** Human wallet/bank label: bKash, Nagad, Rocket, DBBL, Bank, Card… */
function friendlyMethod(raw: string | null, gateway: string): string {
  const hay = (raw ?? '').toLowerCase();
  if (hay.includes('bkash')) return 'bKash';
  if (hay.includes('nagad')) return 'Nagad';
  if (hay.includes('rocket')) return 'Rocket';
  if (hay.includes('upay')) return 'Upay';
  if (hay.includes('dutch') || hay.includes('dbbl')) return 'DBBL Bank';
  if (hay.includes('bank')) return 'Bank';
  if (hay.includes('visa') || hay.includes('master') || hay.includes('card')) return 'Card';
  if (raw && raw.trim() !== '') return raw;
  return gateway ? gateway.charAt(0).toUpperCase() + gateway.slice(1) : '—';
}

type MetaBag = Record<string, unknown>;

/** Copy with a legacy fallback — clipboard API needs a secure context. */
async function copyText(v: string) {
  try {
    await navigator.clipboard.writeText(v);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = v;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
  toast.success('Transaction ID copied');
}

/** Decode the transaction.meta JSON blob (already a raw JSON string from the API). */
function parseMeta(raw?: string | null): MetaBag {
  if (!raw) return {};
  try { const v = JSON.parse(raw); return v && typeof v === 'object' ? v as MetaBag : {}; } catch { return {}; }
}

const UPGRADE_LABELS: Record<string, string> = {
  featured:  'Featured',
  urgent:    'Urgent',
  highlight: 'Highlight',
};

/** Which paid upgrades a transaction meta actually enabled (ad_upgrade only). */
function upgradeChips(meta: MetaBag): string[] {
  return (['featured', 'urgent', 'highlight'] as const)
    .filter((k) => meta[k] === true || meta[k] === '1' || meta[k] === 1)
    .map((k) => UPGRADE_LABELS[k])
    .filter((v): v is string => Boolean(v));
}

/**
 * Build a descriptive, human-readable purpose line.
 *
 *   plan              → "Plan subscription · Monthly"
 *   ad_upgrade        → "Ad boost · Featured, Highlight"  (+ chips)
 *   paid_listing      → "Paid listing · <product>"
 *   ad_post           → "Ad posting · <product>"
 *   product_purchase  → "Product purchase · <product>"
 *   legacy (null)     → falls back to the product_name column
 */
export function formatPurpose(row: AdminTxRow): { label: string; chips: string[] } {
  const meta = parseMeta(row.meta);

  switch (row.purpose) {
    case 'plan': {
      const cadence = typeof meta.cadence === 'string' ? meta.cadence : '';
      const pretty = cadence.charAt(0).toUpperCase() + cadence.slice(1);
      return { label: pretty ? `Plan subscription · ${pretty}` : 'Plan subscription', chips: [] };
    }
    case 'ad_upgrade': {
      const chips = upgradeChips(meta);
      const suffix = chips.length ? ` · ${chips.join(', ')}` : '';
      return { label: `Ad boost${suffix}`, chips };
    }
    case 'paid_listing':
      return { label: row.product_name ? `Paid listing · ${row.product_name}` : 'Paid listing', chips: [] };
    case 'ad_post':
      return { label: row.product_name ? `Ad posting · ${row.product_name}` : 'Ad posting', chips: [] };
    case 'product_purchase':
      return { label: row.product_name ? `Product purchase · ${row.product_name}` : 'Product purchase', chips: [] };
    default:
      return { label: row.product_name ?? row.purpose ?? '—', chips: [] };
  }
}

export function TxTableClient({ initialRows }: { initialRows: AdminTxRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<AdminTxRow[]>(initialRows);

  // router.refresh() hands back fresh rows after an action — keep in sync.
  useEffect(() => { setRows(initialRows); }, [initialRows]);
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
      accessorFn: (r) => r.seller?.name || r.seller?.username || `#${r.seller_id}`,
      header: 'Seller',
      cell: (info) => <span style={{ color: 'var(--adm-fg)' }}>{info.getValue() as string}</span>,
    },
    {
      id: 'purpose', accessorFn: (r) => formatPurpose(r).label, header: 'Purpose',
      cell: (info) => {
        const row = info.row.original;
        const { label, chips } = formatPurpose(row);
        const CHIP_COLORS: Record<string, string> = { featured: '#7c3aed', urgent: '#d97706', highlight: '#e11d48' };
        return (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[12.5px]" style={{ color: 'var(--adm-fg-muted)' }}>{label}</span>
            {chips.map((c) => (
              <span key={c} className="inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white"
                style={{ backgroundColor: CHIP_COLORS[c] ?? '#6b7280' }}>
                {c}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      id: 'gateway', header: 'Method',
      accessorFn: (r) => friendlyMethod(r.transaction_method, r.transaction_gatway),
      cell: (info) => <span className="text-[12.5px] font-medium" style={{ color: 'var(--adm-fg)' }}>{info.getValue() as string}</span>,
      size: 110,
    },
    {
      id: 'gateway_txn', header: 'Gateway TXN ID',
      accessorFn: (r) => r.gateway_transaction_id || r.gateway_transaction_number || '—',
      cell: (info) => {
        const v = info.getValue() as string;
        if (v === '—') {
          return <span style={{ color: 'var(--adm-fg-faint)' }}>—</span>;
        }
        return (
          <span className="flex max-w-[170px] items-center gap-1">
            <span title={v} className="min-w-0 flex-1 truncate font-mono text-[11px]" style={{ color: 'var(--adm-fg-muted)' }}>
              {v}
            </span>
            <button
              type="button"
              title="Copy transaction ID"
              aria-label={`Copy gateway transaction ID ${v}`}
              onClick={() => copyText(v)}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-md hover:bg-black/5"
              style={{ color: 'var(--adm-fg-muted)' }}
            >
              <Copy size={13} />
            </button>
          </span>
        );
      },
      size: 180,
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
