'use client';

import { useState, type FormEvent } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormTextarea } from '@/components/forms/FormField';
import { useToast } from '@/components/ui/Toast';
import { api, ApiError } from '@/lib/api';
import { readToken } from '@/lib/auth';
import { cn } from '@/lib/cn';
import { useAuthGate } from './AuthGate';

export function ReviewForm({
  adId,
  onSubmitted,
}: {
  adId: number;
  onSubmitted?: () => void;
}) {
  const { notify } = useToast();
  const [rating, setRating] = useState(5);
  const [hover, setHover]   = useState(0);
  const [comment, setComment] = useState('');
  const [image, setImage]   = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState<string | null>(null);
  const { requireLogin } = useAuthGate();

  const doSubmit = async () => {
    const token = readToken();
    if (!token) return;
    setBusy(true); setErr(null);
    try {
      const fd = new FormData();
      fd.append('rating', String(rating));
      fd.append('comment', comment.trim());
      if (image) fd.append('image', image);
      await api(`/ads/${adId}/reviews`, { method: 'POST', body: fd, token });
      notify('success', 'Thanks for your review!');
      setComment(''); setRating(5); setImage(null);
      onSubmitted?.();
    } catch (e2) {
      if (e2 instanceof ApiError) setErr(e2.message);
      else setErr('Could not submit review.');
    } finally { setBusy(false); }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (comment.trim().length < 5) { setErr('Please write at least 5 characters.'); return; }
    // Popup gate — unauthenticated reviewers see the Bikroy-style modal
    // instead of being redirected to /auth/login.
    requireLogin('post a review', doSubmit);
  };

  return (
    <form onSubmit={submit} className="surface-card space-y-4 p-6">
      <div>
        <p className="mb-2 text-sm font-medium text-ink">Your rating</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              aria-label={`Rate ${n} stars`}
              className="p-0.5 btn-focus rounded"
            >
              <Star size={24} className={cn(
                'transition',
                (hover || rating) >= n ? 'fill-warning text-warning' : 'text-line',
              )} />
            </button>
          ))}
          <span className="ml-2 text-sm text-ink-muted">{rating} of 5</span>
        </div>
      </div>

      <FormTextarea
        label="Your review"
        rows={4}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="How was your experience with this seller?"
        error={err ?? undefined}
      />

      <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-muted hover:text-ink">
        <input
          type="file" accept="image/*"
          className="hidden"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
        />
        <span className="rounded-md border border-line bg-white px-3 py-2 transition hover:border-brand-300">
          {image ? image.name : '📷 Attach a photo (optional)'}
        </span>
        {image && (
          <button
            type="button"
            onClick={() => setImage(null)}
            className="text-xs text-danger underline"
          >
            Remove
          </button>
        )}
      </label>

      <div className="flex justify-end">
        <Button type="submit" variant="filled" disabled={busy}>{busy ? 'Submitting…' : 'Submit review'}</Button>
      </div>
    </form>
  );
}
