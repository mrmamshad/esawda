'use client';

import { useMemo, useState } from 'react';
import { ArrowUpRight, Check, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { readToken } from '@/lib/auth';
import { formatMoney } from '@/lib/format';
import type { Plan } from '@/types/api';

type Cadence = 'monthly' | 'annual';
type PlanSettings = { ads_limit?: number; featured_ads?: number; duration_days?: number };

function settingsOf(plan: Plan): PlanSettings {
  return plan.settings && typeof plan.settings === 'object' && !Array.isArray(plan.settings)
    ? plan.settings as PlanSettings
    : {};
}

function featuresOf(plan: Plan): string[] {
  const settings = settingsOf(plan);
  return [
    settings.ads_limit ? `${settings.ads_limit} product listings` : 'Flexible product listings',
    settings.featured_ads ? `${settings.featured_ads} featured product boosts` : 'Standard marketplace visibility',
    settings.duration_days ? `${settings.duration_days}-day listing duration` : 'Long-running product visibility',
    'Buyer messaging and sales dashboard',
    'Shop performance insights',
  ];
}

function savingFor(plan: Plan): number {
  if (plan.monthly_price <= 0 || plan.annual_price <= 0) return 0;
  const fullYear = plan.monthly_price * 12;
  return Math.max(0, Math.round(((fullYear - plan.annual_price) / fullYear) * 100));
}

export function ShopPlansClient({
  plans,
  currentPlanId,
}: {
  plans: Plan[];
  currentPlanId: string | number | null;
}) {
  const [cadence, setCadence] = useState<Cadence>('monthly');
  const [processingPlanId, setProcessingPlanId] = useState<number | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const highestSaving = useMemo(() => Math.max(0, ...plans.map(savingFor)), [plans]);

  const startCheckout = async (planId: number, billingCadence: Cadence) => {
    setProcessingPlanId(planId);
    setCheckoutError(null);
    try {
      const { data } = await api<{ transaction_id: number; gateway_url: string }>(
        `/checkout/plan/${planId}`,
        { method: 'POST', token: readToken(), body: { cadence: billingCadence } },
      );
      const url = data.gateway_url;
      const hostname = new URL(url).hostname;
      if (!/(^|\.)(sslcommerz\.com)$/i.test(hostname)) {
        throw new Error('Unsafe payment redirect blocked.');
      }
      window.location.assign(url);
    } catch (error) {
      setCheckoutError(error instanceof ApiError ? error.message : 'Could not open secure payment. Please try again.');
      setProcessingPlanId(null);
    }
  };

  return (
    <section aria-labelledby="available-plans">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--shp-accent)]">Upgrade options</p>
          <h2 id="available-plans" className="mt-1 text-xl font-bold text-[color:var(--shp-fg)]">Choose how your shop grows</h2>
          <p className="mt-1 text-sm text-[color:var(--shp-fg-muted)]">Switch plans whenever your inventory or sales volume changes.</p>
        </div>

        <div className="inline-flex w-fit rounded-xl border bg-[color:var(--shp-surface)] p-1" style={{ borderColor: 'var(--shp-border)' }}>
          {(['monthly', 'annual'] as const).map(option => (
            <button
              key={option}
              type="button"
              onClick={() => setCadence(option)}
              aria-pressed={cadence === option}
              className={`min-h-10 rounded-lg px-4 text-xs font-bold transition ${
                cadence === option
                  ? 'bg-[color:var(--shp-fg)] text-[color:var(--shp-surface)] shadow-sm'
                  : 'text-[color:var(--shp-fg-muted)] hover:text-[color:var(--shp-fg)]'
              }`}
            >
              {option === 'monthly' ? 'Monthly' : 'Yearly'}
              {option === 'annual' && highestSaving > 0 && (
                <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700">Save up to {highestSaving}%</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {checkoutError && (
        <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {checkoutError}
        </div>
      )}
      <p className="mt-4 flex items-center gap-2 text-xs text-[color:var(--shp-fg-muted)]">
        <ShieldCheck size={14} className="text-emerald-600" /> One click opens SSLCommerz secure checkout. Your plan activates automatically after payment.
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {plans.map((plan, index) => {
          const featured = plan.recommended || (plans.every(item => !item.recommended) && index === 1);
          const current = currentPlanId !== null && String(plan.id) === String(currentPlanId);
          const effectiveCadence: Cadence = cadence === 'annual' && plan.annual_price > 0 ? 'annual' : 'monthly';
          const price = effectiveCadence === 'annual' ? plan.annual_price : plan.monthly_price;
          const saving = savingFor(plan);

          return (
            <article
              key={plan.id}
              className={`relative flex min-h-[420px] flex-col overflow-hidden rounded-2xl border p-6 transition duration-200 hover:-translate-y-1 hover:shadow-xl ${
                featured ? 'shadow-lg' : 'bg-[color:var(--shp-surface)]'
              }`}
              style={{
                borderColor: featured ? 'var(--shp-accent)' : 'var(--shp-border)',
                background: featured ? 'linear-gradient(155deg, var(--shp-surface) 55%, var(--shp-accent-soft))' : undefined,
              }}
            >
              {featured && <div className="absolute inset-x-0 top-0 h-1 bg-[color:var(--shp-accent)]" />}

              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-[color:var(--shp-fg)]">{plan.name}</h3>
                    {featured && <Sparkles size={16} className="text-[color:var(--shp-accent)]" />}
                  </div>
                  <p className="mt-1 min-h-5 text-xs font-medium text-[color:var(--shp-fg-muted)]">{plan.badge || 'Built for growing online shops'}</p>
                </div>
                {current && <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Current</span>}
              </div>

              <div className="mt-6 flex items-end gap-2">
                <span className="text-4xl font-black tracking-tight text-[color:var(--shp-fg)]">{price > 0 ? formatMoney(price) : 'Free'}</span>
                {price > 0 && <span className="pb-1 text-xs text-[color:var(--shp-fg-muted)]">/{effectiveCadence === 'annual' ? 'year' : 'month'}</span>}
              </div>
              {effectiveCadence === 'annual' && saving > 0 && (
                <p className="mt-2 text-xs font-semibold text-emerald-700">You save {saving}% compared with monthly billing</p>
              )}

              <div className="my-6 h-px bg-[color:var(--shp-border)]" />
              <ul className="space-y-3">
                {featuresOf(plan).map(feature => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-[color:var(--shp-fg)]">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[color:var(--shp-accent-soft)] text-[color:var(--shp-accent)]"><Check size={12} strokeWidth={3} /></span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-7">
                {current ? (
                  <div className="flex min-h-11 items-center justify-center gap-2 rounded-xl border text-sm font-bold text-emerald-700" style={{ borderColor: 'var(--shp-border)' }}>
                    <ShieldCheck size={16} /> Active membership
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => startCheckout(plan.id, effectiveCadence)}
                    disabled={processingPlanId !== null}
                    className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition disabled:cursor-wait disabled:opacity-70 ${
                      featured
                        ? 'bg-[color:var(--shp-accent)] text-white hover:brightness-110'
                        : 'border text-[color:var(--shp-fg)] hover:bg-[color:var(--shp-bg)]'
                    }`}
                    style={featured ? undefined : { borderColor: 'var(--shp-border)' }}
                  >
                    <Zap size={16} />
                    {processingPlanId === plan.id ? 'Opening secure payment…' : `Subscribe to ${plan.name}`}
                    {processingPlanId !== plan.id && <ArrowUpRight size={15} />}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
