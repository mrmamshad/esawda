'use client';

import { useState, type FormEvent } from 'react';
import { CheckCircle2, PackageCheck, TriangleAlert } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { api, ApiError } from '@/lib/api';
import { readToken } from '@/lib/auth';
import { isValidBdMobile, normalizeBdMobile } from '@/lib/phone';
import { formatMoney } from '@/lib/format';

/**
 * Cash-on-delivery "Place Order" card on the product detail page.
 * Shown only on priced products from shop accounts. No login or payment
 * needed — name, mobile and address are enough; the shop confirms the
 * order from its dashboard (Pending → Confirmed → Delivered / Cancelled).
 */
export function PlaceOrderCard({ adId, price }: { adId: number; price: number }) {
  const { notify } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [placed, setPlaced] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (name.trim().length < 2) return setErr('Please enter your full name.');
    if (!isValidBdMobile(phone)) return setErr('Mobile must be an 11-digit Bangladeshi number, e.g. 01712345678.');
    if (address.trim().length < 10) return setErr('Please provide your full delivery address.');
    setBusy(true);
    try {
      await api(`/ads/${adId}/order`, {
        method: 'POST',
        token: readToken(),
        body: { name: name.trim(), phone: phone.trim(), address: address.trim() },
      });
      setPlaced(true);
      notify('success', 'Order placed — the shop will contact you to confirm.');
    } catch (e2) {
      setErr(e2 instanceof ApiError ? e2.message : 'Could not place the order. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const inp = 'h-11 w-full rounded-field border border-line bg-white px-3 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100';

  return (
    <section className="surface-card p-5">
      {placed ? (
        <div className="flex items-start gap-3">
          <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-green-600" />
          <div>
            <h3 className="text-sm font-bold text-ink">Order placed!</h3>
            <p className="mt-1 text-[13px] leading-5 text-ink-muted">
              The shop has received your order for {formatMoney(price, '৳')} (cash on delivery)
              and will call {phone ? ` ${phone}` : ' you'} to confirm delivery.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink">Place Order</h3>
            <span className="inline-flex items-center gap-1 rounded-pill bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
              <PackageCheck size={12} /> Cash on delivery
            </span>
          </div>
          <p className="mt-1 text-xs leading-5 text-ink-muted">
            Order now — pay when the product is delivered. The shop will contact you to confirm.
          </p>

          <div className="mt-4 space-y-3">
            <input className={inp} placeholder="Your name *" value={name} onChange={(e) => setName(e.target.value)} maxLength={150} />
            <input
              className={inp}
              placeholder="Mobile number *"
              inputMode="numeric"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(normalizeBdMobile(e.target.value))}
              maxLength={11}
            />
            <textarea
              className={`${inp} h-auto py-3 leading-5`}
              placeholder="Full delivery address *"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              maxLength={500}
            />
          </div>

          {err && (
            <p className="mt-3 flex items-start gap-1.5 rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              <TriangleAlert size={14} className="mt-0.5 shrink-0" /> {err}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-field bg-brand-700 text-sm font-bold text-white transition hover:bg-brand-600 disabled:cursor-wait disabled:opacity-60"
          >
            <PackageCheck size={16} /> {busy ? 'Placing order…' : `Place order · ${formatMoney(price, '৳')}`}
          </button>
        </form>
      )}
    </section>
  );
}
