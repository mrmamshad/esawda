'use client';

import { useMemo, useState } from 'react';
import { ArrowUpRight, Check, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useAuthGate } from '@/components/interactive/AuthGate';
import { PaymentConsent, type PaymentConsentFormData } from '@/components/checkout/PaymentConsent';
import { api, ApiError } from '@/lib/api';
import { readToken } from '@/lib/auth';
import { generateIdempotencyKey } from '@/lib/idempotency';
import { isSafePaymentRedirect } from '@/lib/paymentRedirect';
import { formatMoney } from '@/lib/format';
import { planFeatures as featuresOf } from '@/lib/planFeatures';
import type { Plan } from '@/types/api';

type Cadence = 'monthly' | 'annual';

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
  const { user } = useAuthGate();
  const [cadence, setCadence] = useState<Cadence>('monthly');
  const [processingPlanId, setProcessingPlanId] = useState<number | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [showConsent, setShowConsent] = useState<number | null>(null);
  // Hovered card borrows the featured (red-border) look so every plan
  // gets the Starter-style highlight on hover.
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const highestSaving = useMemo(() => Math.max(0, ...plans.map(savingFor)), [plans]);

  const startCheckout = async (consent: PaymentConsentFormData, planId: number, billingCadence: Cadence) => {
    setProcessingPlanId(planId);
    setCheckoutError(null);
    try {
      const idempotencyKey = generateIdempotencyKey(user?.id);
      const { data } = await api<{ transaction_id: number; gateway_url: string }>(
        `/checkout/plan/${planId}`,
        {
          method: 'POST',
          token: readToken(),
          body: {
            cadence: billingCadence,
            policies_accepted: true,
            payment_phone: consent.paymentPhone,
          },
          idempotencyKey,
        },
      );
      const url = data.gateway_url;
      if (!isSafePaymentRedirect(url)) {
        throw new Error('Unsafe payment redirect blocked.');
      }
      window.location.assign(url);
    } catch (error) {
      setCheckoutError(error instanceof ApiError ? error.message : 'Could not open secure payment. Please try again.');
      setProcessingPlanId(null);
    }
  };

  /** Zero-price plans (Early Bird) activate instantly — no payment step. */
  const activateFree = async (planId: number) => {
    setProcessingPlanId(planId);
    setCheckoutError(null);
    try {
      const { data } = await api<{ free_activation?: boolean }>(`/checkout/plan/${planId}`, {
        method: 'POST',
        token: readToken(),
        body: { policies_accepted: true },
      });
      if (data.free_activation) {
        window.location.assign('/shop?activated=early-bird');
        return;
      }
      // Server disagreed — treat as normal (shouldn't happen).
      setCheckoutError('This plan must be purchased through secure checkout.');
      setProcessingPlanId(null);
    } catch (error) {
      setCheckoutError(error instanceof ApiError ? error.message : 'Could not activate this plan. Please try again.');
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
        <ShieldCheck size={14} className="text-emerald-600" /> Secure checkout opens after consent. Your plan activates automatically after payment.
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {plans.map((plan) => {
          const featured = plan.recommended;
          const highlighted = featured || hoveredId === plan.id;
          const current = currentPlanId !== null && String(plan.id) === String(currentPlanId);
          const effectiveCadence: Cadence = cadence === 'annual' && plan.annual_price > 0 ? 'annual' : 'monthly';
          const price = effectiveCadence === 'annual' ? plan.annual_price : plan.monthly_price;
          const saving = savingFor(plan);
          const isFree = plan.is_free === true || price <= 0;

          return (
            <article
              key={plan.id}
              onMouseEnter={() => setHoveredId(plan.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`relative flex min-h-[420px] flex-col overflow-hidden rounded-2xl border p-6 transition duration-200 hover:-translate-y-1 hover:shadow-xl ${
                highlighted ? 'shadow-lg' : 'bg-[color:var(--shp-surface)]'
              }`}
              style={{
                borderColor: highlighted ? 'var(--shp-accent)' : 'var(--shp-border)',
                background: highlighted ? 'linear-gradient(155deg, var(--shp-surface) 55%, var(--shp-accent-soft))' : undefined,
              }}
            >
              {highlighted && <div className="absolute inset-x-0 top-0 h-1 bg-[color:var(--shp-accent)]" />}

              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-[color:var(--shp-fg)]">{plan.name}</h3>
                    {highlighted && <Sparkles size={16} className="text-[color:var(--shp-accent)]" />}
                  </div>
                  <p className="mt-1 min-h-5 text-xs font-medium text-[color:var(--shp-fg-muted)]">{plan.badge || 'Built for growing online shops'}</p>
                </div>
                {current && <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Current</span>}
              </div>

              <div className="mt-6 flex items-end gap-2">
                <span className="text-4xl font-black tracking-tight text-[color:var(--shp-fg)]">{price > 0 ? formatMoney(price) : 'Free'}</span>
                {price > 0 && <span className="pb-1 text-xs text-[color:var(--shp-fg-muted)]">/{effectiveCadence === 'annual' ? 'year' : 'month'}</span>}
              </div>
              {isFree && (
                <p className="mt-2 text-xs font-semibold text-emerald-700">Limited launch offer — activates instantly, no payment needed.</p>
              )}
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
                ) : isFree ? (
                  <button
                    type="button"
                    onClick={() => void activateFree(plan.id)}
                    disabled={processingPlanId !== null}
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition disabled:cursor-wait disabled:opacity-70"
                    style={{ background: 'var(--shp-accent)', color: 'var(--shp-accent-fg, #fff)' }}
                  >
                    <Zap size={16} />
                    {processingPlanId === plan.id ? 'Activating…' : 'Activate Early Bird'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowConsent(plan.id)}
                    disabled={processingPlanId !== null || showConsent !== null}
                    className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition disabled:cursor-wait disabled:opacity-70 ${
                      highlighted
                        ? 'bg-[color:var(--shp-accent)] text-white hover:brightness-110'
                        : 'border text-[color:var(--shp-fg)] hover:bg-[color:var(--shp-bg)]'
                    }`}
                    style={highlighted ? undefined : { borderColor: 'var(--shp-border)' }}
                  >
                    <Zap size={16} />
                    {processingPlanId === plan.id ? 'Opening secure payment…' : `Subscribe to ${plan.name}`}
                    {processingPlanId !== plan.id && <ArrowUpRight size={15} />}
                  </button>
                )}
                {showConsent === plan.id && (
                  <div className="mt-4 border-t border-[color:var(--shp-border)] pt-4">
                    <PaymentConsent
                      onConsent={(consent) => {
                        setShowConsent(null);
                        void startCheckout(consent, plan.id, effectiveCadence);
                      }}
                      compact
                      initialPhone={user?.phone ?? ''}
                      className="text-sm"
                    />
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
