'use client';

import { useMemo, useState } from 'react';
import { PricingToggle, type Cadence } from '@/components/membership/PricingToggle';
import { PlanCard } from '@/components/membership/PlanCard';
import { maxPlanSaving } from '@/lib/planFeatures';
import type { Plan } from '@/types/api';

/**
 * Homepage seller-tier section: Monthly/Yearly toggle (dynamic saving
 * badge) + plan cards. No default highlight — cards stay normal until
 * hovered, unless the admin marked a plan `recommended`.
 */
export function HomePlansSection({ plans }: { plans: Plan[] }) {
  const [cadence, setCadence] = useState<Cadence>('monthly');
  const highestSaving = useMemo(() => maxPlanSaving(plans), [plans]);

  return (
    <>
      <div className="mt-8 flex justify-center">
        <PricingToggle
          value={cadence}
          onChange={setCadence}
          savingsLabel={highestSaving > 0 ? `Save up to ${highestSaving}%` : undefined}
        />
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((p) => (
          <PlanCard key={p.id} plan={p} cadence={cadence} featured={p.recommended} />
        ))}
      </div>
    </>
  );
}
