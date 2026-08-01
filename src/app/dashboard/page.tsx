import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import type { Route } from 'next';
import { redirect } from 'next/navigation';
import { Heart, MessageSquare, Receipt, Settings, Crown, PlusSquare, ShoppingBag } from 'lucide-react';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { requireUser } from '@/lib/session';
import { apiFromServer, ApiError } from '@/lib/api';

export const metadata: Metadata = { title: 'My Dashboard' };
export const dynamic = 'force-dynamic';

/**
 * Buyer dashboard — for users who haven't posted any ads yet.
 *
 * Layout matches Figma screen 2: a profile card (avatar + name +
 * membership) followed by two quick-count cards (Favourites, My Listings)
 * and a "This Month Views" area chart placeholder.
 *
 * The moment a buyer posts their first ad the backend flips `is_shop=true`
 * on /auth/me and we redirect them to the full /shop dashboard instead.
 */
export default async function BuyerDashboardPage() {
  const user = await requireUser('/dashboard');
  if (user.is_shop) redirect('/shop');

  const [favs, threads, txs] = await Promise.all([
    safe(() => apiFromServer<unknown[]>('/me/favourites?per_page=1', { cache: 'no-store' })),
    safe(() => apiFromServer<{ unread: number } | unknown[]>('/me/threads?per_page=1', { cache: 'no-store' })),
    safe(() => apiFromServer<unknown[]>('/me/transactions?per_page=1', { cache: 'no-store' })),
  ]);

  const favCount    = (favs?.meta as { total?: number } | undefined)?.total ?? 0;
  const threadCount = (threads?.meta as { total?: number } | undefined)?.total ?? 0;
  const txCount     = (txs?.meta as { total?: number } | undefined)?.total ?? 0;

  return (
    <>
      <Header variant="default" user={user} />
      <HeaderSpacer />
      <main className="container-page py-8">
        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
          {/* Simple buyer sidebar */}
          <aside className="md:sticky md:top-6 md:self-start">
            <nav className="surface-card flex flex-col gap-1 p-3">
              <SideLink href="/dashboard"          icon={<Heart size={16} />}       label="Overview" />
              <SideLink href="/shop/favourites"    icon={<Heart size={16} />}       label="Favourites" count={favCount} />
              <SideLink href="/shop/messages"      icon={<MessageSquare size={16} />} label="Messages"   count={threadCount} />
              <SideLink href="/shop/transactions"  icon={<Receipt size={16} />}     label="Orders"     count={txCount} />
              <SideLink href="/shop/plan"          icon={<Crown size={16} />}       label="Membership" />
              <SideLink href="/shop/settings"      icon={<Settings size={16} />}    label="Settings" />
            </nav>
            <div className="mt-4 rounded-lg border border-brand-100 bg-brand-50 p-4 text-center">
              <p className="text-sm font-semibold text-brand-800">Have something to sell?</p>
              <p className="mt-1 text-xs text-brand-700">Post your first ad and unlock the full Shop Dashboard.</p>
              <Link href={'/shop/ads/new' as Route} className="mt-3 inline-flex items-center gap-2 rounded-pill bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800">
                <PlusSquare size={14} /> Post an ad
              </Link>
            </div>
          </aside>

          <section className="min-w-0 space-y-6">
            {/* Profile banner */}
            <div className="surface-card flex items-center gap-4 p-6">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-brand-100">
                <Image src={user.avatar_url || '/avatar-fallback.png'} alt={user.username} fill sizes="64px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold text-ink">{user.name || user.username}</h1>
                <p className="text-sm text-ink-muted">
                  <span className="rounded-pill bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-800">Free Plan</span>
                  <span className="ml-2 font-mono text-xs">@{user.username}</span>
                </p>
              </div>
              <Link href={'/shop/plan' as Route} className="contents">
                <button className="rounded-pill bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800">
                  Upgrade
                </button>
              </Link>
            </div>

            {/* Two KPI cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <KpiCard icon={<Heart size={20} />}       label="Favourite Listings" value={favCount}    href="/shop/favourites" />
              <KpiCard icon={<ShoppingBag size={20} />} label="Order History"      value={txCount}     href="/shop/transactions" />
            </div>

            {/* Views placeholder card */}
            <div className="surface-card p-6">
              <h3 className="text-sm font-semibold text-ink">📈 Recent activity</h3>
              <p className="mt-1 text-xs text-ink-muted">Your saves, messages, and orders will show up here.</p>
              <div className="mt-6 flex h-40 items-center justify-center rounded-lg bg-brand-50 text-sm text-ink-muted">
                Nothing to show yet — start browsing to see activity!
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

async function safe<T>(fn: () => Promise<{ data: T; meta?: unknown }>) {
  try { return await fn(); } catch (e) { if (e instanceof ApiError) return null; throw e; }
}

function SideLink({ href, icon, label, count }: { href: string; icon: React.ReactNode; label: string; count?: number }) {
  return (
    <Link href={href as Route} className="flex items-center gap-3 rounded-pill px-3 h-10 text-sm font-medium text-ink hover:bg-brand-50">
      <span className="text-brand-500">{icon}</span>
      <span className="flex-1">{label}</span>
      {typeof count === 'number' && count > 0 && (
        <span className="inline-flex min-w-5 items-center justify-center rounded-pill bg-brand-100 px-2 text-xs font-semibold text-brand-800">{count}</span>
      )}
    </Link>
  );
}

function KpiCard({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: number; href: string }) {
  return (
    <Link href={href as Route} className="surface-card group block p-5 transition hover:shadow-sm">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 group-hover:bg-brand-100">
          {icon}
        </span>
        <div>
          <p className="text-xs uppercase tracking-widest text-ink-muted">{label}</p>
          <p className="mt-0.5 text-2xl font-bold text-ink">{value}</p>
        </div>
      </div>
    </Link>
  );
}
