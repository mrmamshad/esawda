import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import {
  Package, DollarSign, MessageSquare, Heart,
  CircleCheckBig, Clock, DollarSign as DollarIcon, Trash2, FileEdit,
} from 'lucide-react';
import { requireUser } from '@/lib/session';
import { apiFromServer, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/shop/v2/PageHeader';
import { StoreHero } from '@/components/shop/v2/StoreHero';
import { ProfileMediaUpload } from '@/components/shop/v2/ProfileMediaUpload';
import { StatCard } from '@/components/shop/v2/StatCard';
import { SalesPanel } from '@/components/shop/v2/SalesPanel';
import { MessagesWidget } from '@/components/shop/v2/MessagesWidget';
import { MarketingCard } from '@/components/shop/v2/MarketingCard';

export const metadata: Metadata = { title: 'Shop Dashboard' };
export const dynamic = 'force-dynamic';

type ShopStats = {
  store: { rating: number; reviews_count: number; total_orders: number; active_orders: number };
  sales_this_month: number;
  wishlist_count: number;
  ads: { total: number; active: number; pending: number; sold_out: number; removed: number; draft: number; expire: number; rejected: number };
  sales_series: { date: string; total: number }[];
  views_series: { date: string; total: number }[];
};

const FALLBACK: ShopStats = {
  store: { rating: 0, reviews_count: 0, total_orders: 0, active_orders: 0 },
  sales_this_month: 0, wishlist_count: 0,
  ads: { total: 0, active: 0, pending: 0, sold_out: 0, removed: 0, draft: 0, expire: 0, rejected: 0 },
  sales_series: [], views_series: [],
};

async function safe<T>(fn: () => Promise<T>, fb: T): Promise<T> {
  try { return await fn(); } catch (e) { if (e instanceof ApiError) return fb; throw e; }
}

export default async function ShopDashboardPage() {
  const user  = await requireUser('/shop');
  const res   = await safe(() => apiFromServer<ShopStats>('/me/shop/stats', { cache: 'no-store' }), { data: FALLBACK });
  const stats = res.data;
  const spark = stats.sales_series.slice(-14).map((p) => p.total);

  return (
    <>
      <PageHeader
        title="Shop Dashboard"
        description={`Welcome back, ${user.name || user.username} — here is what is happening in your store.`}
      />

      {/* ── Store hero banner ── */}
      <StoreHero
        user={user}
        rating={stats.store.rating}
        reviewsCount={stats.store.reviews_count}
        totalOrders={stats.store.total_orders}
        activeOrders={stats.store.active_orders}
      />

      {/* ── Profile media (photo + cover) ── */}
      <section className="mt-5">
        <ProfileMediaUpload user={user} />
      </section>

      {/* ── Row 1: KPI cards ── */}
      <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total products"    value={stats.ads.total}         icon={<Package size={17} />}       tone="brand" sparkline={spark} />
        <StatCard label="Sales this month"   value={stats.sales_this_month}  icon={<DollarSign size={17} />}    tone="accent" currency sparkline={spark} />
        <StatCard label="Wishlisted by users"value={stats.wishlist_count}    icon={<Heart size={17} />}         tone="success" />
        <StatCard label="Orders received"    value={stats.store.total_orders} icon={<MessageSquare size={17} />} tone="info" />
      </section>

      {/* ── Row 2: sales chart + buyer messages ── */}
      <section className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SalesPanel series={stats.sales_series} />
        </div>
        <div className="lg:col-span-2">
          <MessagesWidget />
        </div>
      </section>

      {/* ── Row 3: marketing / plan upsell ── */}
      <section className="mt-5">
        <MarketingCard hasActivePlan={Boolean(user.group_id)} />
      </section>

      {/* ── Row 4: ad-status navigation grid ── */}
      <section className="mt-5">
        <h3 className="mb-3 text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--shp-fg-faint)' }}>
          Your listings by status
        </h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <StatusCard href="/shop/ads"          label="All Products" value={stats.ads.total}    icon={<Package size={15} />}        tone="brand" />
          <StatusCard href="/shop/ads/active"   label="Active"     value={stats.ads.active}   icon={<CircleCheckBig size={15} />} tone="success" />
          <StatusCard href="/shop/ads/pending"  label="Pending"    value={stats.ads.pending}  icon={<Clock size={15} />}          tone="warning" />
          <StatusCard href="/shop/ads/sold-out" label="Sold Out"   value={stats.ads.sold_out} icon={<DollarIcon size={15} />}     tone="danger" />
          <StatusCard href="/shop/ads/removed"  label="Removed"    value={stats.ads.removed}  icon={<Trash2 size={15} />}         tone="muted" />
          <StatusCard href="/shop/ads/drafts"   label="Drafts"     value={stats.ads.draft}    icon={<FileEdit size={15} />}       tone="muted" />
        </div>
      </section>
    </>
  );
}

function StatusCard({
  href, label, value, icon, tone,
}: { href: string; label: string; value: number; icon: React.ReactNode; tone: 'brand' | 'success' | 'warning' | 'danger' | 'muted' }) {
  const bg: Record<string, string> = {
    brand:   'var(--shp-brand-soft)',   success: 'var(--shp-success-soft)',
    warning: 'var(--shp-warning-soft)', danger:  'var(--shp-danger-soft)',
    muted:   'var(--shp-bg)',
  };
  const fg: Record<string, string> = {
    brand:   'var(--shp-brand)',   success: 'var(--shp-success)',
    warning: 'var(--shp-warning)', danger:  'var(--shp-danger)',
    muted:   'var(--shp-fg-muted)',
  };
  return (
    <Link
      href={href as Route}
      className="rounded-xl border p-4 transition hover:shadow-[var(--shp-shadow-md)]"
      style={{ background: 'var(--shp-surface)', borderColor: 'var(--shp-border)', boxShadow: 'var(--shp-shadow-sm)' }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span
          className="grid h-8 w-8 place-items-center rounded-md"
          style={{ background: bg[tone], color: fg[tone] }}
        >
          {icon}
        </span>
      </div>
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--shp-fg-faint)' }}>
        {label}
      </p>
      <p className="mt-0.5 text-xl font-bold tabular-nums" style={{ color: 'var(--shp-fg)' }}>
        {value}
      </p>
    </Link>
  );
}
