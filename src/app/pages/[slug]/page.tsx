import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { apiFromServer, ApiError } from '@/lib/api';
import { getSessionUser } from '@/lib/session';
import type { Page } from '@/types/api';

type Params = Promise<{ slug: string }>;

export const revalidate = 600;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await apiFromServer<Page>(`/pages/${slug}`);
    return { title: res.data.title, alternates: { canonical: `/pages/${slug}` } };
  } catch { return { title: 'Page' }; }
}

export default async function CmsPage({ params }: { params: Params }) {
  const { slug } = await params;
  const user = await getSessionUser();

  let page: Page | null = null;
  try {
    const res = await apiFromServer<Page>(`/pages/${slug}`);
    page = res.data;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
  }
  if (!page) notFound();

  return (
    <>
      <Header user={user ?? undefined} />
      <HeaderSpacer />
      <main className="container-page py-12">
        <article className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-ink">{page.title}</h1>
          <div
            className="prose prose-neutral mt-8 max-w-none text-base leading-7 text-ink
                       prose-headings:font-bold prose-headings:text-ink
                       prose-a:text-brand-700 prose-a:no-underline hover:prose-a:underline
                       prose-blockquote:border-l-4 prose-blockquote:border-brand-500 prose-blockquote:pl-4 prose-blockquote:italic
                       prose-img:rounded-card"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </article>
      </main>
    </>
  );
}
