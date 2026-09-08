'use client';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useAuthGate } from '@/components/interactive/AuthGate';
import { PaymentConsent, type PaymentConsentFormData } from '@/components/checkout/PaymentConsent';
import { api, ApiError } from '@/lib/api';
import { readToken } from '@/lib/auth';
import { generateIdempotencyKey } from '@/lib/idempotency';
import { isSafePaymentRedirect } from '@/lib/paymentRedirect';

/**
 * DGePay/secure checkout for membership plans. Hits POST /api/v1/checkout/plan/{planId}
 * with policies_accepted=true and payment_phone, persists a Transaction row,
 * returns a hosted-page URL. Hard-redirects the browser to that URL.
 *
 * Includes PaymentConsent component for Terms & Refund Policy acceptance
 * plus Bangladesh payment phone verification.
 */
export function CheckoutForm({ planId, cadence }: { planId: number; cadence: string }) {
  const { user } = useAuthGate();
  const [busy, setBusy] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const { notify } = useToast();

  const handleConsent = async (consent: PaymentConsentFormData) => {
    setBusy(true);
    try {
      const idempotencyKey = generateIdempotencyKey(user?.id);
      const { data } = await api<{ transaction_id: number; gateway_url: string }>(
        `/checkout/plan/${planId}`,
        {
          method: 'POST',
          token: readToken(),
          body: {
            cadence,
            policies_accepted: true,
            payment_phone: consent.paymentPhone,
          },
          idempotencyKey,
        },
      );
      if (!data.gateway_url) {
        notify('danger', 'Could not start secure checkout. Please try again.');
        setBusy(false);
        return;
      }
      const url = data.gateway_url;
      if (!isSafePaymentRedirect(url)) {
        notify('danger', 'Payment gateway returned an unsafe redirect URL.');
        setBusy(false);
        return;
      }
      window.location.href = url;
    } catch (e) {
      notify('danger', e instanceof ApiError ? e.message : 'Secure checkout failed. Please try again.');
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
          <p className="text-sm font-semibold text-ink">Secure Checkout</p>
          <p className="text-xs text-ink-muted">
            Pay securely with Visa, MasterCard, bKash, Nagad, Rocket, or Bangladeshi net-banking.
            Your payment is processed through a secure gateway.
          </p>
        </div>
      </div>

      {!showConsent ? (
        <Button fullWidth variant="filled" size="lg" onClick={() => setShowConsent(true)} disabled={busy}>
          Proceed to Secure Checkout
        </Button>
      ) : (
        <PaymentConsent
          onConsent={handleConsent}
          compact
          initialPhone={user?.phone ?? ''}
        />
      )}
      <p className="text-center text-xs text-ink-faint">🔒 Secure checkout · Encrypted connection</p>
    </div>
  );
}
