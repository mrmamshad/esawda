import { Badge } from '@/components/ui/Badge';
import { formatDate, formatMoney } from '@/lib/format';
import type { Order } from '@/types/api';

const tone = (s: string): 'success' | 'urgent' | 'muted' | 'featured' => {
  if (s === 'delivered') return 'success';
  if (s === 'pending')   return 'urgent';
  if (s === 'cancelled') return 'muted';
  return 'featured';
};

export function OrderRow({ order }: { order: Order }) {
  const status = order.shipping_status ?? 'pending';
  return (
    <div className="grid grid-cols-2 items-center gap-3 border-b border-line px-4 py-3 last:border-b-0 md:grid-cols-6">
      <div className="text-sm text-ink">{formatDate(order.created_at)}</div>
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-ink">{order.product?.product_name ?? `Product #${order.product_id}`}</div>
        {order.courier_name && (
          <div className="truncate text-xs text-ink-muted">
            {order.courier_name}{order.tracking_no ? ` · ${order.tracking_no}` : ''}
          </div>
        )}
      </div>
      <div className="truncate text-sm text-ink-muted">{order.buyer?.name ?? order.buyer?.username ?? `#${order.buyer_id}`}</div>
      <div className="text-sm font-semibold text-ink">{formatMoney(order.amount, '৳')}</div>
      <div><Badge tone={tone(status)}>{status}</Badge></div>
      <div className="text-right text-sm">
        {order.seller_paid ? (
          <span className="font-semibold text-green-700">Paid</span>
        ) : (
          <span className="text-ink-faint">Pending</span>
        )}
      </div>
    </div>
  );
}