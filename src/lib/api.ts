import { env } from './env';
import { readToken } from './auth';

/**
 * Thin fetch wrapper around the Laravel /api/v1 backend.
 *
 * - Injects `Accept: application/json` and, when running server-side,
 *   forwards the bearer token from cookies.
 * - Normalises the { data, meta, links } envelope so call sites can just
 *   destructure `data`.
 * - Throws `ApiError` with the { code, message, fields } from the backend
 *   so screens can render server-side validation without extra parsing.
 *
 * ISR / caching: `revalidate` lets pages opt into 60-second ISR for the
 * Browse / Detail routes as required by the SEO spec.
 */

export type ApiEnvelope<T> = { data: T; meta?: Record<string, unknown>; links?: Record<string, string | null> };

export type ApiErrorPayload = {
  code:    string;
  message: string;
  fields?: Record<string, string[]>;
};

export class ApiError extends Error {
  readonly status:  number;
  readonly code:    string;
  readonly fields?: Record<string, string[]>;
  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message);
    this.status = status;
    this.code   = payload.code;
    this.fields = payload.fields;
  }
}

type FetchOpts = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?:   unknown;
  token?:  string | null;
  headers?:Record<string, string>;
  revalidate?: number | false;
  tags?:      string[];
  cache?:     RequestCache;
};

export async function api<T>(path: string, opts: FetchOpts = {}): Promise<ApiEnvelope<T>> {
  const base = typeof window === 'undefined' ? env.api.serverBase : env.api.base;
  const url = path.startsWith('http') ? path : base + (path.startsWith('/') ? path : `/${path}`);

  // Auto-read token from memory/cookie if not explicitly provided
  const token = opts.token ?? readToken();

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(opts.body && !(opts.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...opts.headers,
  };

  const init: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {
    method:  opts.method ?? 'GET',
    headers,
    body:    opts.body === undefined ? undefined
             : opts.body instanceof FormData ? opts.body
             : JSON.stringify(opts.body),
    cache:   opts.cache,
  };
  if (opts.revalidate !== undefined || opts.tags) {
    init.next = { revalidate: opts.revalidate, tags: opts.tags };
  }

  const res = await fetch(url, init);
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await res.json() : null;

  if (!res.ok) {
    const err: ApiErrorPayload = payload?.error ?? { code: 'HTTP_ERROR', message: res.statusText };
    throw new ApiError(res.status, err);
  }
  return payload as ApiEnvelope<T>;
}

/** Server-only helper — reads the auth token from a Next Route cookie. */
export async function apiFromServer<T>(path: string, opts: FetchOpts = {}): Promise<ApiEnvelope<T>> {
  const { cookies } = await import('next/headers');
  const token = (await cookies()).get('eshauda_token')?.value ?? null;
  return api<T>(path, { ...opts, token });
}
