/**
 * Environment variables surface. Kept typed and narrow so pages that
 * need public config can import `env.api.base` without ever touching
 * `process.env` directly (typos become type errors).
 */
const _api = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8100/api/v1';
const _site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const env = {
  api:  { base: _api.replace(/\/+$/, '') },
  site: { base: _site.replace(/\/+$/, ''), name: 'eSawda' },
} as const;
