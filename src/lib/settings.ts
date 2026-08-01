import { apiFromServer, ApiError } from './api';

/**
 * Site settings coming from the Laravel `/api/v1/settings` endpoint.
 * Only the fields we actually consume are typed — the endpoint returns
 * a much larger legacy blob, but we treat it as an opaque bag beyond
 * these keys.
 */
export type SiteSettings = {
  site_name:        string;
  site_title:       string;
  site_logo?:       string;
  meta_description?:string;
  contact_email?:   string;
  contact_phone?:   string;
  contact_address?: string;
  home_banner?:     string;
  copyright_text?:  string;
  facebook_link?:   string;
  twitter_link?:    string;
  youtube_link?:    string;
  // Everything else is passed through as unknown strings.
  [k: string]: unknown;
};

/**
 * Server-only settings fetch with graceful fallback. Cached for 5 minutes
 * via Next's `revalidate` so admin edits propagate without a restart while
 * still keeping request-fanout to a minimum.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const fallback: SiteSettings = {
    site_name:  'eSawda',
    site_title: 'eSawda — Buy, Sell, Browse Ads',
  };
  try {
    const res = await apiFromServer<{ settings: SiteSettings }>(
      '/settings',
      { revalidate: 300, tags: ['settings'] }
    );
    // The endpoint envelope is { data: { settings: {...} } }.
    const s = (res.data as unknown as { settings: SiteSettings }).settings;
    return { ...fallback, ...s };
  } catch (e) {
    if (e instanceof ApiError) return fallback;
    throw e;
  }
}
