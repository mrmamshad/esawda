/**
 * Client-side auth helpers. Token lives in a cookie so the Next.js server
 * can forward it via `apiFromServer`, and localStorage mirror so the SPA
 * can pass it to fetch without waiting for a round-trip.
 */

const COOKIE = 'eshauda_token';
const STORE  = 'eshauda_token';

export function saveToken(token: string) {
  if (typeof document === 'undefined') return;
  const maxAge = 60 * 60 * 24 * 30; // 30 days
  document.cookie = `${COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  try { localStorage.setItem(STORE, token); } catch {}
}

export function clearToken() {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  try { localStorage.removeItem(STORE); } catch {}
}

export function readToken(): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
  if (m) return decodeURIComponent(m[1]!);
  try { return localStorage.getItem(STORE); } catch { return null; }
}

export function isAuthed(): boolean { return !!readToken(); }
