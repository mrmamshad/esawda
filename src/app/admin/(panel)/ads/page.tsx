import type { Metadata } from 'next';
import { apiFromServer, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/admin/v2/PageHeader';
import { AdsTableClient, type AdminAdRow } from './AdsTableClient';

export const metadata: Metadata = { title: 'Products' };
export const dynamic = 'force-dynamic';

const STATUS_TABS = [
  { key: '',         label: 'All' },
  { key: 'pending',  label: 'Pending' },
  { key: 'active',   label: 'Active' },
  { key: 'sold_out', label: 'Sold Out' },
  { key: 'removed',  label: 'Removed' },
  { key: 'draft',    label: 'Drafts' },
  { key: 'expire',   label: 'Expired' },
];

const CONDITION_TABS = [
  { key: '',     label: 'Any' },
  { key: 'new',  label: 'Brand New' },
  { key: 'used', label: 'Used' },
];

async function safe<T>(fn: () => Promise<T>, fb: T): Promise<T> {
  try { return await fn(); } catch (e) { if (e instanceof ApiError) return fb; throw e; }
}

export default async function AdminAdsPage({
  searchParams,
}: { searchParams: Promise<{ status?: string; q?: string; page?: string; condition?: string }> }) {
  const { status = '', page = '1', condition = '' } = await searchParams;

  const qs = new URLSearchParams({ per_page: '50', page });
  if (status)    qs.set('status',    status);
  if (condition) qs.set('condition', condition);

  const res = await safe(
    () => apiFromServer<AdminAdRow[]>(`/admin/ads?${qs.toString()}`, { cache: 'no-store' }),
    { data: [] as AdminAdRow[] },
  );
  const rows: AdminAdRow[] = Array.isArray(res.data)
    ? res.data
    : ((res.data as unknown as { data: AdminAdRow[] }).data ?? []);

  const buildHref = (nextStatus?: string, nextCondition?: string) => {
    const p = new URLSearchParams();
    const s = nextStatus    ?? status;
    const c = nextCondition ?? condition;
    if (s) p.set('status',    s);
    if (c) p.set('condition', c);
    return '/admin/ads' + (p.toString() ? '?' + p.toString() : '');
  };

  return (
    <>
      <PageHeader
        title="Products moderation"
        description="Approve, reject, feature, or delete listings across the marketplace."
      />

      {/* Filter row — clean pill tabs so the table below stays uncluttered */}
      <div className="mb-4 space-y-3">
        <nav aria-label="Product status" className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--adm-fg-faint)' }}>Status</span>
          {STATUS_TABS.map((t) => {
            const active = (status || '') === t.key;
            return (
              <a
                key={t.key || 'all'} href={buildHref(t.key)}
                className="rounded-md border px-2.5 py-1 text-[11.5px] font-semibold transition"
                style={{
                  background:  active ? 'var(--adm-brand)' : 'var(--adm-surface)',
                  borderColor: active ? 'var(--adm-brand)' : 'var(--adm-border)',
                  color:       active ? 'var(--adm-brand-fg)' : 'var(--adm-fg-muted)',
                }}
              >
                {t.label}
              </a>
            );
          })}
        </nav>

        <nav aria-label="Ad condition" className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--adm-fg-faint)' }}>Condition</span>
          {CONDITION_TABS.map((c) => {
            const active = (condition || '') === c.key;
            return (
              <a
                key={c.key || 'any'} href={buildHref(undefined, c.key)}
                className="rounded-md border px-2.5 py-1 text-[11.5px] font-semibold transition"
                style={{
                  background:  active ? 'var(--adm-fg)' : 'var(--adm-surface)',
                  borderColor: active ? 'var(--adm-fg)' : 'var(--adm-border)',
                  color:       active ? 'var(--adm-surface)' : 'var(--adm-fg-muted)',
                }}
              >
                {c.label}
              </a>
            );
          })}
        </nav>
      </div>

      <AdsTableClient initialRows={rows} />
    </>
  );
}
