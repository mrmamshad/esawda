import type { Metadata } from 'next';
import { Fragment } from 'react';
import { FileText } from 'lucide-react';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { BlogHero } from '@/components/blog/BlogHero';
import { BlogCard } from '@/components/blog/BlogCard';
import { CategoryChip } from '@/components/blog/CategoryChip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { AdSlot } from '@/components/ads/AdSlot';
import { apiFromServer, ApiError } from '@/lib/api';
import { getSessionUser } from '@/lib/session';
import { toQueryString } from '@/lib/queryString';
import type { Blog, BlogCategory } from '@/types/api';

export const metadata: Metadata = { title: 'Blog' };
export const revalidate = 300;

type Search = Promise<{ page?: string; q?: string }>;

export default async function BlogIndex({ searchParams }: { searchParams: Search }) {
  const user = await getSessionUser();
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  const q    = (sp.q ?? '').trim();

  let posts: Blog[] = [];
  let meta = { current_page: 1, last_page: 1, per_page: 9, total: 0 };
  let cats: BlogCategory[] = [];
  let error: string | null = null;
  try {
    const [postsRes, catsRes] = await Promise.all([
      apiFromServer<Blog[]>(`/blogs?${toQueryString({ page, per_page: 9, q: q || undefined })}`),
      apiFromServer<BlogCategory[]>('/blog-categories'),
    ]);
    posts = (postsRes.data ?? []) as Blog[];
    meta  = { ...meta, ...(postsRes.meta as Partial<typeof meta>) };
    cats  = (catsRes.data ?? []) as BlogCategory[];
  } catch (e) {
    error = e instanceof ApiError ? e.message : 'Could not load blog posts.';
  }

  const featured = posts[0];
  const rest = featured ? posts.slice(1) : [];

  return (
    <>
      <Header variant="default" user={user ?? undefined} />
      <HeaderSpacer />
      <main className="container-page py-10">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-ink">Blog</h1>
            <p className="mt-2 text-base text-ink-muted">Guides, tips, and news for buyers and sellers.</p>
          </div>
          <form action="/blog" className="flex items-center gap-2">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search posts…"
              className="h-11 w-64 rounded-field border border-line bg-white px-3.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:border-brand-500"
            />
          </form>
        </header>

        {/* AD SLOT — wide banner, header-under. */}
        <AdSlot placement="blog.header_under" size="wide" />

        {error ? (
          <EmptyState title="Couldn't load posts" description={error} />
        ) : posts.length === 0 ? (
          <EmptyState icon={<FileText size={20} />} title="No posts yet" description={q ? 'Try a different search term.' : 'Check back soon.'} />
        ) : (
          <div className="grid gap-8 md:grid-cols-[1fr_240px]">
            <div className="space-y-8">
              {featured && page === 1 && !q && <BlogHero blog={featured} />}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {(page === 1 && !q ? rest : posts).map((b, i) => (
                  <Fragment key={b.id}>
                    <BlogCard blog={b} />
                    {/* AD SLOT — in-feed native after 3rd card. */}
                    {i === 2 && <AdSlot placement="blog.post_mid" size="infeed" />}
                  </Fragment>
                ))}
              </div>
              <Pagination current={meta.current_page} last={meta.last_page} basePath="/blog" params={{ q: q || undefined }} />
            </div>

            <aside className="space-y-4">
              <div className="surface-card p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Categories</h3>
                {cats.length === 0 ? (
                  <p className="mt-3 text-sm text-ink-faint">No categories yet.</p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {cats.map((c) => (
                      <CategoryChip key={c.id} label={c.title} href={c.slug ? `/blog/category/${c.slug}` : undefined} />
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}
