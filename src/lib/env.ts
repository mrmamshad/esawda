/**
 * Environment variables surface. Kept typed and narrow so pages that
 * need public config can import `env.api.base` without ever touching
 * `process.env` directly (typos become type errors).
 */
const _api = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8100/api/v1';
const _serverApi = process.env.API_SERVER_URL ?? _api;
const _site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
// Google Analytics 4 measurement ID (e.g. G-XXXXXXXXXX). When empty the
// gtag snippet is skipped entirely, so dev/build never ships a broken tag.
const _ga = process.env.NEXT_PUBLIC_GA_ID ?? '';

export const env = {
  api:  {
    base: _api.replace(/\/+$/, ''),
    serverBase: _serverApi.replace(/\/+$/, ''),
  },
  site: { base: _site.replace(/\/+$/, ''), name: 'eSawda' },
  analytics: { gaId: _ga },
} as const;
