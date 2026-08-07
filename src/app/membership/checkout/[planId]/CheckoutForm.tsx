'use client';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { api, ApiError } from '@/lib/api';
import { readToken } from '@/lib/auth';

/**
 * Real SSLCommerz checkout. Hits POST /api/v1/checkout/plan/{planId}
 * which persists a Transaction row and returns a hosted-page URL.
 * We then hard-redirect the browser to that URL.
 *
 * SSLCommerz is the sole active gateway (see PaymentManager).
 */
export function CheckoutForm({ planId, cadence }: { planId: number; cadence: string }) {
  const [busy, setBusy] = useState(false);
  const { notify } = useToast();

  const submit = async () => {
    setBusy(true);
    try {
      const { data } = await api<{ transaction_id: number; gateway_url: string }>(
        `/checkout/plan/${planId}`,
        { method: 'POST', token: readToken(), body: { cadence } },
      );
      if (!data.gateway_url) {
        notify('danger', 'Could not start SSLCommerz session. Please try again.');
        setBusy(false);
        return;
      }
      // Open redirect guard: only allow same-origin relative URLs or known
      // payment-gateway hosts. A backend that returns a hostile location
      // must not be able to bounce the buyer to an attacker site.
      const url = data.gateway_url;
      const allowed = (u: string) => {
        if (u.startsWith('/')) return true;
        try {
          const h = new URL(u).hostname;
          return /(^|\.)(sslcommerz\.com|esawda\.com|eshauda\.com)$/i.test(h);
        } catch { return false; }
      };
      if (!allowed(url)) {
        notify('danger', 'Payment gateway returned an unsafe redirect URL.');
        setBusy(false);
        return;
      }
      window.location.href = url;
    } catch (e) {
      notify('danger', e instanceof ApiError ? e.message : 'Payment failed to start.');
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="surface-card flex items-start gap-3 p-4 ring-2 ring-brand-700">
        <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-field bg-brand-700 text-white">
          <ShieldCheck size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">SSLCommerz</p>
          <p className="text-xs text-ink-muted">
            Pay securely with Visa, MasterCard, bKash, Nagad, Rocket, or Bangladeshi net-banking.
            You'll be redirected to SSLCommerz's hosted checkout page.
          </p>
        </div>
      </div>

      <Button fullWidth variant="filled" size="lg" onClick={submit} disabled={busy}>
        {busy ? 'Redirecting to SSLCommerz…' : 'Pay with SSLCommerz'}
      </Button>
      <p className="text-center text-xs text-ink-faint">🔒 Secure checkout · SSL encrypted</p>
    </div>
  );
}
