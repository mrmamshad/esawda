import { FileText } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatMoney } from '@/lib/format';
import type { Transaction } from '@/types/api';

const tone = (s: string): 'success' | 'urgent' | 'muted' | 'featured' => {
  if (s === 'paid')     return 'success';
  if (s === 'pending')  return 'urgent';
  if (s === 'failed')   return 'muted';
  if (s === 'refunded') return 'muted';
  return 'featured';
};

export function InvoiceRow({ tx }: { tx: Transaction }) {
  return (
    <div className="grid grid-cols-2 items-center gap-3 border-b border-line px-4 py-3 last:border-b-0 md:grid-cols-6">
      <div className="text-sm text-ink">{formatDate(tx.created_at)}</div>
      <div className="text-sm font-medium text-ink">{tx.plan_name ?? 'Membership'}</div>
      <div className="text-sm font-semibold text-ink">{formatMoney(tx.amount, tx.currency)}</div>
      <div className="text-sm text-ink-muted capitalize">{tx.method ?? '—'}</div>
      <div><Badge tone={tone(tx.status)}>{tx.status}</Badge></div>
      <div className="text-right">
        {tx.invoice_url ? (
          <a
            href={tx.invoice_url}
            className="inline-flex items-center gap-1 text-sm text-brand-700 hover:text-brand-600"
          >
            <FileText size={14} /> PDF
          </a>
        ) : (
          <span className="text-xs text-ink-faint">—</span>
        )}
      </div>
    </div>
  );
}
