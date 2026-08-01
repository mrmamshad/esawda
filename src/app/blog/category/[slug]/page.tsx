import type { Metadata } from 'next';
import { FileText } from 'lucide-react';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { BlogCard } from '@/components/blog/BlogCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { apiFromServer, ApiError } from '@/lib/api';
import { getSessionUser } from '@/lib/session';
import { toQueryString } from '@/lib/queryString';
import type { Blog, BlogCategory } from '@/types/api';

type Params = Promise<{ slug: string }>;
type Search = Promise<{ page?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Category: ${slug}` };
}

export const revalidate = 300;

export default async function BlogCategoryPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  const user = await getSessionUser();

  let posts: Blog[] = [];
  let meta = { current_page: 1, last_page: 1, per_page: 9, total: 0 };
  let category: BlogCategory | undefined;
  let error: string | null = null;
  try {
    const [postsRes, catsRes] = await Promise.all([
      apiFromServer<Blog[]>(`/blogs?${toQueryString({ category: slug, page, per_page: 9 })}`),
      apiFromServer<BlogCategory[]>('/blog-categories'),
    ]);
    posts = (postsRes.data ?? []) as Blog[];
    meta  = { ...meta, ...(postsRes.meta as Partial<typeof meta>) };
    category = ((catsRes.data ?? []) as BlogCategory[]).find((c) => c.slug === slug);
  } catch (e) {
    error = e instanceof ApiError ? e.message : 'Could not load posts.';
  }


  return (
    <>
      <Header variant="default" user={user ?? undefined} />
      <HeaderSpacer />
      <main className="container-page py-10">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Category</p>
          <h1 className="mt-1 text-3xl font-bold text-ink">{category?.title ?? slug}</h1>
          <p className="mt-2 text-sm text-ink-muted">{meta.total} post{meta.total === 1 ? '' : 's'}</p>
        </header>

        {error ? (
          <EmptyState title="Couldn't load posts" description={error} />
        ) : posts.length === 0 ? (
          <EmptyState icon={<FileText size={20} />} title="No posts in this category" description="Try a different category." />
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((b) => <BlogCard key={b.id} blog={b} />)}
            </div>
            <Pagination current={meta.current_page} last={meta.last_page} basePath={`/blog/category/${slug}`} />
          </>
        )}
      </main>
    </>
  );
}
