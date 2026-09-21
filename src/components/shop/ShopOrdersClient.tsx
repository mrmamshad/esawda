'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { api, ApiError } from '@/lib/api';
import { readToken } from '@/lib/auth';
import { formatDate, formatMoney } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { Order } from '@/types/api';

const STATUSES = ['pending', 'confirmed', 'delivered', 'cancelled'] as const;
type Status = (typeof STATUSES)[number];

const badgeTone: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-rose-100 text-rose-700',
};

/** Seller order list: buyer contact + inline status management. */
export function ShopOrdersClient({ orders }: { orders: Order[] }) {
  const { notify } = useToast();
  const [status, setStatus] = useState<Record<number, Status>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  const current = (o: Order) => (status[o.id] ?? o.shipping_status) as Status;

  const change = async (order: Order, next: Status) => {
    if (next === current(order)) return;
    setStatus((s) => ({ ...s, [order.id]: next }));
    setSavingId(order.id);
    try {
      await api(`/me/orders/${order.id}/status`, {
        method: 'PATCH', token: readToken(), body: { shipping_status: next },
      });
      notify('success', `Order #${order.id} → ${next}.`);
    } catch (e) {
      setStatus((s) => ({ ...s, [order.id]: order.shipping_status as Status }));
      notify('danger', e instanceof ApiError ? e.message : 'Could not update the order.');
    } finally {
      setSavingId(null);
    }
  };

  const copyContact = async (o: Order) => {
    const text = `${o.buyer_name ?? ''} · ${o.buyer_phone ?? ''} · ${o.buyer_address ?? ''}`.trim();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(o.id);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <section className="surface-card overflow-hidden">
      <div className="hidden grid-cols-[110px_minmax(0,1.2fr)_minmax(0,1.4fr)_100px_minmax(0,150px)] gap-3 border-b border-line px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-muted lg:grid">
        <div>Date</div><div>Buyer</div><div>Product &amp; address</div><div>Amount</div><div>Status</div>
      </div>
      <ul className="divide-y divide-[color:var(--shp-border)]">
        {orders.map((o) => (
          <li key={o.id} className="grid gap-3 px-4 py-4 lg:grid-cols-[110px_minmax(0,1.2fr)_minmax(0,1.4fr)_100px_minmax(0,150px)] lg:items-start">
            <div className="text-xs text-ink-muted">{formatDate(o.created_at)}</div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">
                {o.buyer_name || o.buyer?.name || o.buyer?.username || `Buyer #${o.buyer_id ?? '—'}`}
              </p>
              {o.buyer_phone && <p className="truncate font-mono text-xs text-ink-muted">{o.buyer_phone}</p>}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">
                {o.product?.product_name ?? `Product #${o.product_id}`}
              </p>
              {o.buyer_address && <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-ink-muted">{o.buyer_address}</p>}
              {(o.buyer_phone || o.buyer_address) && (
                <button
                  type="button"
                  onClick={() => void copyContact(o)}
                  className="mt-1.5 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold text-ink-muted transition hover:text-ink"
                  style={{ borderColor: 'var(--shp-border)' }}
                >
                  {copied === o.id ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                  {copied === o.id ? 'Copied' : 'Copy contact'}
                </button>
              )}
            </div>

            <div className="text-sm font-semibold text-ink">{formatMoney(o.amount, '৳')}</div>

            <div>
              <span className={cn('mb-1.5 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide', badgeTone[current(o)] ?? 'bg-gray-100 text-gray-700')}>
                {current(o)}
              </span>
              <select
                aria-label={`Change status for order ${o.id}`}
                value={current(o)}
                disabled={savingId === o.id}
                onChange={(e) => void change(o, e.target.value as Status)}
                className="h-9 w-full rounded-lg border bg-white px-2 text-[12.5px] font-medium outline-none focus:ring-2 disabled:opacity-60"
                style={{ borderColor: 'var(--shp-border)', color: 'var(--shp-fg)' }}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
