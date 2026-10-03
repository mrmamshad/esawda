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
                    <a href="mailto:info@esawda.com" className="font-medium text-ink hover:text-brand-700">Info@esawda.com</a>
                    <a href="mailto:support@esawda.com" className="block font-medium text-ink hover:text-brand-700">support@esawda.com</a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-field bg-brand-50 text-brand-500"><Phone size={16} /></span>
                  <div>
                    <p className="text-ink-muted">Phone</p>
                    <a href="tel:01687488400" className="font-medium text-ink hover:text-brand-700">01687488400</a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-field bg-brand-50 text-brand-500"><MapPin size={16} /></span>
                  <div>
                    <p className="text-ink-muted">Office</p>
                    <p className="font-medium text-ink">79 Satmasjid Road, Dhaka 1209</p>
                  </div>
                </li>
              </ul>
              <div className="mt-6 border-t border-line pt-5">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Follow us</h3>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <a href="https://www.facebook.com/esawdabd" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-field border border-line bg-white px-3 py-2.5 transition-all hover:-translate-y-0.5 hover:border-[#1877F2]/30 hover:shadow-sm">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1877F2] text-white">
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6c-.29-.04-1.27-.12-2.41-.12-2.39 0-4.02 1.46-4.02 4.13v2.29H7.6V13h2.67v8h3.23z"/></svg>
                    </span>
                    <span className="text-sm font-medium text-ink group-hover:text-ink">Facebook</span>
                  </a>
                  <a href="https://www.instagram.com/esawdabd" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-field border border-line bg-white px-3 py-2.5 transition-all hover:-translate-y-0.5 hover:border-[#E1306C]/30 hover:shadow-sm">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white">
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none"/></svg>
                    </span>
                    <span className="text-sm font-medium text-ink group-hover:text-ink">Instagram</span>
                  </a>
                  <a href="https://www.linkedin.com/company/esawda/" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-field border border-line bg-white px-3 py-2.5 transition-all hover:-translate-y-0.5 hover:border-[#0A66C2]/30 hover:shadow-sm">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0A66C2] text-white">
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M6.94 5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0zM3.5 8.5h3.4V21H3.5V8.5zm5.5 0h3.26v1.7h.05c.45-.86 1.56-1.76 3.21-1.76 3.43 0 4.06 2.26 4.06 5.2V21h-3.4v-5.9c0-1.4-.02-3.2-1.95-3.2-1.96 0-2.26 1.53-2.26 3.1V21H9V8.5z"/></svg>
                    </span>
                    <span className="text-sm font-medium text-ink group-hover:text-ink">LinkedIn</span>
                  </a>
                  <a href="https://www.tiktok.com/@esawda" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-field border border-line bg-white px-3 py-2.5 transition-all hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-sm">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-white">
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M16.5 3c.3 2.1 1.6 3.6 3.7 3.9v2.5c-1.3.1-2.5-.3-3.7-1v6.1c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6c.3 0 .6 0 .9.1v2.6c-.3-.1-.6-.2-.9-.2-1.9 0-3.4 1.5-3.4 3.4s1.5 3.4 3.4 3.4 3.4-1.5 3.4-3.4V3h2.6z"/></svg>
                    </span>
                    <span className="text-sm font-medium text-ink group-hover:text-ink">TikTok</span>
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </ToastProvider>
  );
}
