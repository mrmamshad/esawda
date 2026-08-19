/**
 * Client-side auth helpers.
 *
 * The Sanctum token is delivered to the browser as an HttpOnly + Secure
 * cookie set by the backend, so browser JS cannot read it. This module
 * keeps an in-memory copy for the current SPA session (so client-side
 * `api()` calls can attach `Authorization: Bearer` without a round-trip)
 * and exposes the cookie for the Next.js server (`apiFromServer`).
 *
 * Because the backend cookie is host-only on the API origin, a full-page
 * navigation (e.g. the SSLCommerz gateway round-trip) would otherwise drop
 * auth from the Next.js server render. `saveToken` mirrors the token into a
 * non-HttpOnly cookie on the FE origin so server renders (`/auth/me`,
 * dashboard, success page) stay authenticated across redirects. The token
 * is already reachable via JS (in-memory copy), so this does not add a
 * material XSS surface beyond the existing one.
 */

const COOKIE = 'eshauda_token';
const FE_COOKIE_DAYS = 7;

// In-memory copy, valid for this page lifetime. Lost on hard reload —
// which is fine: the HttpOnly cookie still authenticates server renders,
// and the SPA re-reads auth from `/auth/me` on boot.
let memoryToken: string | null = null;

// Broadcast login/logout so the AuthGate (mounted across full-page
// navigations) can re-resolve the session — without this, the header
// user chip only appears after a hard reload.
function notifyAuthChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('eshauda:authchange'));
}

export function saveToken(token: string) {
  memoryToken = token;
  // Mirror into a JS-readable cookie on the FE origin so server renders
  // survive gateway redirects (the backend's own cookie is host-only on
  // the API origin and never reaches the Next.js server).
  if (typeof document !== 'undefined') {
    document.cookie = `${COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${FE_COOKIE_DAYS * 86400}; SameSite=Lax`;
  }
  notifyAuthChanged();
}

export function clearToken() {
  memoryToken = null;
  if (typeof document === 'undefined') return;
  // Best-effort expire of the cookie (cleared server-side on logout too).
  document.cookie = `${COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  notifyAuthChanged();
}

export function readToken(): string | null {
  if (memoryToken) return memoryToken;
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
  return m ? decodeURIComponent(m[1]!) : null;
}

export function isAuthed(): boolean { return !!readToken(); }
