'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { Fragment } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { ListingCard } from '@/components/listing/ListingCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { AdSlot } from '@/components/ads/AdSlot';
import type { Ad, Category } from '@/types/api';

function stripTestAds<T extends { title?: string | null }>(ads: T[]): T[] {
  return ads.filter((a) => !/playwright|test\s*ad/i.test(a.title ?? ''));
}

const GRID = 'grid gap-6 sm:grid-cols-2 lg:grid-cols-4';

/**
 * The five home sections, in order:
 *   1. Featured products
 *   2. Urgent products (posted with Urgent selected)
 *   3. Great condition / Pre-owned (used only)
 *   4. Fresh from sellers, in the last 24h
 *   5. Highlight Products (posted with Highlight selected)
 */
export function HomeSections({
  featured,
  urgent,
  used,
  last24h,
  highlights,
}: {
  featured: Ad[];
  urgent: Ad[];
  used: Ad[];
  last24h: Ad[];
  highlights: Ad[];
}) {
  return (
    <>
      {/* ── 1. Featured products ── */}
      {featured.length > 0 && (
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
              {stripTestAds(featured).slice(0, 6).map((ad, i) => (
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
      {urgent.length > 0 && (
        <section className="reveal container-page py-24">
          <SectionHeader
            eyebrow="Urgent products"
            title={<>Limited <span className="text-brand-700">Time Offers</span></>}
            description="Sellers marked these as urgent — expect quick replies."
            actionLabel="See all urgent"
            actionHref={'/ads' as Route}
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stripTestAds(urgent).slice(0, 8).map((ad) => <ListingCard key={ad.id} ad={ad} variant="featured" />)}
          </div>
        </section>
      )}

      {/* ── 3. Great condition — used only ── */}
      {used.length > 0 && (
        <section className="reveal container-page pb-24">
          <SectionHeader
            eyebrow="Pre-owned"
            title={<>Great condition, <span className="text-brand-700">great value.</span></>}
            description="Verified second-hand deals — save an average of 42% versus buying new."
            actionLabel="See all used"
            actionHref={'/ads?condition=used' as Route}
            statPill={{ label: '42% avg savings', tone: 'success' }}
          />
          <div className={`mt-12 ${GRID}`}>
            {stripTestAds(used).slice(0, 8).map((ad) => <ListingCard key={ad.id} ad={ad} variant="featured" />)}
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
          {last24h.length === 0 ? (
            <div className="mt-12">
              <EmptyState title="Nothing posted in the last 24 hours" description="New products land here as sellers post them." action={
                <Link href={'/post/product' as Route} className="contents"><Button variant="filled">Post a product</Button></Link>
              } />
            </div>
          ) : (
            <div className={`mt-12 ${GRID}`}>
              {stripTestAds(last24h).slice(0, 8).map((ad) => <ListingCard key={ad.id} ad={ad} variant="featured" />)}
            </div>
          )}
        </div>
      </section>

      {/* ── 5. Highlight Products ── */}
      {highlights.length > 0 && (
        <section className="reveal container-page pb-24">
          <SectionHeader
            eyebrow="Highlight Products"
            title={<>Hot <span className="text-brand-700">Listings</span></>}
            description="Listings sellers chose to spotlight."
            actionLabel="See all"
            actionHref={'/ads' as Route}
          />
          <div className={`mt-12 ${GRID}`}>
            {stripTestAds(highlights).slice(0, 8).map((ad) => <ListingCard key={ad.id} ad={ad} variant="featured" />)}
          </div>
        </section>
      )}
    </>
  );
}