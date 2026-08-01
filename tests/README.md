# eShauda — Frontend Test Plan

Test spec for the 14 pages added in the Dashboard / Messages / Membership / Blog
implementation pass. Every scenario is verifiable end-to-end with the
Playwright MCP against a locally running dev server.

## Environment

- Laravel API: `http://127.0.0.1:8100` (with seeded fixtures — `test@quickad.local / password123`, `pwtester@quickad.local / password123`)
- Next.js:    `http://localhost:3000`
- Auth cookie: `eshauda_token=<sanctum bearer>` (set on login)

Run:

```bash
# terminal 1
php artisan serve --host=127.0.0.1 --port=8100
# terminal 2
cd frontend && npm run dev
```

---

## Dashboard

### `/dashboard`
- ✅ Auth: redirects to `/auth/login?redirect=/dashboard` when no token (visual match: emerald cards, 3-col stat grid).
- ✅ Happy: 4 StatCards render with numbers; recent ads grid (3 items) + recent messages list.
- ⚠ Empty state (0 ads): EmptyState renders with "Post your first ad" CTA. Design match: brand-50 bg pill.
- ⚠ Empty state (0 messages): EmptyState in messages card.
- 🔥 API 500: whole shell still renders; sections show "Couldn't load" fallback (no white-screen crash).
- Design tokens: brand-700 buttons, brand-500 icons, `.surface-card` on each block.

### `/dashboard/my-ads`
- ✅ Auth: redirect same pattern.
- ✅ Happy: TableRows render with title + status Badge + Edit/Hide/Delete ghost buttons.
- Tabs: click "Pending" → URL `?tab=pending`, only pending items shown; badge color = urgent (warning).
- Search: type in q → form submit → URL contains `?q=`.
- Empty (no ads at all): EmptyState "No ads in this view".
- Empty (search miss): "No matching ads" with different copy.
- Pagination edge: page 1 (Prev disabled 40% opacity), last page (Next disabled), single page (Pagination hides itself).
- Invalid `?page=abc`: parseInt fallback → page 1, no crash.

### `/dashboard/favourites`
- ✅ Auth: redirect.
- ✅ Happy: ListingCard grid (3 col lg / 2 col md / 1 col mobile).
- Empty: brand-50 EmptyState with heart icon + "Browse ads" CTA.
- Pagination: same as My Ads.

### `/dashboard/settings`
- ✅ Auth: redirect.
- ✅ Form: name/email/phone/city/country/tagline/about-you prefilled from `/auth/me`.
- Update happy: submit → toast "Profile updated." (brand-500 border-left).
- Validation: submit with empty email → red border + `Emailrequired.` message under field.
- Validation: submit with existing other-user email → 422 → per-field error rendered.
- Sub-nav: Profile pill filled brand-700, Password pill neutral.

### `/dashboard/settings/password`
- ✅ Auth: redirect.
- ✅ Happy: fill current + new + confirm → toast success → fields cleared.
- Mismatch: new ≠ confirm → inline "Passwords do not match." error, no request sent.
- Wrong current: 422 → toast danger + red border on `current_password`.

### `/dashboard/transactions`
- ✅ Auth: redirect.
- ✅ Happy: InvoiceRow list with status Badge (paid=success green, pending=urgent amber, failed=muted).
- Empty: brand-50 EmptyState with receipt icon.
- Filter `?status=paid` → only paid shown.

---

## Messages

### `/messages`
- ✅ Auth: redirect to login.
- ✅ Happy: threads list on left (320px), placeholder "Select a conversation" on right.
- Search: local filter of threads.
- Empty inbox: EmptyState with "Browse ads" CTA.
- Unread badge: brand-700 filled pill on ThreadListItem when `unread_count > 0`.

### `/messages/[userId]`
- ✅ Auth: redirect preserving `?redirect=/messages/{id}`.
- ✅ Invalid id (0 or NaN): EmptyState "Invalid conversation".
- ✅ Happy: header shows counterpart avatar+online+"View profile", body shows bubbles (mine=brand-700 right, other=brand-100 left), composer at bottom.
- Send: type + Enter → optimistic-ish (busy state), then real fetch → new bubble appears.
- Send fail: composer stays enabled, red banner "Failed to send." appears, no bubble added.
- Polling: 8s interval refetches — new incoming message appears.
- Empty thread: "No messages yet" EmptyState.
- Design: bubbles use `rounded-card` + `rounded-br-md` / `rounded-bl-md` corners for chat tail effect.

---

## Membership

### `/membership`
- ✅ Public (works logged out).
- ✅ Happy: 3 PlanCards centered under hero, PricingToggle above.
- Featured plan: brand-700 ring, "Most popular" Badge, filled CTA.
- Toggle Annual: prices switch, "Save 20%" chip appears in active state.
- Empty (no plans): "No plans available" EmptyState.
- CTA click: navigates to `/membership/checkout/{id}?cadence=…`.

### `/membership/checkout/[planId]`
- ✅ Auth: redirect to login preserving redirect URL.
- ✅ Happy: 3 method radio-cards (Stripe/PayPal/Wire), order summary sticky on right.
- Click radio: brand-700 ring appears; icon square switches to brand-700 fill.
- Complete purchase: 600ms fake delay → router push to `/membership/success?...`.
- Invalid planId (999): EmptyState "Plan not found".
- Design: sticky sidebar (`lg:sticky lg:top-6`), 2xl bold total.

### `/membership/success`
- ✅ Public.
- ✅ Renders brand-100 check circle, "You're all set", 2 CTAs (Go to dashboard / View receipt).

### `/membership/failed`
- ✅ Public.
- ✅ Renders danger circle, retry + back buttons.

---

## Blog

### `/blog`
- ✅ Public.
- ✅ Happy: BlogHero (page 1, no search) + 3-col BlogCard grid + categories sidebar.
- Empty (no posts): FileText icon EmptyState.
- Search: `?q=xyz` → hero hides, filtered grid only.
- Pagination: correct URL preserves `?q=`.
- Category chip in sidebar → navigates to `/blog/category/{slug}`.

### `/blog/[idSlug]`
- ✅ Public.
- ✅ 404: unknown id → Next.js `notFound()` triggers.
- ✅ Happy: title, author meta (avatar + name + date + N min read), cover image aspect-16/9 rounded-card, article body (`prose` classes), share row (SocialRow with 4 platforms), author card, related posts (3).
- Read time: word count / 220 wpm, floor min 1.
- SocialRow: only shows platforms with URLs (all 4 hard-wired for share).
- Design: max-w-3xl reading column, brand-500 blockquote border-left.

### `/blog/category/[slug]`
- ✅ Public.
- ✅ Happy: category title from `/blog-categories` lookup, count, grid.
- Unknown slug: shows slug as title + "No posts in this category" EmptyState.

### `/blog/author/[username]`
- ✅ Public.
- ✅ Happy: xl avatar + name + `@username` + count + posts grid.
- Unknown author: 0 posts → EmptyState + avatar fallback.

---

## Global cross-cutting

- **Design tokens locked:** brand-{950..50}, ink/ink-muted/ink-faint, `.surface-card`, `.container-page`, `.pill`, `rounded-{card,field,pill}`, Inter font, 8pt spacing.
- **No new colors introduced.**
- **No overrides in components** (verified by grep: `#[0-9a-f]{6}` should return zero hits outside `tailwind.config.ts` + `globals.css`).
- **Focus rings** everywhere via `.btn-focus` (brand-500 ring, offset-2).
- **Empty/error states** use the same `EmptyState` primitive.
- **Toast/Modal** use popover shadow + surface-card + emerald tones.
- **Skeletons** monochrome brand-100.

---

## Playwright MCP verification checklist

For each route above:

1. `browser_navigate` to URL.
2. `browser_snapshot` — validate a11y tree contains expected headings / landmarks.
3. `browser_take_screenshot` — visual smoke against reference tokens.
4. Interact (click tabs, type in search, submit forms) with `browser_click` / `browser_type`.
5. Verify follow-up state (URL query, toast text, error message).
6. Test negative case (invalid input, unauth, missing data).
