import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import {
  Package, DollarSign, MessageSquare, Heart,
  CircleCheckBig, Clock, DollarSign as DollarIcon, Trash2, FileEdit,
  ImageUp, Camera,
} from 'lucide-react';
import { requireUser } from '@/lib/session';
import { apiFromServer } from '@/lib/api';
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
  views_count?: number;
  ads: { total: number; active: number; pending: number; sold_out: number; removed: number; draft: number; expire: number; rejected: number };
  sales_series: { date: string; total: number }[];
  views_series: { date: string; total: number }[];
};

const FALLBACK: ShopStats = {
  store: { rating: 0, reviews_count: 0, total_orders: 0, active_orders: 0 },
  sales_this_month: 0, wishlist_count: 0, views_count: 0,
  ads: { total: 0, active: 0, pending: 0, sold_out: 0, removed: 0, draft: 0, expire: 0, rejected: 0 },
  sales_series: [], views_series: [],
};

async function safe<T>(fn: () => Promise<T>, fb: T): Promise<T> {
  try { return await fn(); } catch { return fb; }
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

      {/* ── Store hero (banner + avatar + identity + KPI strip) ── */}
      <StoreHero
        user={user}
        rating={stats.store.rating}
        reviewsCount={stats.store.reviews_count}
        totalOrders={stats.store.total_orders}
        activeOrders={stats.store.active_orders}
        wishlistCount={stats.wishlist_count}
        viewsCount={stats.views_count ?? 0}
      />

      {/* ── Row 1: Performance KPIs ── */}
      <section className="mt-6">
        <SectionTitle title="Performance" hint="Sales and engagement this month" />
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Sales this month"   value={stats.sales_this_month}  icon={<DollarSign size={17} />}    tone="brand" currency sparkline={spark} />
          <StatCard label="Total products"     value={stats.ads.total}         icon={<Package size={17} />}       tone="accent" />
          <StatCard label="Wishlisted by users"value={stats.wishlist_count}    icon={<Heart size={17} />}         tone="success" />
          <StatCard label="Orders received"    value={stats.store.total_orders} icon={<MessageSquare size={17} />} tone="info" />
        </div>
      </section>

      {/* ── Row 2: sales chart + buyer messages ── */}
      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SalesPanel series={stats.sales_series} />
        </div>
        <div className="lg:col-span-2">
          <MessagesWidget />
        </div>
      </section>

      {/* ── Row 3: listings by status ── */}
      <section className="mt-6">
        <SectionTitle
          title="Your listings by status"
          hint="Manage and revisit the lifecycle of every product"
        />
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <StatusCard href="/shop/ads"          label="All Products" value={stats.ads.total}    icon={<Package size={15} />}        tone="brand" />
          <StatusCard href="/shop/ads/active"   label="Active"     value={stats.ads.active}   icon={<CircleCheckBig size={15} />} tone="success" />
          <StatusCard href="/shop/ads/pending"  label="Pending"    value={stats.ads.pending}  icon={<Clock size={15} />}          tone="warning" />
          <StatusCard href="/shop/ads/sold-out" label="Sold Out"   value={stats.ads.sold_out} icon={<DollarIcon size={15} />}     tone="danger" />
          <StatusCard href="/shop/ads/removed"  label="Removed"    value={stats.ads.removed}  icon={<Trash2 size={15} />}         tone="muted" />
          <StatusCard href="/shop/ads/drafts"   label="Drafts"     value={stats.ads.draft}    icon={<FileEdit size={15} />}       tone="muted" />
        </div>
      </section>

      {/* ── Row 4: profile media + plan upsell ── */}
      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ProfileMediaCard user={user} />
        </div>
        <div className="lg:col-span-2">
          <MarketingCard hasActivePlan={Boolean(user.group_id)} />
        </div>
      </section>
    </>
  );
}

function SectionTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <h3
          className="text-[14px] font-semibold tracking-tight"
          style={{ color: 'var(--shp-fg)' }}
        >
          {title}
        </h3>
        {hint && (
          <p className="mt-0.5 text-[12px]" style={{ color: 'var(--shp-fg-faint)' }}>
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

function ProfileMediaCard({ user }: { user: { avatar_set?: boolean; avatar_url?: string; cover_url?: string | null } }) {
  return (
    <section
      className="rounded-xl border p-4"
      style={{ background: 'var(--shp-surface)', borderColor: 'var(--shp-border)', boxShadow: 'var(--shp-shadow-sm)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[14px] font-semibold" style={{ color: 'var(--shp-fg)' }}>
            Profile media
          </h3>
          <p className="mt-0.5 text-[11.5px]" style={{ color: 'var(--shp-fg-faint)' }}>
            Photo and cover shown on your public store.
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <MediaTile
          href={'/shop/profile' as Route}
          label="Profile photo"
          hasMedia={Boolean(user.avatar_set)}
          icon={<Camera size={14} />}
        />
        <MediaTile
          href={'/shop/profile' as Route}
          label="Cover"
          hasMedia={Boolean(user.cover_url)}
          icon={<ImageUp size={14} />}
        />
      </div>
    </section>
  );
}

function MediaTile({
  href, label, hasMedia, icon,
}: { href: Route; label: string; hasMedia: boolean; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-2.5 rounded-lg border px-3 py-2.5 transition hover:shadow-[var(--shp-shadow-md)]"
      style={{ borderColor: 'var(--shp-border)', background: 'var(--shp-bg)' }}
    >
      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-md"
        style={{
          background: hasMedia ? 'var(--shp-success-soft)' : 'var(--shp-brand-soft)',
          color:      hasMedia ? 'var(--shp-success)'      : 'var(--shp-brand)',
        }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-[12.5px] font-semibold" style={{ color: 'var(--shp-fg)' }}>
          {label}
        </p>
        <p className="truncate text-[10.5px]" style={{ color: 'var(--shp-fg-faint)' }}>
          {hasMedia ? 'Uploaded' : 'Not set'}
        </p>
      </div>
    </Link>
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
      className="group rounded-xl border p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shp-shadow-md)]"
      style={{ background: 'var(--shp-surface)', borderColor: 'var(--shp-border)', boxShadow: 'var(--shp-shadow-sm)' }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span
          className="grid h-8 w-8 place-items-center rounded-md transition group-hover:scale-105"
          style={{ background: bg[tone], color: fg[tone] }}
        >
          {icon}
        </span>
        {value > 0 && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums"
            style={{ background: 'var(--shp-bg)', color: 'var(--shp-fg-muted)' }}
          >
            {new Intl.NumberFormat('en-IN').format(value)}
          </span>
        )}
      </div>
      <p
        className="text-[10.5px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: 'var(--shp-fg-faint)' }}
      >
        {label}
      </p>
      <p className="mt-0.5 text-xl font-bold tabular-nums" style={{ color: 'var(--shp-fg)' }}>
        {value}
      </p>
    </Link>
  );
}
