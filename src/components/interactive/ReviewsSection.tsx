'use client';

import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { TestimonialCard } from '@/components/ui/TestimonialCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ReviewForm } from './ReviewForm';
import { api } from '@/lib/api';
import { readToken } from '@/lib/auth';
import type { Review } from '@/types/api';

export function ReviewsSection({ adId }: { adId: number }) {
  const [items, setItems]   = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  const load = async () => {
    try {
      const res = await api<Review[]>(`/ads/${adId}/reviews`, { cache: 'no-store' });
      setItems((res.data ?? []) as Review[]);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { setAuthed(!!readToken()); void load(); }, [adId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-ink">Reviews</h2>

      {authed && <ReviewForm adId={adId} onSubmitted={load} />}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-32" /><Skeleton className="h-32" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={<MessageCircle size={20} />} title="No reviews yet" description="Be the first to leave a review." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((r) => <TestimonialCard key={r.id} kind="review" item={r} />)}
        </div>
      )}
    </section>
  );
}
