'use client';

import { useMemo, useState } from 'react';
import { useAuthGate } from '@/components/interactive/AuthGate';
import { PaymentConsent, type PaymentConsentFormData } from '@/components/checkout/PaymentConsent';
import { api, ApiError } from '@/lib/api';
import { readToken } from '@/lib/auth';
import { generateIdempotencyKey } from '@/lib/idempotency';
import { Button } from '@/components/ui/Button';
import type { AdDetail } from '@/types/api';

const OPTIONS: { key: 'featured' | 'urgent' | 'highlight'; label: string; description: string; price: number }[] = [
  { key: 'featured',  label: 'Featured',  description: 'Shown in the featured carousel + homepage.',   price: 200 },
  { key: 'urgent',    label: 'Urgent',    description: 'Red URGENT badge + sorted higher in search.',   price: 150 },
  { key: 'highlight', label: 'Highlight', description: 'Yellow highlight background in search results.', price: 100 },
];

export function BoostForm({ ad }: { ad: AdDetail }) {
  const { user } = useAuthGate();
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [busy,  setBusy]    = useState(false);
  const [err,   setErr]     = useState<string | null>(null);
  const [showConsent, setShowConsent] = useState(false);

  const total = useMemo(
    () => OPTIONS.filter((o) => picked[o.key]).reduce((sum, o) => sum + o.price, 0),
    [picked],
  );

  const submit = async (consent: PaymentConsentFormData) => {
    setBusy(true); setErr(null);
    try {
      const idempotencyKey = generateIdempotencyKey(user?.id);
      const { data } = await api<{ transaction_id: number; gateway_url: string }>(
        `/checkout/ad-upgrade/${ad.id}`,
        {
          method: 'POST',
          token: readToken(),
          body: {
            ...picked,
            policies_accepted: true,
            payment_phone: consent.paymentPhone,
          },
          idempotencyKey,
        },
      );
      const url = data.gateway_url;
      const allowed = (u: string) => {
        if (u.startsWith('/')) return true;
        try {
          const h = new URL(u).hostname;
          return /(^|\.)(dgepay\.net|sslcommerz\.com|esawda\.com|eshauda\.com)$/i.test(h) && new URL(u).protocol === 'https:';
        } catch { return false; }
      };
      if (!allowed(url)) {
        throw new Error('Unsafe payment redirect blocked.');
      }
      window.location.href = url;
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Could not start payment.');
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <div className="space-y-3">
        {OPTIONS.map((o) => {
          const active = !!picked[o.key];
          return (
            <label
              key={o.key}
              className={`surface-card flex cursor-pointer items-start gap-3 p-4 transition ${active ? 'ring-2 ring-brand-700' : 'ring-1 ring-line hover:ring-brand-500'}`}
            >
              <input
                type="checkbox" checked={active}
                onChange={() => setPicked((p) => ({ ...p, [o.key]: !p[o.key] }))}
                className="mt-1 h-4 w-4 accent-brand-700"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">{o.label}</p>
                <p className="text-xs text-ink-muted">{o.description}</p>
              </div>
              <span className="text-sm font-bold text-brand-700">৳{o.price}</span>
            </label>
          );
        })}
      </div>

      <aside className="surface-card h-fit space-y-3 p-5">
        <h3 className="text-sm font-semibold text-ink">Order summary</h3>
        <div className="text-xs text-ink-muted">Product: {ad.title}</div>
        <div className="flex justify-between border-t border-line pt-3 text-sm">
          <span className="text-ink-muted">Total</span>
          <span className="text-lg font-bold text-ink">৳{total}</span>
        </div>
        {err && <p className="text-xs text-rose-700">{err}</p>}

        {!showConsent ? (
          <Button fullWidth variant="filled" onClick={() => setShowConsent(true)} disabled={busy || total === 0}>
            {busy ? 'Processing…' : 'Proceed to Payment'}
          </Button>
        ) : (
          <PaymentConsent
            onConsent={(consent) => {
              setShowConsent(false);
              void submit(consent);
            }}
            compact
            initialPhone={user?.phone ?? ''}
          />
        )}
        <p className="text-center text-xs text-ink-faint">🔒 Secure checkout.</p>
      </aside>
    </div>
  );
}
