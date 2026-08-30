import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import {
  MapPin, MessageCircle, Phone, Clock, ShieldCheck, BadgeCheck,
  LayoutGrid, List, ChevronDown,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { PageSurface } from '@/components/layout/PageSurface';
import { Avatar } from '@/components/ui/Avatar';
import { OnlineDot } from '@/components/ui/OnlineDot';
import { SocialRow } from '@/components/ui/SocialRow';
import { Button } from '@/components/ui/Button';
import { ListingCard } from '@/components/listing/ListingCard';
import { TestimonialCard } from '@/components/ui/TestimonialCard';
import { AdSlot } from '@/components/ads/AdSlot';
import type { Ad, Review, Seller } from '@/types/api';

/**
 * Seller / Shop Public Profile — Bikroy-style two-column layout, tuned
 * to the eSawda brand palette (brand red/pink, surface tokens).
 *
 * Layout:
 *   ┌────────────┬──────────────────────────────────┐
 *   │  Sticky    │  Category rail (chips)           │
 *   │  seller    │  Sort / view controls            │
 *   │  card      │  Listings grid                   │
 *   │  About     │                                  │
 *   │  Contact   │                                  │
 *   └────────────┴──────────────────────────────────┘
 *
 * ISR 120s: seller stats change slower than ad listings but faster than
 * static content. `notFound()` fires when the username doesn't exist so
 * we get the correct 404 status for SEO.
 */
export const revalidate = 120;

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  try {
    const { data: seller } = await api<Seller>(`/sellers/${username}`, { revalidate: 300 });
    const desc = `${seller.stats.total_listings} listings · ${seller.stats.sold} sold${seller.location.city ? ` · ${seller.location.city}` : ''}`;
    return {
      title:       `${seller.name}'s Listings`,
      description: desc,
      alternates:  { canonical: `/store/${seller.username}` },
      openGraph:   { title: `${seller.name} · eSawda`, description: desc, images: [seller.avatar_url], type: 'profile' },
    };
  } catch { return { title: 'Seller not found' }; }
}

/** Human-readable "1+ month ago", "3 hours ago" from an ISO date. */
function humanAgo(iso: string | null): string | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const diffMs = Date.now() - then;
  const mins   = Math.floor(diffMs / 60_000);
  if (mins   < 1)    return 'just now';
  if (mins   < 60)   return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hrs    = Math.floor(mins / 60);
  if (hrs    < 24)   return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days   = Math.floor(hrs / 24);
  if (days   < 30)   return `${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.floor(days / 30);
  if (months < 12)   return `${months}+ month${months === 1 ? '' : 's'} ago`;
  const years  = Math.floor(months / 12);
  return `${years}+ year${years === 1 ? '' : 's'} ago`;
}

export default async function SellerProfilePage({ params, searchParams }: {
  params: Promise<{ username: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { username } = await params;
  const sp = await searchParams;
  const activeCat = typeof sp.cat === 'string' ? sp.cat : '';

  const [seller, ads, reviews] = await Promise.all([
    api<Seller>(`/sellers/${username}`,                       { revalidate: 120 }).catch(() => null),
    api<Ad[]>  (`/sellers/${username}/ads?per_page=24`,       { revalidate: 120 }).catch(() => ({ data: [] as Ad[] })),
    api<Review[]>(`/sellers/${username}/reviews?per_page=3`,  { revalidate: 300 }).catch(() => ({ data: [] as Review[] })),
  ]);
  if (!seller) notFound();
  const s = seller.data;

  // Build category chips from the seller's own ads (fallback when the
  // backend doesn't expose a dedicated /categories aggregate endpoint).
  const catCounts = new Map<string, { name: string; count: number; slug: string }>();
  for (const ad of ads.data) {
    if (!ad.category) continue;
    const key = String(ad.category.id);
    const prev = catCounts.get(key);
    if (prev) prev.count += 1;
    else catCounts.set(key, {
      name:  ad.category.name,
      slug:  ad.category.slug ?? String(ad.category.id),
      count: 1,
    });
  }
  const categories = Array.from(catCounts.values()).sort((a, b) => b.count - a.count);

  // Profile-scoped category filter: when a category chip is chosen, show
  // only this seller's ads in that category (default = all).
  const visibleAds = activeCat
    ? ads.data.filter((ad) => String(ad.category?.slug ?? ad.category?.id) === activeCat)
    : ads.data;

  const waHref = s.whatsapp ? `https://wa.me/${encodeURIComponent(s.whatsapp.replace(/\D/g, ''))}` : null;
  const memberSince = humanAgo(s.member_since);
  const lastSeen    = humanAgo(s.last_active);
  const locationLine = [s.location.city, s.location.country].filter(Boolean).join(', ');

  return (
    <PageSurface>
      <Header variant="default" />
      <HeaderSpacer />

      {/* Classic white page background. */}
      <div className="bg-white">
        <div className="container-page py-6 md:py-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">

            {/* ───────── Left: sticky seller sidebar ───────── */}
            <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
              {/* Seller identity card */}
              <div className="surface-card overflow-hidden">
                {s.cover_url && (
                  <img src={s.cover_url} alt="" className="h-32 w-full object-cover" />
                )}
                <div className="flex flex-col items-center px-6 pt-8 pb-6 text-center">
                  <div className="relative">
                    <Avatar src={s.avatar_url} alt={s.name} size="xl" />
                    {s.online && (
                      <span
                        className="absolute -right-0.5 bottom-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500"
                        aria-label="Online"
                      />
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-1.5">
                    <h1 className="text-lg font-bold leading-tight text-ink line-clamp-2">{s.name}</h1>
                    {s.shop_verified === true && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand-700">
                        <BadgeCheck size={12} /> Verified
                      </span>
                    )}
                  </div>
                  {s.tagline && (
                    <p className="mt-1 line-clamp-2 text-xs text-ink-muted">{s.tagline}</p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-ink-muted">
                    {memberSince && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1">
                        <ShieldCheck size={12} className="text-brand-600" />
                        {memberSince} on eSawda
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1">
                      <OnlineDot active={s.online} />
                    </span>
                  </div>

                  {lastSeen && (
                    <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-ink-muted">
                      <Clock size={12} />
                      Last seen {lastSeen}
                    </p>
                  )}
                </div>

                {/* Contact actions */}
                <div className="grid grid-cols-3 divide-x divide-line border-t border-line bg-white text-center text-xs">
                  <div className="px-3 py-3">
                    <div className="text-base font-bold text-ink">{s.stats.total_listings}</div>
                    <div className="text-[11px] uppercase tracking-wide text-ink-muted">Listings</div>
                  </div>
                  <div className="px-3 py-3">
                    <div className="text-base font-bold text-ink">{s.stats.sold}</div>
                    <div className="text-[11px] uppercase tracking-wide text-ink-muted">Sold</div>
                  </div>
                  <div className="px-3 py-3">
                    <div className="text-base font-bold text-ink">
                      {s.stats.avg_rating ? s.stats.avg_rating.toFixed(1) : '—'}
                    </div>
                    <div className="text-[11px] uppercase tracking-wide text-ink-muted">Rating</div>
                  </div>
                </div>

                <div className="space-y-2 border-t border-line p-4">
                  <Link href={`/messages/${s.id}` as Route} className="block">
                    <Button fullWidth variant="filled" leftIcon={<MessageCircle size={16} />}>
                      Message
                    </Button>
                  </Link>
                  {waHref && (
                    <a href={waHref} target="_blank" rel="noopener noreferrer" className="block">
                      <Button fullWidth variant="outline" leftIcon={<Phone size={16} />}>
                        Show contact
                      </Button>
                    </a>
                  )}
                </div>
              </div>

              {/* About seller */}
              {(s.description || locationLine) && (
                <div className="surface-card p-5">
                  <h2 className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                    About seller
                  </h2>
                  {s.description && (
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink">
                      {s.description}
                    </p>
                  )}
                  {locationLine && (
                    <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-ink-muted">
                      <MapPin size={14} className="text-brand-600" />
                      {locationLine}
                    </p>
                  )}
                </div>
              )}

              {/* Socials */}
              {s.socials && Object.values(s.socials).some(Boolean) && (
                <div className="surface-card p-5">
                  <h2 className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                    Connect
                  </h2>
                  <div className="mt-3">
                    <SocialRow socials={s.socials} />
                  </div>
                </div>
              )}

              {/* ── Sidebar ad slot (MPU, 300×250) ── */}
              <AdSlot placement="store.sidebar" size="mpu" />
            </aside>

            {/* ───────── Right: listings ───────── */}
            <section className="min-w-0 space-y-4">
              {/* Shop banner — full width of the right column */}
              {s.shop_banner_url && (
                <div className="relative h-40 overflow-hidden rounded-xl bg-ink md:h-56">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.shop_banner_url}
                    alt={`${s.shop_name || s.name} banner`}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {/* Category chips row */}
              <div className="surface-card p-3">
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  <CategoryChip
                    active={!activeCat}
                    label="All categories"
                    count={s.stats.total_listings}
                    href={`?cat=`}
                  />
                  {categories.map((c) => (
                    <CategoryChip
                      key={c.slug}
                      label={c.name}
                      count={c.count}
                      active={activeCat === String(c.slug)}
                      href={`?cat=${encodeURIComponent(String(c.slug))}`}
                    />
                  ))}
                </div>
              </div>

              {/* Sort + view toggles */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-white px-4 py-2.5">
                <p className="text-sm text-ink-muted">
                  Showing <span className="font-semibold text-ink">{visibleAds.length}</span>{' '}
                  {visibleAds.length === 1 ? 'product' : 'products'}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-md bg-surface-muted px-3 py-1.5 text-sm font-medium text-ink hover:bg-brand-50"
                  >
                    Sort: Newest
                    <ChevronDown size={14} />
                  </button>
                  <div className="flex overflow-hidden rounded-md border border-line">
                    <button
                      type="button"
                      className="grid h-8 w-8 place-items-center bg-brand-50 text-brand-700"
                      aria-label="Grid view"
                    >
                      <LayoutGrid size={14} />
                    </button>
                    <button
                      type="button"
                      className="grid h-8 w-8 place-items-center bg-white text-ink-muted hover:bg-surface-muted"
                      aria-label="List view"
                    >
                      <List size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Listings grid */}
              {visibleAds.length === 0 ? (
                <div className="rounded-card border border-dashed border-line bg-white p-12 text-center text-ink-muted">
                  {activeCat
                    ? 'No products in this category yet.'
                    : 'This seller hasn&apos;t posted any products yet.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {visibleAds.map((ad) => (
                    <ListingCard
                      key={ad.id}
                      ad={ad}
                      variant="featured"
                      subtitle={ad.sub_category?.name ?? undefined}
                    />
                  ))}
                </div>
              )}

              {/* ── Content ad slot (wide banner) between listings and reviews ── */}
              <AdSlot placement="store.listings_bottom" size="wide" />

              {/* Testimonials */}
              {reviews.data.length > 0 && (
                <div className="pt-4">
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
                    What buyers say
                  </h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {reviews.data.map((r) => (
                      <TestimonialCard key={r.id} kind="review" item={r} />
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </PageSurface>
  );
}

/** Small pill used for the seller's own category rail. Links to the
 *  public category browse page so it actually navigates. */
function CategoryChip({
  label, count, active, href,
}: { label: string; count: number; active?: boolean; href?: string }) {
  const cls =
    'inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition ' +
    (active
      ? 'bg-brand-600 text-white shadow-sm'
      : 'bg-surface-muted text-ink hover:bg-brand-50 hover:text-brand-700');
  const inner = (
    <>
      <span>{label}</span>
      <span
        className={
          'rounded-full px-1.5 py-0.5 text-[10px] font-bold ' +
          (active ? 'bg-white/20 text-white' : 'bg-white text-ink-muted')
        }
      >
        {count}
      </span>
    </>
  );
  return href ? (
    <Link href={href as Route} className={cls}>{inner}</Link>
  ) : (
    <button type="button" className={cls}>{inner}</button>
  );
}
