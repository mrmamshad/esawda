/**
 * Small formatting helpers — kept centralised so every screen shows dates,
 * money, and relative time identically. No new tokens introduced.
 */

export function formatMoney(amount: number, currency: string = 'USD'): string {
  // BDT-first: always emit ৳1,234 style regardless of caller. Non-BDT
  // amounts fall back to the browser's Intl formatter.
  if (!currency || currency === 'BDT' || currency === 'USD' || currency === '$' || currency === '৳') {
    const rounded = Math.round(amount);
    return `৳${new Intl.NumberFormat('en-IN').format(rounded)}`;
  }
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount)}`;
  }
}

export function formatDate(iso: string | null | undefined, opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', opts).format(d);
}

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return '';
  const s = Math.max(1, Math.floor((Date.now() - d) / 1000));
  if (s < 60)    return `${s}s`;
  const m = Math.floor(s / 60);   if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);   if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7); if (weeks < 5) return `${weeks}w`;
  const months = Math.floor(days / 30); if (months < 12) return `${months}mo`;
  return `${Math.floor(days / 365)}y`;
}

export function initials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '?';
}
