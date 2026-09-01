'use client';

import { useState, type FormEvent } from 'react';
import { CreditCard, MessageCircle, ShieldCheck, X, User as UserIcon, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { api, ApiError } from '@/lib/api';
import { saveToken, readToken } from '@/lib/auth';
import { useAuthGate } from '@/components/interactive/AuthGate';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { User } from '@/types/api';

/**
 * "Buy Now" card for the product sidebar (option B).
 *
 * Two paths offered inside the modal:
 *   A — Message the seller (asks guest for name + mobile, then hops into
 *       the chat). No account/password required — same guest flow as payment.
 *   B — Pay via SSLCommerz. Calls `POST /checkout/product-purchase/{id}`,
 *       then opens the returned gateway URL in the same tab. On success the
 *       gateway redirects back to `/membership/success?tx=<id>&status=success`.
 *
 * Guests are asked for name + mobile first (reuses the guest-login flow),
 * so a signed-out buyer can pay or message without a password.
 */
export function BuyNowCard({
  productId, productTitle, price, sellerId, sellerName, sellerUsername, sellerAvatar, sellerOnline,
}: {
  productId: number;
  productTitle: string;
  price: number;
  sellerId: number;
  sellerName: string;
  sellerUsername?: string;
  sellerAvatar?: string | null;
  sellerOnline?: boolean;
}) {
  const { user } = useAuthGate();
  const router = useRouter();

  const [open,   setOpen]   = useState(false);
  const [mode,   setMode]   = useState<'pick' | 'guest' | 'processing' | 'done' | 'error'>('pick');
  const [intent, setIntent] = useState<'payment' | 'message'>('payment');
  const [name,   setName]   = useState(user?.name ?? '');
  const [mobile, setMobile] = useState('');
  const [error,  setError]  = useState<string | null>(null);
  const [txId,   setTxId]   = useState<number | null>(null);

  const close = () => { setOpen(false); setTimeout(() => setMode('pick'), 200); };

  // The conversation page has no thread yet for a brand-new chat, so the
  // seller's identity rides along in the URL — the chat header renders it
  // until the first message creates a real thread.
  const chatHref = () => {
    const p = new URLSearchParams({ name: sellerName });
    if (sellerUsername) p.set('username', sellerUsername);
    if (sellerAvatar) p.set('avatar', sellerAvatar);
    if (sellerOnline) p.set('online', '1');
    return `/messages/${sellerId}?${p.toString()}`;
  };

  // Logged-in buyers skip the guest form entirely: message goes straight
  // into the chat, pay starts the checkout immediately.
  const choose = (int: 'payment' | 'message') => {
    setIntent(int); setError(null);
    if (readToken()) {
      if (int === 'message') { router.push(chatHref() as Route); return; }
      void startPurchase();
      return;
    }
    setMode('guest');
  };

  const ensureAuthed = async (): Promise<User | null> => {
    if (readToken()) return user;
    const { data } = await api<{ user: User; token: string }>('/auth/guest-login', {
      method: 'POST', body: { name, mobile },
    });
    saveToken(data.token);
    return data.user;
  };

  const startPurchase = async (e?: FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (!readToken() && !user && (!name.trim() || !mobile.trim())) {
      setError('Please enter your name and mobile number.');
      return;
    }
    setMode('processing');
    try {
      await ensureAuthed();

      // Message intent: straight into the chat with this seller — no payment.
      if (intent === 'message') {
        router.push(chatHref() as Route);
        return;
      }

      const { data } = await api<{ transaction_id: number; order_id: number; gateway_url: string }>(
        `/checkout/product-purchase/${productId}`,
        { method: 'POST', token: readToken() },
      );
      setTxId(data.transaction_id);
      // Gateway runs in the same tab; the callback redirects back to the
      // success page, so the buyer never gets stuck behind an extra tab.
      window.location.href = data.gateway_url;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start the payment. Please try again.');
      setMode('pick');
    }
  };

  const fieldCls =
    'h-11 w-full rounded-md border border-line bg-white pl-9 pr-3 text-sm outline-none placeholder:text-ink-faint focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20';

  return (
    <>
      <div className="surface-card p-5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Buy now</h3>
          <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
            <ShieldCheck size={13} /> Secure checkout
          </span>
        </div>
        <p className="mt-1 text-xs text-ink-muted">Total payable</p>
        <p className="text-2xl font-bold text-ink">৳{Number(price || 0).toLocaleString('en-US')}</p>
        <Button variant="filled" className="mt-4 w-full" leftIcon={<CreditCard size={16} />}
                onClick={() => { setMode('pick'); setError(null); setOpen(true); }}>
          Buy Now
        </Button>
        <p className="mt-2 text-center text-[11px] leading-tight text-ink-faint">
          Buy securely from eSawda — trusted card & mobile-banking checkout
        </p>
      </div>

      <Modal open={open} onClose={close} title="How would you like to buy?" size="md">
        {mode === 'pick' && (
          <div className="space-y-3">
            <p className="text-sm text-ink">
              <span className="font-semibold">{productTitle}</span> — ৳{Number(price || 0).toLocaleString('en-US')}
            </p>
            {error && <div className="rounded-md bg-red-50 px-3 py-2 text-center text-xs text-danger">{error}</div>}
            <button type="button" onClick={() => choose('message')}
                    className="flex w-full items-center gap-3 rounded-md border border-line bg-white p-3 text-left hover:bg-surface-muted">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-ink-soft text-ink"><MessageCircle size={16} /></span>
              <span>
                <span className="block text-sm font-semibold text-ink">Message seller to get the product</span>
                <span className="block text-xs text-ink-muted">Contact the seller and buy directly.</span>
              </span>
            </button>
            <div className="flex items-center gap-3">
              <button type="button" onClick={close}
                      className="flex-1 rounded-md border border-line py-2.5 text-sm font-semibold text-ink hover:bg-surface-muted">Cancel</button>
            </div>
          </div>
        )}

        {mode === 'guest' && (
          <form onSubmit={startPurchase} className="space-y-3">
            <p className="text-xs text-ink-muted">
              {intent === 'message'
                ? 'Just your name and mobile — no password needed to message the seller.'
                : 'Just your name and mobile — no password needed to check out securely.'}
            </p>
            <label className="relative block">
              <UserIcon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={fieldCls} />
            </label>
            <label className="relative block">
              <Phone size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input required type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Mobile number" className={fieldCls} />
            </label>
            {error && <div className="rounded-md bg-red-50 px-3 py-2 text-center text-xs text-danger">{error}</div>}
            <div className="flex items-center gap-3">
              <button type="submit"
                      className="flex-1 rounded-md bg-brand-700 py-2.5 text-sm font-semibold text-white hover:bg-brand-800">
                {intent === 'message' ? 'Start conversation' : 'Continue to payment'}
              </button>
              <button type="button" onClick={() => setMode('pick')}
                      className="grid h-9 w-9 place-items-center rounded-md border border-line text-ink-muted hover:text-ink" aria-label="Back">
                <X size={15} />
              </button>
            </div>
          </form>
        )}

        {mode === 'processing' && (
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700" />
            <p className="text-sm text-ink">Starting secure payment…</p>
            {txId && <p className="text-xs text-ink-muted">Reference TX-{txId}</p>}
          </div>
        )}
      </Modal>
    </>
  );
}
