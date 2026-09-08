const PAYMENT_HOSTS = [
  'dgepay.net',
  'sslcommerz.com',
  'esawda.com',
  'eshauda.com',
] as const;

/** Accept local paths or HTTPS URLs on an explicitly approved host tree. */
export function isSafePaymentRedirect(value: string): boolean {
  const candidate = value.trim();
  if (candidate.startsWith('/') && !candidate.startsWith('//')) return true;

  try {
    const url = new URL(candidate);
    if (url.protocol !== 'https:' || url.username || url.password) return false;
    if (url.port && url.port !== '443') return false;

    const host = url.hostname.toLowerCase();
    return PAYMENT_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
  } catch {
    return false;
  }
}
