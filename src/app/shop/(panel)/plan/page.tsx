import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { CalendarDays, CheckCircle2, Crown, Layers3, ReceiptText, ShieldCheck, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/shop/v2/PageHeader';
import { requireUser } from '@/lib/session';
import { apiFromServer, ApiError } from '@/lib/api';
import type { Plan } from '@/types/api';
import { ShopPlansClient } from './ShopPlansClient';

export const metadata: Metadata = { title: 'Membership & Billing' };
export const dynamic = 'force-dynamic';

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch (error) { if (error instanceof ApiError) return fallback; throw error; }
}

type PlanSettings = { ads_limit?: number; featured_ads?: number; duration_days?: number };

function settingsOf(plan?: Plan): PlanSettings {
  return plan?.settings && typeof plan.settings === 'object' && !Array.isArray(plan.settings)
    ? plan.settings as PlanSettings
    : {};
}

function readableDate(value?: string | null): string {
  if (!value) return 'No renewal scheduled';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'No renewal scheduled'
    : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

export default async function SellerPlanPage() {
  const user = await requireUser('/shop/plan');
  const plansRes = await safe(() => apiFromServer<Plan[]>('/plans', { revalidate: 300 }), { data: [] as Plan[] });
  const plans = (plansRes.data ?? []).filter(plan => plan.active !== false);
  const currentPlan = plans.find(plan => String(plan.id) === String(user.plan_id));
  const settings = settingsOf(currentPlan);
  const remaining = Math.max(0, Number(user.ads_remaining ?? 0));
  const allowance = Math.max(remaining, Number(settings.ads_limit ?? 0));
  const usagePercent = allowance > 0 ? Math.min(100, Math.round((remaining / allowance) * 100)) : 0;
  const active = Boolean(user.plan_active);
  const trial = active && !currentPlan;
  const currentName = currentPlan?.name || (trial ? 'Free Trial' : (user.group_id ? String(user.group_id) : 'Starter'));

  return (
    <>
      <PageHeader
        title="Membership & Billing"
        description="Manage your shop tier, listing allowance and billing cycle from one workspace."
        actions={
          <Link
            href={'/shop/transactions' as Route}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-xs font-bold transition hover:bg-[color:var(--shp-bg)]"
            style={{ borderColor: 'var(--shp-border)', color: 'var(--shp-fg-muted)' }}
          >
            <ReceiptText size={15} /> Billing history
          </Link>
        }
      />

      <section
        className="relative overflow-hidden rounded-2xl p-6 text-white shadow-xl sm:p-8"
        style={{
          background: 'linear-gradient(135deg, #FF003F 0%, #E4254F 45%, #C41F42 100%)',
        }}
      >
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/15 opacity-60 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/3 h-28 w-28 rotate-45 border border-white/15" />

        <div className="relative grid gap-8 xl:grid-cols-[1.2fr_1fr] xl:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20"><Crown size={23} /></span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">Current membership</p>
                <div className="mt-1 flex items-center gap-2">
                  <h2 className="text-2xl font-black capitalize tracking-tight">{currentName}</h2>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${active ? 'bg-white/20 text-white' : 'bg-white/15 text-amber-200'}`}>
                    {active ? <CheckCircle2 size={12} /> : <Sparkles size={12} />}{active ? 'Active' : 'Starter access'}
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-5 max-w-xl text-sm leading-6 text-white/80">
              {active
                ? 'Your seller benefits are active. Upgrade whenever you need more inventory capacity or product visibility.'
                : 'Choose a paid tier to unlock more listings, featured placement and stronger buyer reach.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-white/10 p-4 ring-1 ring-white/15">
              <Layers3 size={17} className="text-white" />
              <p className="mt-3 text-2xl font-black">{remaining}</p>
              <p className="text-[11px] text-white/70">Listings remaining</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 ring-1 ring-white/15">
              <Sparkles size={17} className="text-white" />
              <p className="mt-3 text-2xl font-black">{settings.featured_ads ?? 0}</p>
              <p className="text-[11px] text-white/70">Featured boosts</p>
            </div>
            <div className="col-span-2 rounded-xl bg-white/10 p-4 ring-1 ring-white/15 sm:col-span-1">
              <CalendarDays size={17} className="text-white" />
              <p className="mt-3 text-sm font-bold">{readableDate(user.plan_expires_at)}</p>
              <p className="text-[11px] text-white/70">Renewal date</p>
            </div>
          </div>
        </div>

        {allowance > 0 && (
          <div className="relative mt-7 border-t border-white/15 pt-5">
            <div className="mb-2 flex items-center justify-between text-[11px] text-white/75">
              <span>Available listing allowance</span><span>{remaining} of {allowance} available</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-gradient-to-r from-white/90 to-white/60" style={{ width: `${usagePercent}%` }} /></div>
          </div>
        )}
      </section>

      <div className="mt-8">
        {plans.length > 0 ? (
          <ShopPlansClient plans={plans} currentPlanId={active ? user.plan_id ?? null : null} />
        ) : (
          <section className="rounded-2xl border border-dashed p-10 text-center" style={{ borderColor: 'var(--shp-border)' }}>
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[color:var(--shp-accent-soft)] text-[color:var(--shp-accent)]"><ShieldCheck size={22} /></span>
            <h2 className="mt-4 text-lg font-bold text-[color:var(--shp-fg)]">Plans are being prepared</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[color:var(--shp-fg-muted)]">Your current shop access is unchanged. New membership options will appear here when available.</p>
          </section>
        )}
      </div>
    </>
  );
}
