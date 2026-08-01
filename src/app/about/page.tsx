import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { Sparkles, Users, ShieldCheck, Rocket } from 'lucide-react';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { getSessionUser } from '@/lib/session';

export const metadata: Metadata = { title: 'About us', alternates: { canonical: '/about' } };

const VALUES = [
  { icon: <Sparkles size={20} />,   title: 'Simple',    desc: 'Post an ad in under two minutes.' },
  { icon: <Users size={20} />,      title: 'Trusted',   desc: 'Verified sellers and buyer reviews.' },
  { icon: <ShieldCheck size={20} />,title: 'Safe',      desc: 'Report tools and moderation baked in.' },
  { icon: <Rocket size={20} />,     title: 'Fast',      desc: 'Optimised search across millions of ads.' },
];

export default async function AboutPage() {
  const user = await getSessionUser();
  return (
    <>
      <Header user={user ?? undefined} />
      <HeaderSpacer />
      <main className="container-page space-y-16 py-16">
        <header className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-pill bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-800">Our story</span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink md:text-5xl">
            Making classifieds <span className="text-brand-700">delightful</span>.
          </h1>
          <p className="mt-4 text-lg text-ink-muted">
            eSawda began with a simple idea: buying and selling second-hand shouldn't be complicated.
            Today we connect millions of buyers with local sellers across the world.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          {VALUES.map((v) => (
            <div key={v.title} className="surface-card p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-field bg-brand-50 text-brand-500">{v.icon}</div>
              <p className="mt-4 text-lg font-semibold text-ink">{v.title}</p>
              <p className="mt-1 text-sm text-ink-muted">{v.desc}</p>
            </div>
          ))}
        </section>

        <section className="surface-card p-8 md:p-12">
          <div className="grid gap-8 md:grid-cols-3">
            <div><p className="text-4xl font-bold text-ink">4M+</p><p className="mt-1 text-sm text-ink-muted">Active listings</p></div>
            <div><p className="text-4xl font-bold text-ink">120k+</p><p className="mt-1 text-sm text-ink-muted">Verified sellers</p></div>
            <div><p className="text-4xl font-bold text-ink">98%</p><p className="mt-1 text-sm text-ink-muted">Satisfaction rate</p></div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-card bg-gradient-to-r from-brand-900 to-brand-800 p-10 text-white">
          <h2 className="text-3xl font-bold">Ready to join?</h2>
          <p className="mt-2 max-w-xl text-white/80">Create your free account and start posting today.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={'/auth/signup' as Route} className="contents"><Button variant="onDark" size="lg">Create account</Button></Link>
            <Link href={'/ads' as Route} className="contents"><Button variant="filled" size="lg">Browse ads</Button></Link>
          </div>
        </section>
      </main>
    </>
  );
}
