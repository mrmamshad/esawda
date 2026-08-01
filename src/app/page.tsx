import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HomeHero } from '@/components/home/HomeHero';
import { SectionHeader } from '@/components/home/SectionHeader';
import { CategoryCard } from '@/components/home/CategoryCard';
import { ListingCard } from '@/components/listing/ListingCard';
import { BlogCard } from '@/components/blog/BlogCard';
import { TestimonialCard } from '@/components/ui/TestimonialCard';
import { PlanCard } from '@/components/membership/PlanCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { apiFromServer, ApiError } from '@/lib/api';
import { getSiteSettings } from '@/lib/settings';
import { getSessionUser } from '@/lib/session';
import type { Ad, Blog, Category, Plan, Testimonial } from '@/types/api';

export const metadata: Metadata = {
  title: 'eSawda — Buy, Sell, Browse Ads',
  description: 'Browse thousands of classified ads across vehicles, mobiles, electronics, houses and more.',
  alternates: { canonical: '/' },
};

export const revalidate = 120;

async function safe<T>(p: Promise<T>, fb: T): Promise<T> {
  return p.catch((e) => { if (e instanceof ApiError) return fb; throw e; });
}

/** Strip demo/test seed ads (Playwright, "Test Ad", etc.) from public grids. */
function stripTestAds<T extends { title?: string | null }>(ads: T[]): T[] {
  return ads.filter((a) => !/playwright|test\s*ad/i.test(a.title ?? ''));
}

export default async function HomePage() {
  const user     = await getSessionUser();
  const settings = await getSiteSettings();
  // Prefer the human "site_name" (short brand) over the SEO "site_title".
  const siteName    = (settings.site_name as string) || 'eSawda';
  // `home_banner` from backend may be either a bare filename (legacy) or a
  // full URL if the admin uploaded via the new pipeline. Resolve both.
  const rawBanner   = settings.home_banner as string | undefined;
  const heroBgUrl   = rawBanner
    ? (/^https?:\/\//i.test(rawBanner)
        ? rawBanner
        : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, '')}/uploads/hero/hero-bg.jpg`)
    : undefined;

  const [cats, featured, latest, brandNew, used, plans, testimonials, blogs] = await Promise.all([
    safe(apiFromServer<Category[]>('/categories?with_counts=true'),                              { data: [] as Category[] }),
    safe(apiFromServer<Ad[]>       ('/ads/featured?per_page=6'),                                 { data: [] as Ad[] }),
    safe(apiFromServer<Ad[]>       ('/ads?per_page=8&sort=-created_at'),                         { data: [] as Ad[] }),
    safe(apiFromServer<Ad[]>       ('/ads?per_page=8&sort=-created_at&filter[condition]=new'),   { data: [] as Ad[] }),
    safe(apiFromServer<Ad[]>       ('/ads?per_page=8&sort=-created_at&filter[condition]=used'),  { data: [] as Ad[] }),
    safe(apiFromServer<Plan[]>     ('/plans'),                                                    { data: [] as Plan[] }),
    safe(apiFromServer<Testimonial[]>('/testimonials?limit=3'),                                   { data: [] as Testimonial[] }),
    safe(apiFromServer<Blog[]>     ('/blogs?per_page=3'),                                         { data: [] as Blog[] }),
  ]);

  const activePlans = ((plans.data ?? []) as Plan[]).filter((p) => p.active !== false).slice(0, 3);

  return (
    <>
      {/*
        Dark editorial hero — Header sits inside the hero on the same
        dark rose-charcoal wash so the logo pill floats over the photo
        gracefully.
      */}
      {/* Header is always light glass on the cream Eris hero — no scroll swap needed. */}
      <Header variant="default" user={user ?? undefined} />
      <HomeHero siteName={siteName} bgImageUrl={heroBgUrl} />

      <main className="bg-bg">
        {/* ═══ SECTION HEADER PATTERN ═══
            All sections share the same rhythm now — a small orange "eyebrow"
            label above a chunky navy heading, muted body, and (optionally)
            a ghost "See all" pill on the right. This is the Eris cadence. */}

        {/* ── Popular categories — cream canvas, tilted card grid ── */}
        <section className="reveal container-page py-24">
          <SectionHeader
            eyebrow="Browse by category"
            title={<>Find exactly what you need, <span className="text-brand-700">faster.</span></>}
            description="Twelve most-loved categories, ranked by weekly buyer activity."
            actionLabel="View all"
            actionHref={'/ads' as Route}
          />
          {cats.data.length === 0 ? (
            <EmptyState title="No categories yet" description="Categories will appear once seeded." />
          ) : (
            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {(cats.data as Category[])
                .filter((c) => !/playwright|test/i.test(c.name))
                .slice(0, 12)
                .map((c) => <CategoryCard key={c.id} category={c} />)}
            </div>
          )}
        </section>

        {/* ── Sponsored products — warm cream-tinted block with soft brand wash ── */}
        {featured.data.length > 0 && (
          <section className="reveal relative overflow-hidden py-24">
            {/* Soft brand-tinted background — cream base with a warm orange wash */}
            <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-brand-50 via-bg to-brand-100/60" />
            <div aria-hidden className="pointer-events-none absolute -left-32 top-16 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -right-32 bottom-16 h-96 w-96 rounded-full bg-brand-300/30 blur-3xl" />

            <div className="container-page relative">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="inline-flex items-center gap-2 text-body-sm font-semibold uppercase tracking-[0.2em] text-brand-700">
                    <span className="inline-block h-1.5 w-6 rounded-full bg-brand-700" />
                    Sponsored
                  </p>
                  <h2 className="mt-3 max-w-xl text-[40px] leading-[1.05] font-bold tracking-[-0.02em] text-ink md:text-[48px]">
                    Sponsored <span className="text-brand-700">products.</span>
                  </h2>
                  <p className="mt-3 max-w-lg text-body-md text-ink-muted">
                    Verified sellers, best-in-class prices, and buyer-safe messaging on every listing.
                  </p>
                </div>
                <Link href={'/ads' as Route} className="contents">
                  <button className="group inline-flex items-center gap-2 rounded-pill bg-ink pl-5 pr-2 py-2 text-body-md font-semibold text-white transition hover:bg-ink/90">
                    See all sponsored
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white transition-transform group-hover:rotate-45">
                      <ArrowUpRight size={14} />
                    </span>
                  </button>
                </Link>
              </div>
              <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {stripTestAds(featured.data as Ad[]).slice(0, 6).map((ad) => <ListingCard key={ad.id} ad={ad} variant="featured" />)}
              </div>
            </div>
          </section>
        )}

        {/* ── Latest ads — cream canvas ── */}
        <section className="reveal container-page py-24">
          <SectionHeader
            eyebrow="Just posted"
            title={<>Fresh from sellers, <span className="text-brand-700">in the last 24h.</span></>}
            description="Newly listed items across every category — updated every few minutes."
            actionLabel="Browse all"
            actionHref={'/ads' as Route}
          />
          {latest.data.length === 0 ? (
            <div className="mt-12">
              <EmptyState title="No ads yet" description="Be the first to post an ad." action={
                <Link href={'/shop/ads/new' as Route} className="contents"><Button variant="filled">Post an ad</Button></Link>
              } />
            </div>
          ) : (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {stripTestAds(latest.data as Ad[]).slice(0, 8).map((ad) => <ListingCard key={ad.id} ad={ad} variant="featured" />)}
            </div>
          )}
        </section>

        {/* ── Brand New arrivals — soft tertiary tint ── */}
        {brandNew.data.length > 0 && (
          <section className="reveal bg-tertiary py-24">
            <div className="container-page">
              <SectionHeader
                eyebrow="Brand new"
                title={<>Never used, still <span className="text-brand-700">in the box.</span></>}
                description="Factory-fresh listings from verified retailers and everyday sellers."
                actionLabel="See all new"
                actionHref={'/ads?condition=new' as Route}
              />
              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stripTestAds(brandNew.data as Ad[]).slice(0, 8).map((ad) => <ListingCard key={ad.id} ad={ad} variant="featured" />)}
              </div>
            </div>
          </section>
        )}

        {/* ── Used items — cream, green pill accent ── */}
        {used.data.length > 0 && (
          <section className="reveal container-page py-24">
            <SectionHeader
              eyebrow="Pre-owned"
              title={<>Great condition, <span className="text-brand-700">great value.</span></>}
              description="Verified second-hand deals — save an average of 42% versus buying new."
              actionLabel="See all used"
              actionHref={'/ads?condition=used' as Route}
              statPill={{ label: '42% avg savings', tone: 'success' }}
            />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {stripTestAds(used.data as Ad[]).slice(0, 8).map((ad) => <ListingCard key={ad.id} ad={ad} variant="featured" />)}
            </div>
          </section>
        )}

        {/* ── Membership plans — tertiary tint, bold pricing cards ── */}
        {activePlans.length > 0 && (
          <section className="reveal bg-tertiary py-24">
            <div className="container-page">
              <SectionHeader
                eyebrow="Level up"
                title={<>Grow your reach with a <span className="text-brand-700">seller tier.</span></>}
                description="Pick the plan that matches your ambition — from casual sellers to power dealers."
                actionLabel="Compare plans"
                actionHref={'/membership' as Route}
              />
              <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activePlans.map((p, i) => (
                  <PlanCard key={p.id} plan={p} cadence="monthly" featured={p.recommended || i === 1} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Testimonials — center-aligned, quote-first cards ── */}
        {testimonials.data.length > 0 && (
          <section className="reveal container-page py-24">
            <div className="mx-auto max-w-2xl text-center">
              <p className="inline-flex items-center gap-2 text-body-sm font-semibold uppercase tracking-[0.2em] text-brand-700">
                <span className="inline-block h-1.5 w-6 rounded-full bg-brand-700" />
                Loved by sellers
              </p>
              <h2 className="mt-3 text-[40px] leading-[1.05] font-bold tracking-[-0.02em] text-ink md:text-[48px]">
                What our community <span className="text-brand-700">says.</span>
              </h2>
              <p className="mt-4 text-body-md text-ink-muted">
                Real quotes from real sellers who grew their business on {siteName}.
              </p>
            </div>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {(testimonials.data as Testimonial[]).slice(0, 3).map((t) => (
                <TestimonialCard key={t.id} kind="testimonial" item={t} />
              ))}
            </div>
          </section>
        )}

        {/* ── Blog preview — cream, three horizontal cards ── */}
        {blogs.data.length > 0 && (
          <section className="reveal bg-tertiary py-24">
            <div className="container-page">
              <SectionHeader
                eyebrow="From the journal"
                title={<>Tips, guides, and <span className="text-brand-700">seller stories.</span></>}
                description="Weekly writing from our editors on getting better prices, staying safe, and growing faster."
                actionLabel="All posts"
                actionHref={'/blog' as Route}
              />
              <div className="mt-12 grid gap-6 md:grid-cols-3">
                {(blogs.data as Blog[]).slice(0, 3).map((b) => <BlogCard key={b.id} blog={b} />)}
              </div>
            </div>
          </section>
        )}

        {/* ── Final CTA — orange bloom on navy ── */}
        <section className="reveal relative overflow-hidden bg-ink py-20">
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(600px_300px_at_85%_50%,rgba(241,106,43,0.35),transparent_70%),radial-gradient(600px_300px_at_10%_-10%,rgba(241,106,43,0.18),transparent_70%)]" />
          {/* Decorative dashed circle — echoes Eris's outline detail */}
          <div aria-hidden className="pointer-events-none absolute -right-24 top-1/2 hidden h-[420px] w-[420px] -translate-y-1/2 rounded-full border border-dashed border-brand-500/30 md:block" />
          <div aria-hidden className="pointer-events-none absolute -right-12 top-1/2 hidden h-[280px] w-[280px] -translate-y-1/2 rounded-full border border-dashed border-brand-500/40 md:block" />

          <div className="container-page relative grid gap-10 md:grid-cols-[1fr_auto] md:items-center">
            <div className="max-w-xl">
              <p className="inline-flex items-center gap-2 text-body-sm font-semibold uppercase tracking-[0.2em] text-brand-500">
                <span className="inline-block h-1.5 w-6 rounded-full bg-brand-700" />
                Ready when you are
              </p>
              <h2 className="mt-3 text-[40px] leading-[1.05] font-bold tracking-[-0.02em] text-white md:text-[48px]">
                Post your first ad in <span className="text-brand-500">under 2 minutes.</span>
              </h2>
              <p className="mt-4 text-body-lg text-white/70">
                No credit card, no fees to get started. Reach thousands of buyers on day one.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href={'/shop/ads/new' as Route} className="contents">
                <button className="group inline-flex items-center gap-2 rounded-pill bg-brand-700 pl-6 pr-2 py-2 text-body-md font-semibold text-white shadow-[0_10px_24px_-8px_rgba(241,106,43,0.55)] transition hover:bg-brand-600">
                  Post your ad
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:rotate-45">
                    <ArrowUpRight size={16} />
                  </span>
                </button>
              </Link>
              <Link href={'/membership' as Route} className="contents">
                <button className="inline-flex items-center gap-2 rounded-pill border border-white/20 bg-white/5 px-6 py-3 text-body-md font-semibold text-white backdrop-blur transition hover:border-white/40 hover:bg-white/10">
                  See plans
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer siteName={siteName} />
    </>
  );
}
