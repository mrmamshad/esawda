import Link from 'next/link';
import type { Route } from 'next';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatMoney } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { Plan } from '@/types/api';
import type { Cadence } from './PricingToggle';

/**
 * Membership tier card. Featured variant adds brand-700 ring + Most-popular
 * badge and switches the CTA to filled.
 */
export function PlanCard({
  plan,
  cadence,
  currency = 'BDT',
  featured,
  features,
  className,
}: {
  plan: Plan;
  cadence: Cadence;
  currency?: string;
  featured?: boolean;
  features?: string[];
  className?: string;
}) {
  const price = cadence === 'annual' ? plan.annual_price : plan.monthly_price;
  const priceLabel = price > 0 ? formatMoney(price, currency) : 'Free';
  const per = price > 0 ? (cadence === 'annual' ? '/year' : '/month') : '';

  const ring = featured ? 'ring-2 ring-brand-700' : 'ring-1 ring-line';
  const list = features && features.length ? features : deriveFeatures(plan);

  return (
    <div className={cn('surface-card relative flex flex-col p-8', ring, className)}>
      {featured && (
        <Badge tone="featured" className="absolute -top-3 left-1/2 -translate-x-1/2">
          Most popular
        </Badge>
      )}

      <h3 className="text-lg font-semibold text-ink">{plan.name}</h3>
      {plan.badge && <p className="mt-1 text-xs uppercase tracking-wide text-brand-500">{plan.badge}</p>}

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-5xl font-bold text-ink">{priceLabel}</span>
        {per && <span className="text-sm text-ink-muted">{per}</span>}
      </div>

      <ul className="mt-6 space-y-2.5">
        {list.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-ink">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <Check size={12} />
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <Link href={`/membership/checkout/${plan.id}?cadence=${cadence}` as Route} className="contents">
          <Button variant={featured ? 'filled' : 'outline'} size="lg" fullWidth>
            {price > 0 ? 'Subscribe' : 'Get Started'}
          </Button>
        </Link>
      </div>
    </div>
  );
}

function deriveFeatures(plan: Plan): string[] {
  // Fallback bullet copy when the backend didn't provide a features list.
  return [
    `${plan.name} tier access`,
    plan.recommended ? 'Featured badge on your products' : 'Standard product listings',
    'Direct chat with buyers',
    'Analytics & insights',
  ];
}
