import Link from 'next/link';
import type { Route } from 'next';
import { Store } from 'lucide-react';

export type ShopOrderSummaryRow = {
  seller_id: number;
  shop_name: string | null;
  username: string | null;
  orders: number;
  total_amount: number;
  pending_count: number;
  confirmed_count: number;
  delivered_count: number;
  cancelled_count: number;
};

const money = (n: number) =>
  `৳${new Intl.NumberFormat('en-IN').format(Math.round(n))}`;

/**
 * Per-shop rollup on the admin Orders page: how many orders each shop
 * received and their total value. Hidden entirely when there are none.
 */
export function ShopOrdersSummary({ rows }: { rows: ShopOrderSummaryRow[] }) {
  if (rows.length === 0) return null;

  return (
    <section className="mb-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((r) => (
          <article
            key={r.seller_id}
            className="rounded-xl border p-4"
            style={{ background: 'var(--adm-surface)', borderColor: 'var(--adm-border)', boxShadow: 'var(--adm-shadow-sm)' }}
          >
            <div className="flex items-center gap-2">
              <span
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                style={{ background: 'var(--adm-brand-soft)', color: 'var(--adm-brand)' }}
              >
                <Store size={15} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold" style={{ color: 'var(--adm-fg)' }}>
                  {r.username ? (
                    <Link href={`/store/${r.username}` as Route} className="rounded hover:underline">{r.shop_name || `@${r.username}`}</Link>
                  ) : (
                    r.shop_name || `Shop #${r.seller_id}`
                  )}
                </p>
                <p className="text-[11px]" style={{ color: 'var(--adm-fg-faint)' }}>
                  {r.orders} order{r.orders === 1 ? '' : 's'} · {money(r.total_amount)}
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-1.5 text-center">
              {[
                ['Pending', r.pending_count, '#854F0B', '#FAEEDA'],
                ['Confirmed', r.confirmed_count, '#0C447C', '#E6F1FB'],
                ['Delivered', r.delivered_count, '#085041', '#E1F5EE'],
                ['Cancelled', r.cancelled_count, '#712B13', '#FAECE7'],
              ].map(([label, count, ink, bg]) => (
                <span key={label as string} className="rounded-lg px-1 py-1.5" style={{ background: bg as string }}>
                  <span className="block text-[13px] font-bold leading-none" style={{ color: ink as string }}>{count as number}</span>
                  <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-wide" style={{ color: ink as string }}>{label as string}</span>
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
