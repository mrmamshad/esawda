import Link from 'next/link';
import type { Route } from 'next';
import { ArrowRight, Crown, LockKeyhole, Sparkles } from 'lucide-react';

/**
 * Upsell panel shown in place of the ad form when the seller has no active
 * plan (or has exhausted their listing quota). Extracted from AdForm.tsx.
 */
export function SubscriptionGate({
  hasActivePlan,
  adsRemaining,
  planName,
  planExpiresAt,
  subscribeHref = '/membership',
}: {
  hasActivePlan: boolean;
  adsRemaining: number;
  planName: string;
  planExpiresAt: string | null;
  /** Where "Subscribe now" sends the seller (shop panel → /shop/plan) */
  subscribeHref?: string;
}) {
  const quotaExhausted = hasActivePlan && adsRemaining <= 0;
  const expiryLabel = planExpiresAt
    ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(planExpiresAt))
    : null;

  return (
    <section className="relative mt-6 overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-[0_18px_50px_-28px_rgba(255,0,63,0.45)]">
      <div aria-hidden className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-brand-100 blur-3xl" />
      <div aria-hidden className="absolute bottom-0 right-1/3 h-20 w-40 rounded-full bg-amber-100/70 blur-3xl" />

      <div className="relative grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
        <div className="flex items-start gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-700 text-white shadow-lg shadow-brand-700/20">
            <LockKeyhole size={25} />
          </span>
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-700">
                <Crown size={12} /> Subscription required
              </span>
              {quotaExhausted && (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-800">
                  Listing limit reached
                </span>
              )}
            </div>
            <h2 className="max-w-2xl text-xl font-bold tracking-tight text-ink md:text-2xl">
              {quotaExhausted
                ? 'Your current package has run out of product listings.'
                : 'Subscribe first — then you can post products.'}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">
              {quotaExhausted
                ? 'Renew or upgrade your package to keep posting more products.'
                : 'Choose a seller package and the form below unlocks so you can create your product listing right away.'}
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-lg border border-line bg-surface-muted px-3 py-2 text-ink-muted">
                Current plan: <strong className="capitalize text-ink">{hasActivePlan ? planName : 'No active plan'}</strong>
              </span>
              <span className="rounded-lg border border-line bg-surface-muted px-3 py-2 text-ink-muted">
                Listings remaining: <strong className="text-ink">{adsRemaining}</strong>
              </span>
              {expiryLabel && (
                <span className="rounded-lg border border-line bg-surface-muted px-3 py-2 text-ink-muted">
                  Expires: <strong className="text-ink">{expiryLabel}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex min-w-[210px] flex-col gap-2 md:items-stretch">
          <Link
            href={subscribeHref as Route}
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-700 px-6 text-sm font-bold text-white shadow-lg shadow-brand-700/20 transition hover:-translate-y-0.5 hover:bg-brand-600"
          >
            <Sparkles size={16} />
            {quotaExhausted ? 'Upgrade package' : 'Subscribe now'}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="text-center text-[11px] text-ink-faint">Secure payment via online payment</p>
        </div>
      </div>
    </section>
  );
}
