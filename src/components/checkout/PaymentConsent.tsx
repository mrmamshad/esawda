'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Phone } from 'lucide-react';
import type { Route } from 'next';

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

function isValidBdPhone(phone: string): boolean {
  return /^880\d{10}$/.test(phone.replace(/\D/g, ''));
}

function normalizeBdPhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.startsWith('88')) return digits;
  if (digits.startsWith('0')) return '88' + digits.slice(1);
  return digits;
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
  const [paymentPhone, setPaymentPhone] = useState(initialPhone);
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
        <button
          type="button"
          onClick={() => setTermsExpanded(!termsExpanded)}
          className="flex w-full items-start gap-3 text-left"
        >
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTermsAccepted(e.target.checked)}
            className="mt-1.5 h-4 w-4 flex-shrink-0 accent-brand-700"
            aria-label="Accept Terms & Conditions"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-ink">
              I accept the <Link href={'/terms' as Route} className="text-brand-700 underline" onClick={(e) => e.stopPropagation()}>Terms & Conditions</Link>
            </p>
            {compact && (
              <p className="text-xs text-ink-muted mt-1">
                You agree to our terms of service and payment policies.
              </p>
            )}
          </div>
          <span className="flex-shrink-0 text-ink-faint">
            {termsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </button>

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
        <button
          type="button"
          onClick={() => setRefundExpanded(!refundExpanded)}
          className="flex w-full items-start gap-3 text-left"
        >
          <input
            type="checkbox"
            checked={refundAccepted}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRefundAccepted(e.target.checked)}
            className="mt-1.5 h-4 w-4 flex-shrink-0 accent-brand-700"
            aria-label="Accept Refund Policy"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-ink">
              I acknowledge the <Link href={'/refund-policy' as Route} className="text-brand-700 underline" onClick={(e) => e.stopPropagation()}>Refund Policy</Link>
            </p>
            {compact && (
              <p className="text-xs text-ink-muted mt-1">
                Refunds are processed per our stated policy.
              </p>
            )}
          </div>
          <span className="flex-shrink-0 text-ink-faint">
            {refundExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </button>

        {refundExpanded && (
          <div className="mt-3 border-t border-line pt-3 text-xs text-ink-muted space-y-2">
            <p>Under our refund policy:</p>
            <ul className="list-inside list-disc space-y-1 ml-1">
              <li>Refunds are processed within 5–7 business days</li>
              <li>Conditions and exclusions apply per transaction type</li>
              <li>Disputes are handled per payment gateway rules</li>
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
            placeholder="01XXXXXXXXX or +880..."
            value={paymentPhone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            maxLength={15}
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
              Please enter a valid Bangladeshi phone (11 digits, e.g. 01712345678 or +8801712345678)
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
