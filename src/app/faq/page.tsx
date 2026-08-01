import type { Metadata } from 'next';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { EmptyState } from '@/components/ui/EmptyState';
import { apiFromServer, ApiError } from '@/lib/api';
import { getSessionUser } from '@/lib/session';
import type { Faq } from '@/types/api';

export const metadata: Metadata = { title: 'FAQ', alternates: { canonical: '/faq' } };
export const revalidate = 600;

export default async function FaqPage() {
  const user = await getSessionUser();
  let items: Faq[] = [];
  let error: string | null = null;
  try {
    const res = await apiFromServer<Faq[]>('/faqs');
    items = (res.data ?? []) as Faq[];
  } catch (e) {
    error = e instanceof ApiError ? e.message : 'Could not load FAQ.';
  }

  // Top-level items only (parent_id null) — nested render below if needed.
  const roots = items.filter((f) => !f.parent_id);
  const children = (id: number) => items.filter((f) => f.parent_id === id);

  return (
    <>
      <Header user={user ?? undefined} />
      <HeaderSpacer />
      <main className="container-page py-12">
        <header className="mx-auto mb-10 max-w-2xl text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            <HelpCircle size={22} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-ink">Frequently asked questions</h1>
          <p className="mt-3 text-base text-ink-muted">Answers to the most common questions from our community.</p>
        </header>

        <div className="mx-auto max-w-3xl">
          {error ? (
            <EmptyState title="Couldn't load FAQ" description={error} />
          ) : roots.length === 0 ? (
            <EmptyState icon={<HelpCircle size={20} />} title="No FAQs yet" description="Check back soon." />
          ) : (
            <div className="surface-card divide-y divide-line">
              {roots.map((f) => (
                <details key={f.id} className="group">
                  <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4 text-sm font-semibold text-ink hover:bg-brand-50">
                    <span>{f.title}</span>
                    <ChevronDown size={16} className="text-brand-500 transition group-open:rotate-180" />
                  </summary>
                  <div className="px-5 pb-5 text-sm text-ink-muted">
                    <div className="prose prose-sm max-w-none prose-a:text-brand-700" dangerouslySetInnerHTML={{ __html: f.content }} />
                    {children(f.id).length > 0 && (
                      <ul className="mt-3 space-y-2 border-l-2 border-brand-100 pl-4">
                        {children(f.id).map((c) => (
                          <li key={c.id}>
                            <p className="text-sm font-medium text-ink">{c.title}</p>
                            <div className="mt-1 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: c.content }} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
