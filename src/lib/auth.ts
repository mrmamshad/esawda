/**
 * Client-side auth helpers.
 *
 * The Sanctum token is delivered to the browser as an HttpOnly + Secure
 * cookie set by the backend, so browser JS cannot read it. This module
 * keeps an in-memory copy for the current SPA session (so client-side
 * `api()` calls can attach `Authorization: Bearer` without a round-trip)
 * and exposes the cookie for the Next.js server (`apiFromServer`).
 *
 * No localStorage mirror and no JS-writable cookie — removing the XSS
 * token-theft vector that the old implementation had.
 */

const COOKIE = 'eshauda_token';

// In-memory copy, valid for this page lifetime. Lost on hard reload —
// which is fine: the HttpOnly cookie still authenticates server renders,
// and the SPA re-reads auth from `/auth/me` on boot.
let memoryToken: string | null = null;

export function saveToken(token: string) {
  memoryToken = token;
  // The backend already set the HttpOnly cookie; nothing to do here.
}

export function clearToken() {
  memoryToken = null;
  if (typeof document === 'undefined') return;
  // Best-effort expire of the cookie (cleared server-side on logout too).
  document.cookie = `${COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function readToken(): string | null {
  if (memoryToken) return memoryToken;
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
  return m ? decodeURIComponent(m[1]!) : null;
}

export function isAuthed(): boolean { return !!readToken(); }
