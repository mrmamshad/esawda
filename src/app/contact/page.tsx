import type { Metadata } from 'next';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ContactForm } from './ContactForm';
import { ToastProvider } from '@/components/ui/Toast';
import { getSessionUser } from '@/lib/session';

export const metadata: Metadata = { title: 'Contact us', alternates: { canonical: '/contact' } };

export default async function ContactPage() {
  const user = await getSessionUser();
  return (
    <ToastProvider>
      <Header user={user ?? undefined} />
      <HeaderSpacer />
      <main className="container-page py-12">
        <header className="mx-auto mb-10 max-w-2xl text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            <Mail size={22} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-ink">Contact us</h1>
          <p className="mt-3 text-base text-ink-muted">Questions, feedback, or press? Send us a note.</p>
        </header>

        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_320px]">
          <ContactForm />
          <aside className="space-y-4">
            <div className="surface-card p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Reach us</h3>
              <ul className="mt-4 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-field bg-brand-50 text-brand-500"><Mail size={16} /></span>
                  <div>
                    <p className="text-ink-muted">Email</p>
                    <a href="mailto:hello@eshauda.com" className="font-medium text-ink hover:text-brand-700">hello@eshauda.com</a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-field bg-brand-50 text-brand-500"><Phone size={16} /></span>
                  <div>
                    <p className="text-ink-muted">Phone</p>
                    <p className="font-medium text-ink">+1 (555) 010-1234</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-field bg-brand-50 text-brand-500"><MapPin size={16} /></span>
                  <div>
                    <p className="text-ink-muted">Office</p>
                    <p className="font-medium text-ink">123 Market Street, Suite 400<br />San Francisco, CA 94103</p>
                  </div>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </ToastProvider>
  );
}
