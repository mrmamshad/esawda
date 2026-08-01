'use client';

import { useState } from 'react';
import { PricingToggle, type Cadence } from './PricingToggle';
import { PlanCard } from './PlanCard';
import type { Plan } from '@/types/api';

export function PlansGrid({ plans }: { plans: Plan[] }) {
  const [cadence, setCadence] = useState<Cadence>('monthly');
  const recIdx = plans.findIndex((p) => p.recommended);

  return (
    <>
      <div className="flex justify-center">
        <PricingToggle value={cadence} onChange={setCadence} savingsLabel="Save 20%" />
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((p, i) => (
          <PlanCard key={p.id} plan={p} cadence={cadence} featured={recIdx === -1 ? i === 1 : i === recIdx} />
        ))}
      </div>
    </>
  );
}
