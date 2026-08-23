import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { ShoppingBag, MessageSquare, Heart, User as UserIcon, ArrowRight, PackageOpen, ClipboardList, Clock3 } from 'lucide-react';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { requireUser } from '@/lib/session';
import { apiFromServer, ApiError } from '@/lib/api';
import type { Thread } from '@/types/api';
import { EmptyState } from '@/components/ui/EmptyState';
import { PublicProfileEditor } from '@/components/dashboard/PublicProfileEditor';
import { PriceTag } from '@/components/ui/PriceTag';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = { title: 'My Dashboard' };
export const dynamic = 'force-dynamic';

type Purchase = {
  id: number;
  product?: { product_name: string; slug: string; price: number; screen_shot?: string | null };
  product_image?: string | null;
  seller?: { id: number; username: string; name: string };
  transaction?: { status: string; amount: number; created_at: string };
  shipping_status: string;
  amount: number;
  created_at: string;
};

type Favourite = { id: number; product?: { id: number; product_name: string; slug: string; price: number; screen_shot?: string | null } };

type MyAd = {
  id: number;
  title: string;
  url_slug: string;
  status: string;
  price: number;
  thumbnail?: string | null;
};

const FALLBACK_PURCHASES: Purchase[] = [];
const FALLBACK_FAVOURITES: Favourite[] = [];
const FALLBACK_ADS: MyAd[] = [];

async function safe<T>(fn: () => Promise<T>, fb: T): Promise<T> {
  try { return await fn(); } catch (e) { if (e instanceof ApiError) return fb; throw e; }
}

export default async function BuyerDashboardPage() {
  const user = await requireUser('/dashboard');

  // Role-aware: admins → admin panel, sellers → shop panel. This page is the
  // lightweight personal dashboard for regular buyers.
  if (user.is_admin || user.user_type === 'admin') redirect('/admin');
  if (user.is_shop || user.user_type === 'seller') redirect('/shop');

  const [purchases, favourites, threads, pendingAds, activeAds] = await Promise.all([
    safe(() => apiFromServer<Purchase[]>('/me/purchases?per_page=5', { cache: 'no-store' }).then(r => r.data), FALLBACK_PURCHASES),
    safe(() => apiFromServer<Favourite[]>('/me/favourites?per_page=5', { cache: 'no-store' }).then(r => r.data), FALLBACK_FAVOURITES),
    safe(() => apiFromServer<Thread[]>('/me/threads?limit=5', { cache: 'no-store' }).then(r => r.data), []),
    safe(() => apiFromServer<MyAd[]>('/me/ads?status=pending&per_page=5', { cache: 'no-store' }).then(r => r.data), FALLBACK_ADS),
    safe(() => apiFromServer<MyAd[]>('/me/ads?status=active&per_page=5', { cache: 'no-store' }).then(r => r.data), FALLBACK_ADS),
  ]);

  const unread = threads.reduce((n, t) => n + (t.unread_count ?? 0), 0);

  // My listings = active (approved, live on public pages) + pending (awaiting
  // admin review). Sorted newest first.
  const listings = [...activeAds, ...pendingAds];

  const statusLabel = (s: string) => ({
    pending: 'Pending', processing: 'Processing', shipped: 'Shipped',
    delivered: 'Delivered', cancelled: 'Cancelled',
  }[s] ?? s);

  return (
    <>
      <Header variant="default" user={user} />
      <HeaderSpacer />
      <main className="container-page py-10">
        {/* Greeting */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink">Hi, {user.name} 👋</h1>
            <p className="mt-1 text-sm text-ink-muted">Here is your purchase activity, messages and saved items.</p>
          </div>
          <Link href={`/store/${user.username}` as Route} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700">
            <UserIcon size={16} /> View my profile
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Quick stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-4">
            {[
              { icon: <PackageOpen size={18} />, label: 'Listings', value: pendingAds.length + activeAds.length },
              { icon: <Clock3 size={18} />, label: 'Pending review', value: pendingAds.length, tone: 'text-amber-600' as const },
              { icon: <Heart size={18} />, label: 'Saved', value: favourites.length },
              { icon: <ClipboardList size={18} />, label: 'Unread messages', value: unread },
            ].map((s) => (
              <div key={s.label} className="surface-card flex items-center gap-3 p-4">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 ${s.tone ?? 'text-brand-700'}`}>
                  {s.icon}
                </span>
                <div>
                  <p className="text-2xl font-bold leading-none text-ink">{s.value}</p>
                  <p className="mt-1 text-xs text-ink-muted">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* My listings (active + under review) */}
          <section className="surface-card p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
                <PackageOpen size={18} className="text-brand-600" /> My listings
              </h2>
            </div>
            {listings.length === 0 ? (
              <EmptyState
                className="mt-4"
                icon={<PackageOpen size={24} />}
                title="No listings yet"
                description="Products you post will appear here."
                action={<Link href={'/post/product' as Route}><button className="inline-flex items-center gap-1 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">Post a product</button></Link>}
              />
            ) : (
              <ul className="mt-4 divide-y divide-line">
                {listings.map(a => (
                  <li key={a.id} className="flex items-center gap-4 py-4">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-surface-muted">
                      {a.thumbnail ? (
                        <img src={a.thumbnail} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-ink-faint text-xs">img</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      {a.status === 'active' ? (
                        <Link href={`/ads/${a.url_slug}` as Route} target="_blank" rel="noopener noreferrer"
                              className="block truncate text-sm font-semibold text-ink hover:text-brand-600">
                          {a.title}
                        </Link>
                      ) : (
                        <span className="block truncate text-sm font-semibold text-ink">{a.title}</span>
                      )}
                      <div className="mt-0.5 text-xs text-ink-muted">
                        <PriceTag amount={a.price} />
                        {a.status === 'active' ? ' · Live on marketplace' : ' · awaiting admin review'}
                      </div>
                    </div>
                    {a.status === 'active' ? (
                      <Badge tone="success">Approved</Badge>
                    ) : (
                      <Badge tone="urgent">Pending review</Badge>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Right column — Messages + Saved, fills space beside My listings */}
          <div className="flex flex-col gap-6">
            {/* Messages */}
            <section className="surface-card p-6">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
                  <MessageSquare size={18} className="text-brand-600" /> Messages
                </h2>
                {unread > 0 && <Badge tone="urgent">{unread} new</Badge>}
              </div>
              <Link href={'/messages' as Route} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700">
                Open inbox <ArrowRight size={14} />
              </Link>
            </section>

            {/* Favourites */}
            <section className="surface-card p-6">
              <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
                <Heart size={18} className="text-brand-600" /> Saved items
              </h2>
              {favourites.length === 0 ? (
                <p className="mt-3 text-sm text-ink-muted">Nothing saved yet.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {favourites.map(f => (
                    <li key={f.id}>
                      {f.product && (
                        <Link href={`/ads/${f.product.slug}` as Route} className="block truncate text-sm font-medium text-ink hover:text-brand-600">
                          {f.product.product_name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Purchases — full row below My listings + Messages */}
          <section className="surface-card p-6 lg:col-span-3">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
                <ShoppingBag size={18} className="text-brand-600" /> My purchases
              </h2>
            </div>
            {purchases.length === 0 ? (
              <EmptyState
                className="mt-4"
                icon={<ShoppingBag size={24} />}
                title="No purchases yet"
                description="Items you buy will show up here with their delivery status."
                action={<Link href={'/' as Route}><button className="inline-flex items-center gap-1 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">Browse products</button></Link>}
              />
            ) : (
              <ul className="mt-4 divide-y divide-line">
                {purchases.map(p => (
                  <li key={p.id} className="flex items-center gap-4 py-4">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-surface-muted">
                      {p.product_image ? (
                        <img src={p.product_image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-ink-faint text-xs">img</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      {p.product ? (
                        <Link href={`/ads/${p.product.slug}` as Route} className="block truncate text-sm font-semibold text-ink hover:text-brand-600">
                          {p.product.product_name}
                        </Link>
                      ) : (
                        <p className="text-sm font-semibold text-ink">Order #{p.id}</p>
                      )}
                      <div className="mt-0.5 text-xs text-ink-muted">
                        from {p.seller?.name ?? 'seller'} · <PriceTag amount={p.transaction?.amount ?? p.amount} />
                      </div>
                    </div>
                    <Badge tone="muted">{statusLabel(p.shipping_status)}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <PublicProfileEditor user={user} />
        </div>
      </main>
    </>
  );
}