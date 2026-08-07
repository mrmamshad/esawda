import Link from 'next/link';
import Image from 'next/image';
import type { Route } from 'next';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { CategoryChip } from '@/components/blog/CategoryChip';
import { AuthorMeta } from '@/components/blog/AuthorMeta';
import { BlogCard } from '@/components/blog/BlogCard';
import { SocialRow } from '@/components/ui/SocialRow';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { AdSlot } from '@/components/ads/AdSlot';
import { apiFromServer, ApiError } from '@/lib/api';
import { sanitizeHtml } from '@/lib/sanitize';
import { getSessionUser } from '@/lib/session';
import type { Blog } from '@/types/api';

type Params = Promise<{ idSlug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { idSlug } = await params;
  try {
    const res = await apiFromServer<Blog>(`/blogs/${idSlug}`);
    return { title: res.data.title, description: res.data.excerpt };
  } catch { return { title: 'Blog post' }; }
}

export const revalidate = 300;

export default async function BlogSingle({ params }: { params: Params }) {
  const { idSlug } = await params;
  const user = await getSessionUser();

  let blog: Blog | null = null;
  let related: Blog[] = [];
  try {
    const res = await apiFromServer<Blog>(`/blogs/${idSlug}`);
    blog = res.data;
    const rel = await apiFromServer<Blog[]>('/blogs?per_page=3');
    related = ((rel.data ?? []) as Blog[]).filter((r) => r.id !== blog!.id).slice(0, 3);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
  }

  if (!blog) notFound();
  const words = (blog.description || '').replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  const readMin = Math.max(1, Math.round(words / 220));
  const cat = blog.categories?.[0];

  return (
    <>
      <Header variant="default" user={user ?? undefined} />
      <HeaderSpacer />
      <main className="container-page py-10">
        <Link href={'/blog' as Route} className="inline-flex items-center gap-1 text-sm font-medium text-ink-muted hover:text-ink">
          <ArrowLeft size={14} /> Back to blog
        </Link>

        <article className="mx-auto mt-6 max-w-3xl">
          {cat && <CategoryChip label={cat.title} href={cat.slug ? `/blog/category/${cat.slug}` : undefined} />}
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-ink">{blog.title}</h1>
          <div className="mt-4">
            <AuthorMeta author={blog.author} date={blog.created_at} readMinutes={readMin} />
          </div>

          {blog.image_url && (
            <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-card bg-surface-muted">
              <Image src={blog.image_url} alt={blog.title} fill sizes="(min-width:1024px) 768px, 100vw" className="object-cover" priority />
            </div>
          )}

          <div
            className="prose prose-neutral mt-8 max-w-none text-base leading-7 text-ink
                       prose-headings:font-bold prose-headings:text-ink
                       prose-a:text-brand-700 prose-a:no-underline hover:prose-a:text-brand-600 hover:prose-a:underline
                       prose-blockquote:border-l-4 prose-blockquote:border-brand-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-ink-muted
                       prose-code:rounded prose-code:bg-surface-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm
                       prose-img:rounded-card"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(blog.description ?? '') }}
          />

          {/* AD SLOT — wide inline, post-content. Catches the engaged reader
              between the article and the share/author/related blocks. */}
          <AdSlot placement={`blog.${blog.id}.content_inline`} size="wide" />

          <div className="mt-10 border-t border-line pt-6">
            <p className="mb-3 text-sm font-medium text-ink">Share this post</p>
            <SocialRow socials={{
              facebook:  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`/blog/${blog.url_slug}`)}`,
              twitter:   `https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(`/blog/${blog.url_slug}`)}`,
              linkedin:  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`/blog/${blog.url_slug}`)}`,
              pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(`/blog/${blog.url_slug}`)}&description=${encodeURIComponent(blog.title)}`,
            }} />
          </div>

          {blog.author && (
            <div className="mt-8 surface-card flex items-start gap-4 p-6">
              <Avatar src={blog.author.avatar_url} alt={blog.author.name} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink-muted">Author</p>
                <p className="text-lg font-semibold text-ink">{blog.author.name}</p>
                <Link href={`/blog/author/${blog.author.username}` as Route} className="contents">
                  <Button variant="outline" size="sm" className="mt-3">More posts by this author</Button>
                </Link>
              </div>
            </div>
          )}
        </article>

        {related.length > 0 && (
          <>
            {/* AD SLOT — large (970×250), pre-related. Catches the bounce
                before the reader leaves the article. */}
            <div className="mx-auto mt-16 max-w-6xl">
              <AdSlot placement={`blog.${blog.id}.related_before`} size="large" />
            </div>
            <section className="mx-auto mt-16 max-w-6xl">
              <h2 className="mb-6 text-2xl font-bold text-ink">Related posts</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {related.map((r) => <BlogCard key={r.id} blog={r} />)}
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}
