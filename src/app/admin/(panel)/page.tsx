import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import {
  Users, PackageCheck, Wallet, ShoppingBag, ArrowRight,
} from 'lucide-react';
import { apiFromServer, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/admin/v2/PageHeader';
import { StatCard } from '@/components/admin/v2/StatCard';
import { RevenueChart } from '@/components/admin/v2/RevenueChart';
import { CategoryDonut } from '@/components/admin/v2/CategoryDonut';
import { TopCategoriesBar } from '@/components/admin/v2/TopCategoriesBar';
import { ActivityFeed, type ActivityEvent } from '@/components/admin/v2/ActivityFeed';
import { DataTableV2, type ColumnV2 } from '@/components/admin/v2/DataTableV2';
import { StatusBadge } from '@/components/admin/v2/StatusBadge';
import type { AdminDashboardData, AdminRecentAd, AdminRecentUser, AdminRecentTx, TrendPoint } from '@/types/admin';

export const metadata: Metadata = { title: 'Dashboard' };

const FALLBACK: AdminDashboardData = {
  counts: { users: 0, ads_total: 0, ads_active: 0, ads_pending: 0, ads_expired: 0, tx_total: 0, tx_success: 0, revenue_total: 0 },
  trend:  { users_delta: 0, ads_delta: 0, revenue_delta: 0, tx_delta: 0 },
  recent: { ads: [], users: [], transactions: [] },
  revenue_series: { '7D': [], '30D': [], '90D': [], '1Y': [] },
  category_breakdown: [],
  top_categories: [],
  user_growth: [],
};

async function safe<T>(fn: () => Promise<T>, fb: T): Promise<T> {
  try { return await fn(); } catch (e) { if (e instanceof ApiError) return fb; throw e; }
}

export default async function AdminDashboardPage() {
  const res = await safe(
    () => apiFromServer<AdminDashboardData>('/admin/dashboard', { cache: 'no-store' }),
    { data: FALLBACK },
  );
  const d = res.data;
  const rev = d.revenue_series ?? FALLBACK.revenue_series!;
  const sparkFrom = (series: TrendPoint[]) => series.slice(-14).map((p) => p.total);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Welcome back — here's what's happening on eSawda today.`}
        actions={
          <Link
            href={'/admin/transactions' as Route}
            className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-[12.5px] font-semibold transition hover:opacity-80"
            style={{ borderColor: 'var(--adm-border)', color: 'var(--adm-fg)' }}
          >
            View reports <ArrowRight size={14} />
          </Link>
        }
      />

      {/* ── Row 1: KPI cards ── */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total users"    value={d.counts.users}         delta={d.trend?.users_delta}
          icon={<Users size={17} />}       tone="info"
          sparkline={sparkFrom(d.user_growth ?? [])}
        />
        <StatCard
          label="Active ads"     value={d.counts.ads_active}    delta={d.trend?.ads_delta}
          icon={<PackageCheck size={17} />} tone="warning"
          sparkline={sparkFrom(rev['30D'] ?? [])}
        />
        <StatCard
          label="Revenue"        value={d.counts.revenue_total} delta={d.trend?.revenue_delta}
          icon={<Wallet size={17} />}      tone="brand"
          currency emphasis="hero"
          sparkline={(rev['30D'] ?? []).map((p) => p.total)}
        />
        <StatCard
          label="Transactions"   value={d.counts.tx_total}      delta={d.trend?.tx_delta}
          icon={<ShoppingBag size={17} />} tone="success"
          sparkline={sparkFrom(rev['30D'] ?? [])}
        />
      </section>

      {/* ── Row 2: Revenue chart + category donut ── */}
      <section className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RevenueChart series={rev} />
        </div>
        <div className="lg:col-span-2">
          <CategoryDonut data={d.category_breakdown ?? []} />
        </div>
      </section>

      {/* ── Row 3: User growth + top categories + activity feed ── */}
      <section className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <TopCategoriesBar data={d.top_categories ?? []} />
        </div>
        <div className="lg:col-span-1">
          <UserGrowthCard series={d.user_growth ?? []} />
        </div>
        <div className="lg:col-span-1">
          <ActivityFeed events={buildActivityFeed(d)} />
        </div>
      </section>

      {/* ── Row 4: Latest ads + Latest users ── */}
      <section className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <LatestAdsTable rows={d.recent.ads} />
        <LatestUsersTable rows={d.recent.users} />
      </section>

      {/* ── Row 5: Latest transactions (full width) ── */}
      <section className="mt-5">
        <LatestTransactionsTable rows={d.recent.transactions} />
      </section>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────── */

function LatestAdsTable({ rows }: { rows: AdminRecentAd[] }) {
  const cols: ColumnV2<AdminRecentAd>[] = [
    { key: 'title',  header: 'Title',   render: (r) => <span className="font-medium">{r.product_name || '—'}</span> },
    { key: 'status', header: 'Status',  render: (r) => <StatusBadge value={r.status} /> },
    { key: 'price',  header: 'Price',   align: 'right', render: (r) => <span className="tabular-nums">৳{new Intl.NumberFormat('en-IN').format(r.price ?? 0)}</span> },
  ];
  return (
    <DataTableV2
      title="Latest ads"
      description="Newly posted listings across all categories"
      viewAllHref="/admin/ads"
      rows={rows}
      columns={cols}
      emptyTitle="No ads yet"
      emptyDescription="New listings will appear here as sellers post them."
    />
  );
}

function LatestUsersTable({ rows }: { rows: AdminRecentUser[] }) {
  const cols: ColumnV2<AdminRecentUser>[] = [
    { key: 'user',   header: 'User',     render: (r) => (
      <div className="flex items-center gap-2.5">
        <span
          className="grid h-7 w-7 place-items-center rounded-full text-[10px] font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #FF003F 0%, #4F46E5 100%)' }}
        >
          {r.username.slice(0, 2).toUpperCase()}
        </span>
        <div>
          <p className="font-medium">{r.username}</p>
          <p className="text-[11px]" style={{ color: 'var(--adm-fg-faint)' }}>{r.email}</p>
        </div>
      </div>
    )},
    { key: 'type',   header: 'Type',   render: (r) => <span className="capitalize">{r.user_type}</span> },
    { key: 'status', header: 'Status', align: 'right', render: (r) => <StatusBadge value={r.status === '1' ? 'active' : 'expired'} /> },
  ];
  return (
    <DataTableV2
      title="Latest users"
      description="Recent signups on the platform"
      viewAllHref="/admin/users"
      rows={rows}
      columns={cols}
      emptyTitle="No users yet"
      emptyDescription="Sign-ups will appear here."
    />
  );
}

function LatestTransactionsTable({ rows }: { rows: AdminRecentTx[] }) {
  const cols: ColumnV2<AdminRecentTx>[] = [
    { key: 'id',     header: '#',       render: (r) => <span className="font-mono text-[11px]" style={{ color: 'var(--adm-fg-faint)' }}>TX-{r.id}</span> },
    { key: 'name',   header: 'Purpose', render: (r) => <span className="font-medium">{r.product_name || 'Unnamed'}</span> },
    { key: 'gw',     header: 'Gateway', render: (r) => <span className="capitalize">{r.transaction_gatway}</span> },
    { key: 'amt',    header: 'Amount',  align: 'right', render: (r) => <span className="tabular-nums font-semibold">৳{new Intl.NumberFormat('en-IN').format(r.amount)}</span> },
    { key: 'status', header: 'Status',  align: 'right', render: (r) => <StatusBadge value={r.status} /> },
  ];
  return (
    <DataTableV2
      title="Latest transactions"
      description="All SSLCommerz payment activity"
      viewAllHref="/admin/transactions"
      rows={rows}
      columns={cols}
      emptyTitle="No transactions yet"
      emptyDescription="Successful and pending payments will show up here."
    />
  );
}

/* Minimal card wrapping the cumulative-signup line via RevenueChart's
   sibling look. Kept inline because it's a one-off variant. */
function UserGrowthCard({ series }: { series: TrendPoint[] }) {
  const total = series.at(-1)?.total ?? 0;
  return (
    <section
      className="rounded-xl border p-5"
      style={{ background: 'var(--adm-surface)', borderColor: 'var(--adm-border)', boxShadow: 'var(--adm-shadow-sm)' }}
    >
      <header className="mb-2">
        <h2 className="text-[15px] font-semibold" style={{ color: 'var(--adm-fg)' }}>User growth</h2>
        <p className="mt-0.5 text-xs" style={{ color: 'var(--adm-fg-muted)' }}>Cumulative signups · 30 days</p>
      </header>
      <p className="mb-3 text-2xl font-bold tabular-nums" style={{ color: 'var(--adm-fg)' }}>
        {new Intl.NumberFormat('en-IN').format(total)}
      </p>
      <div className="flex h-24 items-end gap-1">
        {series.slice(-30).map((p, i) => {
          const max = Math.max(...series.map((s) => s.total), 1);
          const h = Math.max(4, (p.total / max) * 100);
          return (
            <div
              key={i}
              title={`${p.date}: ${p.total}`}
              className="flex-1 rounded-sm transition-all"
              style={{
                height: `${h}%`,
                background: 'linear-gradient(180deg, #4F46E5, #6366F1)',
                opacity: 0.5 + (i / series.length) * 0.5,
              }}
            />
          );
        })}
      </div>
    </section>
  );
}

function buildActivityFeed(d: AdminDashboardData): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  d.recent.ads.slice(0, 3).forEach((a) => events.push({
    id: `a-${a.id}`, kind: 'ad',
    title: `New ad "${a.product_name}" posted`,
    meta: `৳${new Intl.NumberFormat('en-IN').format(a.price ?? 0)}`,
    at: a.created_at ?? new Date().toISOString(),
  }));
  d.recent.users.slice(0, 3).forEach((u) => events.push({
    id: `u-${u.id}`, kind: 'user',
    title: `${u.username} joined the platform`,
    meta: u.email,
    at: u.created_at ?? new Date().toISOString(),
  }));
  d.recent.transactions.slice(0, 3).forEach((t) => events.push({
    id: `t-${t.id}`, kind: 'tx',
    title: `Transaction TX-${t.id} ${t.status}`,
    meta: `৳${new Intl.NumberFormat('en-IN').format(t.amount)}`,
    at: t.created_at ?? new Date().toISOString(),
  }));
  return events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 8);
}
