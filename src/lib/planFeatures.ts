import type { Plan } from '@/types/api';

export type PlanFeatureSettings = {
  ads_limit?: number;
  featured_ads?: number;
  duration_days?: number;
  features?: unknown;
};

/** settings JSON (decoded object) or empty when absent/malformed. */
export function planFeatureSettings(plan: Plan): PlanFeatureSettings {
  const s = plan.settings;
  return s && typeof s === 'object' && !Array.isArray(s)
    ? (s as PlanFeatureSettings)
    : {};
}

/**
 * Single source of truth for plan offer bullets everywhere (homepage,
 * /membership, /shop/plan). Admin-written `settings.features` wins;
 * otherwise derive from the numeric limits; last resort is generic copy.
 */
export function planFeatures(plan: Plan): string[] {
  const settings = planFeatureSettings(plan);
  if (Array.isArray(settings.features)) {
    const custom = settings.features
      .map(String)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 20);
    if (custom.length > 0) return custom;
  }
  return [
    settings.ads_limit ? `${settings.ads_limit} product listings` : 'Flexible product listings',
    settings.featured_ads ? `${settings.featured_ads} featured product boosts` : 'Standard marketplace visibility',
    settings.duration_days ? `${settings.duration_days}-day listing duration` : 'Long-running product visibility',
    'Buyer messaging and sales dashboard',
    'Shop performance insights',
  ];
}

/** Yearly-vs-monthly saving percent for one plan (0 when not comparable). */
export function planSavingPercent(plan: { monthly_price: number; annual_price: number }): number {
  if (plan.monthly_price <= 0 || plan.annual_price <= 0) return 0;
  const fullYear = plan.monthly_price * 12;
  return Math.max(0, Math.round(((fullYear - plan.annual_price) / fullYear) * 100));
}

/** Highest saving across plans — drives the "Save up to X%" badge. */
export function maxPlanSaving(plans: Array<{ monthly_price: number; annual_price: number }>): number {
  return Math.max(0, ...plans.map(planSavingPercent));
}
