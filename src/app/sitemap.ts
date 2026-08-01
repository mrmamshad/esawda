import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';
import { api } from '@/lib/api';
import type { Ad } from '@/types/api';

/**
 * Dynamic sitemap. Merges static routes with the newest 1000 ads
 * fetched from the API. Safe to fail: if the API is unreachable we
 * still emit the static portion so search engines never see 500s.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.site.base;
  const now  = new Date();

  const stat: MetadataRoute.Sitemap = [
    { url: `${base}/`,          lastModified: now, changeFrequency: 'daily',  priority: 1 },
    { url: `${base}/ads`,       lastModified: now, changeFrequency: 'daily',  priority: 0.9 },
    { url: `${base}/categories`,lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/plans`,     lastModified: now, changeFrequency: 'monthly',priority: 0.4 },
  ];

  try {
    const { data } = await api<Ad[]>('/ads?per_page=1000&sort=-created_at', { revalidate: 3600 });
    const dyn = data.map<MetadataRoute.Sitemap[number]>((a) => ({
      url:            `${base}/ads/${a.url_slug}`,
      lastModified:   a.created_at ? new Date(a.created_at) : now,
      changeFrequency:'weekly',
      priority:       0.6,
    }));
    return [...stat, ...dyn];
  } catch {
    return stat;
  }
}
