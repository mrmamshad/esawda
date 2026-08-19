import Link from 'next/link';
import type { Route } from 'next';
import { Rocket, Check, ArrowRight } from 'lucide-react';

/**
 * Marketing upsell panel for the seller dashboard — nudges active sellers
 * toward featured/urgent boosts and paid plans. A pure presentational card;
 * the CTA routes into the existing /shop/plan and /shop/ads flows.
 */
export function MarketingCard({ hasActivePlan }: { hasActivePlan?: boolean }) {
  const perks = [
    'Featured slot on the home rail',
    'Urgent badge for faster replies',
    'Highlighted card in search results',
  ];

  return (
    <section
      className="relative overflow-hidden rounded-xl border p-5"
      style={{
        background: 'linear-gradient(135deg, var(--shp-brand-soft) 0%, var(--shp-surface) 60%)',
        borderColor: 'var(--shp-brand-border, var(--shp-border))',
      }}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20" style={{ background: 'var(--shp-brand)' }} />

      <div className="relative">
        <span
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-white"
          style={{ background: 'var(--shp-brand)' }}
        >
          <Rocket size={12} /> Grow your sales
        </span>

        <h2 className="mt-3 text-[17px] font-bold leading-snug" style={{ color: 'var(--shp-fg)' }}>
          {hasActivePlan ? 'Stand out even more' : 'Boost listings to sell faster'}
        </h2>

        <ul className="mt-3 space-y-1.5">
          {perks.map((p) => (
            <li key={p} className="flex items-center gap-2 text-[12.5px]" style={{ color: 'var(--shp-fg-muted)' }}>
              <span className="grid h-4 w-4 place-items-center rounded-full text-white" style={{ background: 'var(--shp-brand)' }}>
                <Check size={11} strokeWidth={3} />
              </span>
              {p}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={'/shop/plan' as Route}
            className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12.5px] font-semibold text-white transition active:translate-y-[1px]"
            style={{ background: 'var(--shp-brand)' }}
          >
            {hasActivePlan ? 'Compare plans' : 'Choose a plan'} <ArrowRight size={13} />
          </Link>
          <Link
            href={'/shop/ads/new' as Route}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-[12.5px] font-semibold transition"
            style={{ borderColor: 'var(--shp-border)', color: 'var(--shp-fg)' }}
          >
            Boost a listing
          </Link>
        </div>
      </div>
    </section>
  );
}
