import type { Metadata } from 'next';
import { FileText } from 'lucide-react';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { BlogCard } from '@/components/blog/BlogCard';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { apiFromServer, ApiError } from '@/lib/api';
import { getSessionUser } from '@/lib/session';
import { toQueryString } from '@/lib/queryString';
import type { Blog } from '@/types/api';

type Params = Promise<{ username: string }>;
type Search = Promise<{ page?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { username } = await params;
  return { title: `Posts by @${username}` };
}

export const revalidate = 300;

export default async function BlogAuthorPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { username } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  const user = await getSessionUser();

  let posts: Blog[] = [];
  let meta = { current_page: 1, last_page: 1, per_page: 9, total: 0 };
  let error: string | null = null;
  try {
    const res = await apiFromServer<Blog[]>(`/blogs?${toQueryString({ author: username, page, per_page: 9 })}`);
    posts = (res.data ?? []) as Blog[];
    meta  = { ...meta, ...(res.meta as Partial<typeof meta>) };
  } catch (e) {
    error = e instanceof ApiError ? e.message : 'Could not load posts.';
  }

  const authorInfo = posts[0]?.author;

  return (
    <>
      <Header variant="default" user={user ?? undefined} />
      <HeaderSpacer />
      <main className="container-page py-10">
        <header className="mb-8 flex flex-col items-center gap-3 text-center">
          <Avatar src={authorInfo?.avatar_url} alt={authorInfo?.name ?? username} size="xl" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Author</p>
            <h1 className="mt-1 text-3xl font-bold text-ink">{authorInfo?.name ?? username}</h1>
            <p className="mt-1 text-sm text-ink-muted">@{username} · {meta.total} post{meta.total === 1 ? '' : 's'}</p>
          </div>
        </header>

        {error ? (
          <EmptyState title="Couldn't load posts" description={error} />
        ) : posts.length === 0 ? (
          <EmptyState icon={<FileText size={20} />} title="No posts by this author" description="They haven't published anything yet." />
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((b) => <BlogCard key={b.id} blog={b} />)}
            </div>
            <Pagination current={meta.current_page} last={meta.last_page} basePath={`/blog/author/${username}`} />
          </>
        )}
      </main>
    </>
  );
}
