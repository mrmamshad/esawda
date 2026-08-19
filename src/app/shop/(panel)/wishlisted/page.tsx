import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import { Heart } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { requireUser } from '@/lib/session';
import { apiFromServer, ApiError } from '@/lib/api';

export const metadata: Metadata = { title: 'Wishlisted by Users' };
export const dynamic = 'force-dynamic';

type Row = {
  id: number;
  user: { id: number; username: string; name: string | null; image: string | null } | null;
  post: { id: number; product_name: string; slug: string | null; price: number } | null;
};

async function safe<T>(fn: () => Promise<T>, fb: T): Promise<T> {
  try { return await fn(); } catch (e) { if (e instanceof ApiError) return fb; throw e; }
}

export default async function WishlistedPage() {
  const user = await requireUser('/shop/wishlisted');
  const res  = await safe(
    () => apiFromServer<Row[]>('/me/wishlisted?per_page=30', { cache: 'no-store' }),
    { data: [] as Row[] },
  );
  const rows: Row[] = Array.isArray(res.data) ? res.data : ((res.data as unknown as { data: Row[] }).data ?? []);

  return (
    <>
      <header>
        <h1 className="text-2xl font-bold text-ink">Wishlisted by Users</h1>
        <p className="text-sm text-ink-muted">Buyers who saved your products to their favourites.</p>
      </header>

      {rows.length === 0 ? (
        <section className="surface-card p-8">
          <EmptyState
            icon={<Heart size={20} />}
            title="No wishlists yet"
            description="Your products haven't been added to a buyer's favourites list yet."
          />
        </section>
      ) : (
        <section className="grid gap-3 md:grid-cols-2">
          {rows.map((row) => (
            <div key={row.id} className="surface-card flex items-center gap-4 p-4">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-1 ring-line">
                <Image
                  src={row.user?.image ? `/uploads/profile/${row.user.image}` : '/avatar-fallback.png'}
                  alt={row.user?.username ?? 'buyer'}
                  fill sizes="44px" className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">
                  {row.user?.name || row.user?.username || 'A buyer'}
                </p>
                <p className="truncate text-xs text-ink-muted">
                  saved{' '}
                  {row.post ? (
                    <Link href={`/ads/${row.post.id}-${row.post.slug ?? 'ad'}` as Route} className="text-brand-700 hover:underline">
                      {row.post.product_name}
                    </Link>
                  ) : 'a product'}
                </p>
              </div>
              {row.post && (
                <span className="rounded-pill bg-brand-50 px-3 py-1 text-xs font-bold text-brand-800">
                  ৳{row.post.price}
                </span>
              )}
            </div>
          ))}
        </section>
      )}
    </>
  );
}
