/**
 * Serialize a nested filter map into the Laravel-style query string our
 * API expects:  filter[price][gte]=1000&filter[category]=1&sort=-created_at
 *
 * Accepts primitives, arrays, and 1-level nested objects. Any undefined
 * / null / "" value is dropped so URLs stay clean.
 */
export function toQueryString(params: Record<string, unknown>): string {
  const parts: string[] = [];

  const push = (key: string, value: unknown) => {
    if (value === null || value === undefined || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((v) => push(key, v));
      return;
    }
    if (typeof value === 'object') {
      Object.entries(value as Record<string, unknown>).forEach(([k, v]) => push(`${key}[${k}]`, v));
      return;
    }
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  };

  Object.entries(params).forEach(([k, v]) => push(k, v));
  return parts.join('&');
}
