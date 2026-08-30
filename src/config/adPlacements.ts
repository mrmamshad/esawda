import type { AdSlotSize } from '@/components/ads/AdSlot';

/**
 * Canonical ad-placement catalog, grouped page-by-page.
 *
 * The admin "Ad Slots" page renders this structure: each page shows its
 * slot positions with human-readable descriptions, how many are configured,
 * and lets the admin edit/upload an ad for any specific slot.
 *
 * `prefix` matches the DB `ad_placements.slug` (e.g. "store.sidebar").
 * Slugs listed under a page are the "known" positions — the admin can
 * configure each one, or leave it to fall back to the static placeholder.
 */

export type PlacementTemplate = {
  slug: string;
  label: string;      // human-readable position, e.g. "Right sidebar (MPU)"
  size: AdSlotSize;
  hint: string;
};

export type PlacementPage = {
  key: string;        // stable id
  name: string;       // "Store profile"
  description: string;
  slots: PlacementTemplate[];
};

export const PLACEMENT_PAGES: PlacementPage[] = [
  {
    key: 'home',
    name: 'Home page',
    description: 'Sections on the marketplace homepage.',
    slots: [
      { slug: 'home.after_categories', label: 'Below categories grid', size: 'large', hint: '970×250 large banner' },
      { slug: 'home.sponsored_infeed', label: 'Inside featured (in-feed)', size: 'infeed', hint: 'Native square ad between cards' },
      { slug: 'home.after_preowned', label: 'After pre-owned section', size: 'wide', hint: '970×90 wide banner' },
      { slug: 'home.pre_cta', label: 'Before final CTA', size: 'wide', hint: '970×90 wide banner' },
    ],
  },
  {
    key: 'search',
    name: 'Search / Browse page',
    description: 'The /ads results page and category/city listings.',
    slots: [
      { slug: 'search.filter_under', label: 'Under the filter bar', size: 'large', hint: '970×250 large banner' },
      { slug: 'search.mid_infeed', label: 'Mid-results in-feed', size: 'infeed', hint: 'Native square ad between results' },
      { slug: 'search.results_bottom', label: 'Bottom of results', size: 'wide', hint: '970×90 wide banner' },
    ],
  },
  {
    key: 'store',
    name: 'Store profile',
    description: 'The public /store/[username] shop page.',
    slots: [
      { slug: 'store.sidebar', label: 'Left sidebar (MPU)', size: 'mpu', hint: '300×250 below seller card' },
      { slug: 'store.listings_bottom', label: 'Below listings', size: 'wide', hint: '970×90 wide banner' },
      { slug: 'store.right_rail', label: 'Right rail (skyscraper)', size: 'skyscraper', hint: '160×600 vertical, top of screen' },
    ],
  },
  {
    key: 'blog',
    name: 'Blog',
    description: 'Blog index + individual article pages.',
    slots: [
      { slug: 'blog.header_under', label: 'Blog index — under header', size: 'wide', hint: '970×90 wide banner' },
      { slug: 'blog.post_mid', label: 'Blog index — mid list', size: 'infeed', hint: 'Native square ad between posts' },
      { slug: 'blog.content_inline', label: 'Article — inline content', size: 'wide', hint: '970×90 inside article body' },
      { slug: 'blog.related_before', label: 'Article — before related', size: 'large', hint: '970×250 large banner' },
    ],
  },
  {
    key: 'ad',
    name: 'Product detail',
    description: 'The /ads/[id] single-listing page.',
    slots: [
      { slug: 'ad.post_description', label: 'After description', size: 'wide', hint: '970×90 wide banner' },
      { slug: 'ad.sidebar_mpu', label: 'Sidebar MPU', size: 'mpu', hint: '300×250 sidebar ad' },
      { slug: 'ad.sidebar_bottom', label: 'Sidebar bottom', size: 'mpu', hint: '300×250 second sidebar ad' },
    ],
  },
  {
    key: 'category',
    name: 'Category page',
    description: 'The /category/[slug] listing page.',
    slots: [
      { slug: 'category.filter_under', label: 'Under the filter bar', size: 'large', hint: '970×250 large banner' },
      { slug: 'category.mid_infeed', label: 'Mid-results in-feed', size: 'infeed', hint: 'Native square ad' },
      { slug: 'category.pre_pagination', label: 'Before pagination', size: 'wide', hint: '970×90 wide banner' },
    ],
  },
  {
    key: 'city',
    name: 'City page',
    description: 'The /city/[slug] listing page.',
    slots: [
      { slug: 'city.header_under', label: 'Under the page header', size: 'wide', hint: '970×90 wide banner' },
      { slug: 'city.mid_infeed', label: 'Mid-results in-feed', size: 'infeed', hint: 'Native square ad' },
      { slug: 'city.footer_above', label: 'Above the footer', size: 'large', hint: '970×250 large banner' },
    ],
  },
];

/** Flat lookup: slug → template. */
export const PLACEMENT_BY_SLUG: Record<string, PlacementTemplate> = Object.fromEntries(
  PLACEMENT_PAGES.flatMap((p) => p.slots.map((s) => [s.slug, s])),
);

/** Human label for an arbitrary (dynamic) slug, e.g. "ad.12.sidebar_mpu". */
export function describeSlug(slug: string): string {
  const exact = PLACEMENT_BY_SLUG[slug];
  if (exact) return exact.label;

  // Dynamic slugs like `ad.{id}.post_description`, `blog.{id}.content_inline`
  for (const page of PLACEMENT_PAGES) {
    for (const slot of page.slots) {
      const [prefix, key] = [slot.slug.split('.')[0], slot.slug.split('.').slice(1).join('.')];
      if (slug.endsWith(`.${key}`)) {
        return `${page.name} — ${slot.label}`;
      }
    }
  }
  return slug;
}

/** Which page a slug belongs to (best-effort for dynamic slugs). */
export function pageForSlug(slug: string): string {
  const top = slug.split('.')[0];
  const match = PLACEMENT_PAGES.find((p) => p.key === top);
  if (match) return match.key;
  // dynamic: blog.12.content_inline → blog
  const byKey = PLACEMENT_PAGES.find((p) => slug.startsWith(`${p.key}.`));
  return byKey?.key ?? 'home';
}
