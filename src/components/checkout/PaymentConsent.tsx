'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Phone } from 'lucide-react';
import type { Route } from 'next';
import { isValidBdMobile as isValidBdPhone, normalizeBdMobile as normalizeBdPhone } from '@/lib/phone';

/**
 * Reusable DGePay/secure checkout consent component.
 * Compact form with:
 * - Terms and Refund Policy acceptance checkboxes
 * - Bangladesh phone input with validation
 * - Accessible, collapsible policy summaries
 *
 * Parent components (CheckoutForm, ShopPlansClient, BoostForm, AdForm)
 * use this to collect consent before calling checkout endpoints with:
 *   body: { policies_accepted: true, payment_phone: "+880..." }
 *   headers: { "Idempotency-Key": "user_id-timestamp-random" }
 */

export type PaymentConsentFormData = {
  termsAccepted: boolean;
  refundAccepted: boolean;
  paymentPhone: string;
};

export interface PaymentConsentProps {
  onConsent?: (data: PaymentConsentFormData) => void;
  onPhoneChange?: (phone: string) => void;
  initialPhone?: string;
  compact?: boolean;
  className?: string;
}

export function PaymentConsent({
  onConsent,
  onPhoneChange,
  initialPhone = '',
  compact = false,
  className = '',
}: PaymentConsentProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [refundAccepted, setRefundAccepted] = useState(false);
  const [paymentPhone, setPaymentPhone] = useState(() => normalizeBdPhone(initialPhone));
  const [termsExpanded, setTermsExpanded] = useState(false);
  const [refundExpanded, setRefundExpanded] = useState(false);

  const isPhoneValid = paymentPhone.trim() === '' || isValidBdPhone(normalizeBdPhone(paymentPhone));
  const isComplete = termsAccepted && refundAccepted && paymentPhone.trim() && isPhoneValid;

  const handlePhoneChange = (value: string) => {
    const normalized = normalizeBdPhone(value);
    setPaymentPhone(normalized);
    onPhoneChange?.(normalized);
  };

  const handleConsent = () => {
    if (isComplete && onConsent) {
      onConsent({
        termsAccepted,
        refundAccepted,
        paymentPhone: normalizeBdPhone(paymentPhone),
      });
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Terms & Conditions */}
      <div className={`rounded-lg border border-line bg-surface-card p-3 ${compact ? 'text-sm' : ''}`}>
        <div className="flex items-start gap-2">
          <label className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-start gap-3 rounded-md py-2 text-left">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 h-5 w-5 flex-shrink-0 accent-brand-700"
            />
            <span className="min-w-0 flex-1">
              <span className="font-medium text-ink">
                I accept the <Link href={'/terms' as Route} className="text-brand-700 underline" onClick={(e) => e.stopPropagation()}>Terms & Conditions</Link>{' '}
                and <Link href={'/privacy' as Route} className="text-brand-700 underline" onClick={(e) => e.stopPropagation()}>Privacy Policy</Link>
              </span>
              {compact && (
                <span className="mt-1 block text-xs text-ink-muted">
                  You agree to our service, privacy, and payment terms.
                </span>
              )}
            </span>
          </label>
          <button
            type="button"
            aria-label={termsExpanded ? 'Hide terms summary' : 'Show terms summary'}
            aria-expanded={termsExpanded}
            onClick={() => setTermsExpanded(!termsExpanded)}
            className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md text-ink-faint hover:bg-brand-50"
          >
            {termsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {termsExpanded && (
          <div className="mt-3 border-t border-line pt-3 text-xs text-ink-muted space-y-2">
            <p>By proceeding with payment, you agree to:</p>
            <ul className="list-inside list-disc space-y-1 ml-1">
              <li>Our Terms & Conditions governing transactions</li>
              <li>Secure payment processing through DGePay</li>
              <li>Payment authorization on the provided phone number</li>
            </ul>
          </div>
        )}
      </div>

      {/* Refund Policy */}
      <div className={`rounded-lg border border-line bg-surface-card p-3 ${compact ? 'text-sm' : ''}`}>
        <div className="flex items-start gap-2">
          <label className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-start gap-3 rounded-md py-2 text-left">
            <input
              type="checkbox"
              checked={refundAccepted}
              onChange={(e) => setRefundAccepted(e.target.checked)}
              className="mt-0.5 h-5 w-5 flex-shrink-0 accent-brand-700"
            />
            <span className="min-w-0 flex-1">
              <span className="font-medium text-ink">
                I acknowledge the <Link href={'/refund-policy' as Route} className="text-brand-700 underline" onClick={(e) => e.stopPropagation()}>Refund & Cancellation Policy</Link>
              </span>
              {compact && (
                <span className="mt-1 block text-xs text-ink-muted">
                  Eligibility and processing follow the published policy.
                </span>
              )}
            </span>
          </label>
          <button
            type="button"
            aria-label={refundExpanded ? 'Hide refund summary' : 'Show refund summary'}
            aria-expanded={refundExpanded}
            onClick={() => setRefundExpanded(!refundExpanded)}
            className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md text-ink-faint hover:bg-brand-50"
          >
            {refundExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {refundExpanded && (
          <div className="mt-3 border-t border-line pt-3 text-xs text-ink-muted space-y-2">
            <p>Under our refund policy:</p>
            <ul className="list-inside list-disc space-y-1 ml-1">
              <li>Approved refunds return to the original payment method</li>
              <li>Processing time depends on DGePay and the issuing provider</li>
              <li>Eligibility and exclusions follow the full published policy</li>
            </ul>
          </div>
        )}
      </div>

      {/* Payment Phone Input */}
      <div className={`rounded-lg border border-line bg-surface-card p-3 ${compact ? 'text-sm' : ''}`}>
        <label className="block">
          <div className="flex items-center gap-2 mb-2">
            <Phone size={16} className="text-ink-muted flex-shrink-0" />
            <span className="font-medium text-ink">Payment Phone Number</span>
            <span className="text-xs text-danger">*</span>
          </div>
          <input
            type="tel"
            inputMode="numeric"
            placeholder="01XXXXXXXXX"
            value={paymentPhone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            maxLength={11}
            className={`w-full rounded-md border px-3 py-2 text-sm outline-none transition ${
              !isPhoneValid && paymentPhone.trim()
                ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/20'
                : 'border-line focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
            }`}
            aria-label="Payment phone number"
            aria-invalid={!isPhoneValid && paymentPhone.trim() ? 'true' : 'false'}
          />
          {!isPhoneValid && paymentPhone.trim() && (
            <p className="mt-1 text-xs text-danger">
              Please enter a valid 11-digit Bangladeshi phone, e.g. 01712345678
            </p>
          )}
          {isPhoneValid && paymentPhone.trim() && (
            <p className="mt-1 text-xs text-green-600">✓ Phone number confirmed</p>
          )}
        </label>
      </div>

      {/* Summary & Status */}
      {!isComplete && (
        <div className={`rounded-lg border border-line bg-amber-50 p-3 text-xs text-amber-700 ${compact ? '' : 'text-sm'}`}>
          <p className="font-medium mb-1">Complete the form to continue:</p>
          <ul className="space-y-0.5 ml-1 list-inside list-disc">
            {!termsAccepted && <li>Accept Terms & Conditions</li>}
            {!refundAccepted && <li>Accept Refund Policy</li>}
            {!paymentPhone.trim() && <li>Enter your payment phone</li>}
            {!isPhoneValid && paymentPhone.trim() && <li>Fix the phone number format</li>}
          </ul>
        </div>
      )}

      {isComplete && (
        <div className={`rounded-lg border border-green-200 bg-green-50 p-3 text-xs text-green-700 ${compact ? '' : 'text-sm'}`}>
          ✓ All consents confirmed. Ready for secure checkout.
        </div>
      )}

      {onConsent && (
        <button
          type="button"
          onClick={handleConsent}
          disabled={!isComplete}
          className="w-full rounded-lg bg-brand-700 py-2.5 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-800 transition"
        >
          Proceed to Secure Checkout
        </button>
      )}
    </div>
  );
}
