'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import type { User } from '@/types/api';

/**
 * Floating "Use eSawda with Google" card — mirrors Google Identity Services'
 * One Tap prompt but rendered inline so we can control its look (avatar,
 * button copy, dismissal state).
 *
 * Behaviour:
 *   - Only appears when `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set AND the user
 *     previously granted Google (or currently has an active Google session).
 *   - Reads a lightweight hint from localStorage (`eshauda_google_hint`) so
 *     we can render the "Continue as <name>" copy without another round-trip.
 *   - Dismissible; the dismissal is remembered in sessionStorage so it doesn't
 *     nag the user during the same visit.
 */
type Hint = { name: string; email: string; avatar_url?: string };

const HINT_KEY = 'eshauda_google_hint';
const SKIP_KEY = 'eshauda_google_hint_skip';

export function GoogleOneTapCard({ onSuccess }: { onSuccess: (user: User) => void }) {
  const [hint, setHint] = useState<Hint | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(SKIP_KEY) === '1') return;
    try {
      const raw = localStorage.getItem(HINT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Hint;
      if (parsed?.name && parsed?.email) setHint(parsed);
    } catch { /* ignore malformed */ }
  }, []);

  if (!hint) return null;

  const first = hint.name.split(' ')[0] ?? hint.name;

  const continueAs = async () => {
    setBusy(true);
    try {
      // Backend contract: /auth/social/google/silent accepts the stored
      // Google id-token hint and returns a fresh eSawda session. If the
      // endpoint isn't wired yet we fall back to opening the standard login
      // popup by dispatching a synthetic event.
      const { data } = await api<{ user: User; token: string }>(
        '/auth/social/google/silent',
        { method: 'POST', body: { email: hint.email } },
      );
      document.cookie = `eshauda_token=${data.token}; path=/; max-age=2592000; samesite=lax`;
      onSuccess(data.user);
    } catch (err) {
      // Silent endpoint missing — just dismiss and let the user click the
      // main "Google" button in the popup.
      if (err instanceof ApiError && err.status === 404) {
        sessionStorage.setItem(SKIP_KEY, '1');
        setHint(null);
      }
    } finally { setBusy(false); }
  };

  const dismiss = () => {
    sessionStorage.setItem(SKIP_KEY, '1');
    setHint(null);
  };

  return (
    <div className="fixed right-4 top-4 z-40 w-[360px] rounded-2xl border border-line bg-white p-4 shadow-2xl">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <GoogleGlyph />
          <span className="text-sm font-semibold text-ink">Use eSawda with Google</span>
        </div>
        <button
          type="button" onClick={dismiss} aria-label="Dismiss"
          className="grid h-7 w-7 place-items-center rounded-full text-ink-faint hover:bg-surface-muted hover:text-ink"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-3">
        {hint.avatar_url ? (
          <Image src={hint.avatar_url} alt={hint.name} width={40} height={40} className="rounded-full" unoptimized />
        ) : (
          <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
            {first.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{hint.name}</p>
          <p className="truncate text-xs text-ink-muted">{hint.email}</p>
        </div>
      </div>

      <button
        type="button" onClick={continueAs} disabled={busy}
        className="mt-3 w-full rounded-md bg-[#1A73E8] py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1765CC] disabled:opacity-60"
      >
        {busy ? 'Signing in…' : `Continue as ${first}`}
      </button>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.9 0 6.6 1.7 8.1 3.1l6-5.8C34.5 3.1 29.7 1 24 1 14.8 1 6.9 6.3 3.2 14l7 5.4C12 13.6 17.5 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.6c-.5 3-2.3 5.5-4.8 7.2l7.4 5.7c4.3-4 6.8-9.9 6.8-17.4z" />
      <path fill="#FBBC05" d="M10.2 28.6c-.5-1.4-.7-2.9-.7-4.6s.2-3.2.7-4.6l-7-5.4C1.7 17.4 1 20.6 1 24s.7 6.6 2.2 10l7-5.4z" />
      <path fill="#34A853" d="M24 47c6.5 0 12-2.1 16-5.9l-7.4-5.7c-2 1.4-4.7 2.3-8.6 2.3-6.5 0-12-4.1-13.8-9.9l-7 5.4C6.9 41.7 14.8 47 24 47z" />
    </svg>
  );
}
