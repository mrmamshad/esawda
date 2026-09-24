'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, RotateCcw, EyeOff, Eye, Loader2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { readToken } from '@/lib/auth';

/**
 * Inline actions for a single listing on the personal dashboard.
 *
 * Lets a seller manage their own product without leaving the dashboard:
 *   - active   → Mark as sold / Hide
 *   - sold_out → Restock (back to active)
 *   - hidden   → Unhide
 *
 * All actions hit POST /api/v1/ads/{id}/{action} (backend already supports
 * sold-out / restock / hide / unhide) and then refresh the server component.
 */
export function ListingActions({
  adId,
  status,
  hidden,
}: {
  adId: number;
  status: string;
  hidden?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (action: string, confirmMsg?: string) => {
    if (confirmMsg && !confirm(confirmMsg)) return;
    setError(null);
    start(async () => {
      try {
        await api(`/ads/${adId}/${action}`, { method: 'POST', token: readToken() });
        router.refresh();
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Action failed. Please try again.');
      }
    });
  };

  const btn =
    'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition disabled:opacity-50';

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {pending && <Loader2 size={14} className="animate-spin text-ink-faint" />}

        {status === 'sold_out' ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run('restock')}
            className={`${btn} border-brand-200 text-brand-700 hover:bg-brand-50`}
          >
            <RotateCcw size={13} /> Restock
          </button>
        ) : status === 'active' ? (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() => run('sold-out', 'Mark this product as sold? It will be removed from the marketplace.')}
              className={`${btn} border-emerald-200 text-emerald-700 hover:bg-emerald-50`}
            >
              <CheckCircle2 size={13} /> Mark as sold
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(hidden ? 'unhide' : 'hide')}
              className={`${btn} border-line text-ink-muted hover:bg-surface-muted`}
            >
              {hidden ? <><Eye size={13} /> Unhide</> : <><EyeOff size={13} /> Hide</>}
            </button>
          </>
        ) : null}
      </div>
      {error && <span className="text-[11px] text-danger">{error}</span>}
    </div>
  );
}
