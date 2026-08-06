---
title: eSawda Ad Banner Placement Specification
subtitle: Page-by-page ad slot map, sizes, and ratios
author: Frontend Engineering
date: 2026-08-06
---

# eSawda — Ad Banner Placement Specification

This document defines every ad banner placeholder reserved on the eSawda frontend. It is the single source of truth for the design, admin, and ad-ops teams. Each slot has a fixed `placement` id, a fixed aspect ratio, and a fixed page position. Sizes follow the IAB Universal Ad Package where possible.

---

## 1. Global conventions

### 1.1 Placeholder styling
- 2 px dashed border in `ink/20`
- Crosshatched background (`repeating-linear-gradient(135deg, ...)`)
- Corner brackets at top-left and bottom-right
- Top-left pill: `● Ad · {W × H}` (the only text shown)
- Center caption: `Ad will be here`
- Wrapped in `<aside data-ad-slot="..." data-ad-size="..." aria-label="Advertisement">` for ad-server targeting

### 1.2 Size catalog

| Size key    | Dimensions  | Use case                          | Notes                    |
|-------------|-------------|-----------------------------------|--------------------------|
| `leaderboard` | 728 × 90   | Compact horizontal, light pages   | Deprecated, prefer `wide` |
| `wide`        | 970 × 90   | Full-width horizontal banner      | Most common              |
| `large`       | 970 × 250  | High-impact hero/footer banner    | Highest CPM               |
| `mpu`         | 300 × 250  | Sidebar medium rectangle          | Sidebar-only              |
| `infeed`      | Native      | In-grid native ad                 | Fits grid cell            |

> **Ratio note:** all sizes are fixed-aspect. The placeholder reserves the exact pixel height so layout never shifts when the real creative loads.

---

## 2. Home page (`/`)

Total slots: **4**

| # | Placement id                | Size   | Position                                        |
|---|----------------------------|--------|-------------------------------------------------|
| 1 | `home.hero_under`          | large  | Directly below the `HomeHero` component         |
| 2 | `home.sponsored_infeed`    | infeed | After the 3rd card inside the "Sponsored" grid  |
| 3 | `home.after_preowned`      | wide   | Below the "Pre-owned" / "Great condition" grid  |
| 4 | `home.pre_cta`             | wide   | Above the orange final CTA block                |

---

## 3. Browse / search results (`/ads`)

Total slots: **3**

| # | Placement id              | Size   | Position                                          |
|---|---------------------------|--------|---------------------------------------------------|
| 1 | `search.filter_under`     | large  | Directly below the condition-filter chip row      |
| 2 | `search.mid_infeed`       | infeed | After the 9th listing card                        |
| 3 | `search.results_bottom`   | wide   | Below the results grid, above pagination          |

---

## 4. Category page (`/category/[cat]`)

Total slots: **3** (placement id is suffixed with the category slug)

| # | Placement id                          | Size   | Position                              |
|---|---------------------------------------|--------|---------------------------------------|
| 1 | `category.<slug>.filter_under`        | large  | Below the page header, above the grid |
| 2 | `category.<slug>.mid_infeed`          | infeed | After the 6th listing card            |
| 3 | `category.<slug>.pre_pagination`      | wide   | Below the grid, above pagination      |

Example: a visitor on `/category/vehicles` produces placements `category.vehicles.filter_under`, `category.vehicles.mid_infeed`, `category.vehicles.pre_pagination`.

---

## 5. Ad detail page (`/ads/[idSlug]`)

Total slots: **3** (placement id is suffixed with the ad id)

| # | Placement id                       | Size | Position                                          |
|---|------------------------------------|------|---------------------------------------------------|
| 1 | `ad.<id>.sidebar_mpu`              | mpu  | Top of the right sidebar, directly below seller   |
| 2 | `ad.<id>.post_description`         | wide | Inline below the reviews section, above related   |
| 3 | `ad.<id>.sidebar_bottom`           | mpu  | Bottom of the right sidebar                       |

---

## 6. City page (`/city/[city]`)

Total slots: **3** (placement id is suffixed with the city slug)

| # | Placement id                  | Size   | Position                                  |
|---|-------------------------------|--------|-------------------------------------------|
| 1 | `city.<slug>.header_under`    | wide   | Below the page header, above the grid     |
| 2 | `city.<slug>.mid_infeed`      | infeed | After the 8th listing card                |
| 3 | `city.<slug>.footer_above`    | large  | Below the grid, above pagination          |

---

## 7. Blog index (`/blog`)

Total slots: **2**

| # | Placement id           | Size   | Position                                  |
|---|------------------------|--------|-------------------------------------------|
| 1 | `blog.header_under`    | wide   | Below the page header                     |
| 2 | `blog.post_mid`        | infeed | After the 3rd post card (page 1, no query)|

---

## 8. Blog post (`/blog/[idSlug]`)

Total slots: **2** (placement id is suffixed with the post id)

| # | Placement id                          | Size   | Position                                  |
|---|---------------------------------------|--------|-------------------------------------------|
| 1 | `blog.<id>.content_inline`            | wide   | Inline below the article body, above share|
| 2 | `blog.<id>.related_before`            | large  | Above the "Related posts" section         |

> A 3rd sidebar-MPU was originally planned, but the post template currently has no right rail. Add it if a sidebar is later introduced.

---

## 9. Roll-up summary

| Page           | # slots | Sizes used                        |
|----------------|---------|-----------------------------------|
| Home           | 4       | large × 1, wide × 2, infeed × 1   |
| Browse /ads    | 3       | large × 1, wide × 1, infeed × 1   |
| Category       | 3       | large × 1, wide × 1, infeed × 1   |
| Ad detail      | 3       | mpu × 2, wide × 1                 |
| City           | 3       | wide × 1, large × 1, infeed × 1   |
| Blog index     | 2       | wide × 1, infeed × 1              |
| Blog post      | 2       | wide × 1, large × 1               |
| **Total**      | **20**  | —                                 |

---

## 10. Backlog (not yet wired)

These placements are designed but not yet rendered:

| Page                | Slot                  | Size   | Notes                                |
|---------------------|-----------------------|--------|--------------------------------------|
| Membership /plans   | `membership.hero_under`  | large  | Below the pricing hero             |
| Membership /plans   | `membership.pre_footer`  | wide   | Above the FAQ block                |
| Static /terms       | `static.terms.bottom`    | wide   | Bottom of the terms page           |
| Static /privacy     | `static.privacy.bottom`  | wide   | Bottom of the privacy page         |
| Static /faq         | `static.faq.bottom`      | wide   | Bottom of the FAQ page             |
| Static /about       | `static.about.bottom`    | wide   | Bottom of the about page           |
| Static /contact     | `static.contact.bottom`  | wide   | Bottom of the contact page         |
| Shop seller profile | `shop.<slug>.banner_under` | wide | Below the seller banner           |
| Shop seller profile | `shop.<slug>.listing_mid` | infeed | After the 4th listing             |
| Shop seller profile | `shop.<slug>.sidebar_mpu` | mpu   | Right column                       |

> **Excluded by design:** dashboard and other authed pages — low CTR, advertisers avoid.

---

## 11. Implementation notes

- All slots are rendered through a single component, `src/components/ads/AdSlot.tsx`.
- `ListingGrid` (used by `/category`, `/city`) accepts optional `topSlot`, `midSlot`, `bottomSlot`, and `midAfter` props.
- `BrowsePage` (`/ads`) and the blog pages wire slots inline since their grid markup is bespoke.
- Each rendered `<aside>` carries `data-ad-slot` and `data-ad-size` attributes. The future ad-server client should select on these.

## 12. Future work

1. Backend: add a `sponsors` table (image, click URL, placement enum, start/end, weight, active).
2. Admin UI: CRUD for sponsors, scoped by `placement`.
3. Replace placeholder body with a real `<img>` / `<iframe>` renderer gated on a sponsor fetch.
4. Viewability tracking via IntersectionObserver, fire on 50 % visible for 1 s.
5. Frequency cap (max 3 impressions per slot per session per user).
