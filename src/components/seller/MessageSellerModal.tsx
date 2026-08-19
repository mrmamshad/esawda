'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { Send, X, User as UserIcon, Phone } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { saveToken, readToken } from '@/lib/auth';
import { useAuthGate } from '@/components/interactive/AuthGate';
import { Modal } from '@/components/ui/Modal';
import type { User } from '@/types/api';

/**
 * "Message Seller" modal — the low-friction way to start a conversation
 * straight from a product page.
 *
 *  - Signed-out buyers see a guest form (name + mobile) instead of a full
 *    registration wall. On submit the modal calls `POST /auth/guest-login`
 *    (rate-limited server-side), stores the returned token, then sends the
 *    message the buyer typed.
 *  - Signed-in buyers just type + send; the modal keeps them on the page.
 *
 * After a successful send the buyer can jump to the full chat thread.
 */
export function MessageSellerModal({
  open,
  onClose,
  sellerId,
  sellerName,
  productId,
  productTitle,
}: {
  open:       boolean;
  onClose:    () => void;
  sellerId:   number;
  sellerName: string;
  productId?: number;
  productTitle?: string;
}) {
  const router  = useRouter();
  const { user } = useAuthGate();

  const [message,  setMessage]  = useState('');
  const [name,     setName]     = useState('');
  const [mobile,   setMobile]   = useState('');
  const [busy,     setBusy]     = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [sent,     setSent]     = useState(false);

  useEffect(() => {
    if (open) { setError(null); setSent(false); setMessage(''); }
  }, [open]);

  // Prefill the guest name when a signed-in user is available (still shown
  // for guests only; signed-in users skip the guest fields entirely).
  useEffect(() => {
    if (open && user?.name) setName(user.name);
  }, [open, user]);

  const ensureAuthed = async (): Promise<User | null> => {
    // If we already have a token, treat as authed (the send below will 401
    // if it actually expired).
    if (readToken()) return user;

    const { data } = await api<{ user: User; token: string }>('/auth/guest-login', {
      method: 'POST',
      body:   { name, mobile },
    });
    saveToken(data.token);
    return data.user;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) { setError('Please type a message.'); return; }
    setBusy(true); setError(null);
    try {
      await ensureAuthed();
      const { data } = await api<{ id: number }>('/messages', {
        method: 'POST',
        token:  readToken(),
        body:   { to: sellerId, body: message.trim(), post_id: productId ?? 0 },
      });
      void data;
      setSent(true);
      setMessage('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send your message. Please try again.');
    } finally { setBusy(false); }
  };

  const openChat = () => {
    onClose();
    router.push(`/messages/${sellerId}` as Route);
  };

  return (
    <Modal open={open} onClose={onClose} title={`Message ${sellerName}`} size="sm">
      {sent ? (
        <div className="space-y-4 py-2 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-green-100 text-green-700">
            <Send size={20} />
          </div>
          <p className="text-sm text-ink">Your message has been sent to {sellerName}.</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={openChat}
              className="flex-1 rounded-md bg-brand-700 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
            >
              Open chat
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-line py-2.5 text-sm font-semibold text-ink hover:bg-surface-muted"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          {!readToken() && !user && (
            <>
              <p className="text-xs text-ink-muted">
                Just your name and mobile — no password needed to start chatting.
              </p>
              <label className="relative block">
                <UserIcon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className={INP}
                />
              </label>
              <label className="relative block">
                <Phone size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                <input
                  required
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="Mobile number"
                  className={INP}
                />
              </label>
            </>
          )}

          {productTitle && (
            <p className="rounded-md bg-surface-muted px-3 py-2 text-xs text-ink-muted">
              About: <span className="font-medium text-ink">{productTitle}</span>
            </p>
          )}

          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Ask ${sellerName} about this product…`}
            className={INP + ' resize-none'}
          />

          {error && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-center text-xs text-danger">{error}</div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="flex-1 rounded-md bg-brand-700 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
            >
              {busy ? 'Sending…' : 'Send message'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-md border border-line text-ink-muted hover:text-ink"
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

const INP =
  'h-11 w-full rounded-md border border-line bg-white pl-9 pr-3 text-sm outline-none placeholder:text-ink-faint focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20';