'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { Fragment, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { CategoryConditionGrid, ConditionToggle, type Condition } from './CategoryConditionGrid';
import { ListingCard } from '@/components/listing/ListingCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { AdSlot } from '@/components/ads/AdSlot';
import type { Ad, Category } from '@/types/api';

function stripTestAds<T extends { title?: string | null }>(ads: T[]): T[] {
  return ads.filter((a) => !/playwright|test\s*ad/i.test(a.title ?? ''));
}

const GRID = 'grid gap-6 sm:grid-cols-2 lg:grid-cols-4';

/** A product section that has one list per condition (used/new). */
type ConditionedSection = { used: Ad[]; new: Ad[] };

function createdAtTimestamp(ad: Ad): number {
  const timestamp = Date.parse(ad.created_at ?? '');
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function newestFirst(ads: Ad[]): Ad[] {
  const uniqueAds = Array.from(new Map(ads.map((ad) => [ad.id, ad])).values());
  return uniqueAds.sort((a, b) => createdAtTimestamp(b) - createdAtTimestamp(a) || b.id - a.id);
}

/**
 * The home sections plus a global All/Used/New filter.
 *
 * The toggle sits above the categories grid; flipping it re-renders the
 * categories (real per-condition counts) AND every product section below
 * with the matching condition's data, so the whole homepage filters in sync.
 */
export function HomeSections({
  categories,
  featured,
  urgent,
  used,
  last24h,
  highlights,
}: {
  categories: Category[];
  featured: ConditionedSection;
  urgent: ConditionedSection;
  used: ConditionedSection;
  last24h: ConditionedSection;
  highlights: ConditionedSection;
}) {
  const [condition, setCondition] = useState<Condition>('all');
  const pick = (section: ConditionedSection) => newestFirst(
    condition === 'all' ? [...section.used, ...section.new] : section[condition],
  );

  return (
    <>
{/* ── Global Used/New filter — centered above the page, applies to
          every section (categories + product grids) ── */}
      <div className="container-page flex justify-center pt-20 pb-2">
        <ConditionToggle condition={condition} onChange={setCondition} />
      </div>

      {/* ── 0. Popular categories ── */}
      <section className="reveal container-page pb-24 pt-6">
        <SectionHeader
          eyebrow="Browse by category"
          title={<>Find exactly what you need, <span className="text-brand-700">faster.</span></>}
          description="Twelve most-loved categories, ranked by weekly buyer activity."
          actionLabel="View all"
          actionHref={'/ads' as Route}
        />
        {categories.length === 0 ? (
          <div className="mt-12">
            <EmptyState title="No categories yet" description="Categories will appear once seeded." />
          </div>
        ) : (
          <CategoryConditionGrid categories={categories.slice(0, 12)} condition={condition} />
        )}
      </section>

      {/* ═══ AD SLOT #1 — large (970×250), under hero ═══ */}
      <div className="container-page pb-8 pt-10">
        <AdSlot placement="home.after_categories" size="large" />
      </div>

      {/* ── 1. Featured products ── */}
      {pick(featured).length > 0 && (
        <section className="reveal relative overflow-hidden bg-white py-24">
          <div className="container-page relative">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-2 text-body-sm font-semibold uppercase tracking-[0.2em] text-brand-700">
                  <span className="inline-block h-1.5 w-6 rounded-full bg-brand-700" />
                  Featured
                </p>
                <h2 className="mt-3 max-w-xl text-[40px] leading-[1.05] font-bold tracking-[-0.02em] text-ink md:text-[48px]">
                  Featured <span className="text-brand-700">products.</span>
                </h2>
                <p className="mt-3 max-w-lg text-body-md text-ink-muted">
                  Verified sellers, best-in-class prices, and buyer-safe messaging on every listing.
                </p>
              </div>
              <Link href={'/ads' as Route} className="contents">
                <button className="group inline-flex items-center gap-2 rounded-pill bg-ink pl-5 pr-2 py-2 text-body-md font-semibold text-white transition hover:bg-ink/90">
                  See all featured
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white transition-transform group-hover:rotate-45">
                    <ArrowUpRight size={14} />
                  </span>
                </button>
              </Link>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {stripTestAds(pick(featured)).slice(0, 6).map((ad, i) => (
                <Fragment key={ad.id}>
                  <ListingCard ad={ad} variant="featured" />
                  {i === 2 && <AdSlot placement="home.sponsored_infeed" size="infeed" />}
                </Fragment>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 2. Urgent products ── */}
      {pick(urgent).length > 0 && (
        <section className="reveal container-page py-24">
          <SectionHeader
            eyebrow="Urgent products"
            title={<>Limited <span className="text-brand-700">Time Offers</span></>}
            description="Sellers marked these as urgent — expect quick replies."
            actionLabel="See all urgent"
            actionHref={'/ads' as Route}
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stripTestAds(pick(urgent)).slice(0, 8).map((ad) => <ListingCard key={ad.id} ad={ad} variant="featured" />)}
          </div>
        </section>
      )}

      {/* ── 3. Great condition — follows the Used/New toggle ── */}
      {pick(used).length > 0 && (
        <section className="reveal container-page pb-24">
          {condition === 'new' ? (
            <SectionHeader
              eyebrow="Brand new"
              title={<>Never used, still <span className="text-brand-700">in the box.</span></>}
              description="Factory-fresh listings from verified retailers and everyday sellers."
              actionLabel="See all new"
              actionHref={'/ads?condition=new' as Route}
            />
          ) : condition === 'used' ? (
            <SectionHeader
              eyebrow="Pre-owned"
              title={<>Great condition, <span className="text-brand-700">great value.</span></>}
              description="Verified second-hand deals — save an average of 42% versus buying new."
              actionLabel="See all used"
              actionHref={'/ads?condition=used' as Route}
              statPill={{ label: '42% avg savings', tone: 'success' }}
            />
          ) : (
            <SectionHeader
              eyebrow="Latest products"
              title={<>Newest listings, <span className="text-brand-700">first.</span></>}
              description="The latest new and pre-owned products from sellers across every category."
              actionLabel="Browse all"
              actionHref={'/ads?sort=-created_at' as Route}
            />
          )}
          <div className={`mt-12 ${GRID}`}>
            {stripTestAds(pick(used)).slice(0, 8).map((ad) => <ListingCard key={ad.id} ad={ad} variant="featured" />)}
          </div>
        </section>
      )}

      {/* ── 4. Fresh from sellers, in the last 24h ── */}
      <section className="reveal bg-white py-24">
        <div className="container-page">
          <SectionHeader
            eyebrow="Just posted"
            title={<>Fresh from sellers, <span className="text-brand-700">in the last 24h.</span></>}
            description="Newly listed items across every category — updated every few minutes."
            actionLabel="Browse all"
            actionHref={'/ads' as Route}
          />
          {pick(last24h).length === 0 ? (
            <div className="mt-12">
              <EmptyState title="Nothing posted in the last 24 hours" description="New products land here as sellers post them." action={
                <Link href={'/post/product' as Route} className="contents"><Button variant="filled">Post a product</Button></Link>
              } />
            </div>
          ) : (
            <div className={`mt-12 ${GRID}`}>
              {stripTestAds(pick(last24h)).slice(0, 8).map((ad) => <ListingCard key={ad.id} ad={ad} variant="featured" />)}
            </div>
          )}
        </div>
      </section>

      {/* ── 5. Highlight Products ── */}
      {pick(highlights).length > 0 && (
        <section className="reveal container-page pb-24">
          <SectionHeader
            eyebrow="Highlight Products"
            title={<>Hot <span className="text-brand-700">Listings</span></>}
            description="Listings sellers chose to spotlight."
            actionLabel="See all"
            actionHref={'/ads' as Route}
          />
          <div className={`mt-12 ${GRID}`}>
            {stripTestAds(pick(highlights)).slice(0, 8).map((ad) => <ListingCard key={ad.id} ad={ad} variant="featured" />)}
          </div>
        </section>
      )}
    </>
  );
}
