'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { readToken } from '@/lib/auth';
import { cn } from '@/lib/cn';
import { useAuthGate } from './AuthGate';

/**
 * Heart toggle that hits POST /ads/{id}/favourite / DELETE. Optimistic UI +
 * rollback on error. Unauth users get redirected to login.
 */
export function FavouriteButton({
  adId,
  initial = false,
  variant = 'circle',
  onToggle,
  className,
}: {
  adId: number;
  initial?: boolean;
  variant?: 'circle' | 'inline';
  onToggle?: (fav: boolean) => void;
  className?: string;
}) {
  const [fav, setFav] = useState(initial);
  const [busy, setBusy] = useState(false);
  const { requireLogin } = useAuthGate();

  const doToggle = async () => {
    const token = readToken();
    if (!token) return; // shouldn't happen — requireLogin already gated it
    const next = !fav;
    setFav(next); setBusy(true);
    try {
      await api(`/ads/${adId}/favourite`, { method: next ? 'POST' : 'DELETE', token });
      onToggle?.(next);
    } catch (err) {
      setFav(!next); // rollback
      if (err instanceof ApiError && err.status === 401) {
        requireLogin('save this ad');
      }
    } finally { setBusy(false); }
  };

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Popup gate — signed-out users see the Bikroy-style modal, then the
    // favourite action runs automatically once they authenticate.
    requireLogin('save this ad', doToggle);
  };

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-pressed={fav}
        aria-label={fav ? 'Remove from favourites' : 'Add to favourites'}
        className={cn(
          'inline-flex items-center gap-2 rounded-pill border px-4 h-11 text-sm font-medium btn-focus transition',
          fav ? 'border-danger bg-danger/5 text-danger' : 'border-line text-ink hover:border-brand-500 hover:text-brand-700',
          className,
        )}
      >
        <Heart size={16} className={fav ? 'fill-danger' : ''} />
        {fav ? 'Saved' : 'Save'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={fav}
      aria-label={fav ? 'Remove from favourites' : 'Add to favourites'}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full shadow-chip transition btn-focus',
        fav ? 'bg-danger text-white hover:bg-danger/90' : 'bg-white/95 text-ink-muted hover:text-danger',
        className,
      )}
    >
      <Heart size={16} className={fav ? 'fill-white' : ''} />
    </button>
  );
}
