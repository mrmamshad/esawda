import type { Metadata } from 'next';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getSessionUser } from '@/lib/session';

export const metadata: Metadata = {
  title: 'FAQ',
  alternates: { canonical: '/faq' },
  description:
    'Answers to the most common questions about buying, selling, payments, safety, and accounts on eSawda.',
};

type FaqItem = { q: string; a: string };

const FAQS: FaqItem[] = [
  {
    q: 'How do I create an eSawda account?',
    a: 'Click <strong>Get Started</strong> in the top-right corner, then sign up with your email, phone number, or Google account. You will receive a 6-digit verification code by SMS. Once verified, your account is ready — no fees, no commitment.',
  },
  {
    q: 'Is it free to list products on eSawda?',
    a: 'Yes. Posting a standard listing is completely free and stays live for 60 days. Optional promotions such as <em>bump-up</em>, <em>featured</em>, and <em>store subscriptions</em> are paid features that give your listing more visibility.',
  },
  {
    q: 'How do I verify my account?',
    a: 'Go to <strong>Dashboard → Settings → Verification</strong> and upload a clear photo of your NID (National ID) or passport. Our team reviews submissions within 24 hours. Verified sellers get a blue tick and appear higher in search results.',
  },
  {
    q: 'How do I contact a seller?',
    a: 'Open any listing and tap <strong>Chat with seller</strong>. eSawda&rsquo;s built-in messaging keeps your phone number private and lets you track conversations in <strong>Messages</strong>. We strongly recommend staying on-platform so our support team can help if something goes wrong.',
  },
  {
    q: 'How do I pay for a product?',
    a: 'eSawda itself does not process payments between buyers and sellers. You and the seller agree on the payment method in chat — cash on meet-up, bank transfer, mobile wallet (bKash/Nagad/Rocket), or any other method you both trust. Always meet in a public place and inspect the item before paying.',
  },
  {
    q: 'Can I return a product if it&rsquo;s not as described?',
    a: 'Returns are handled directly between buyer and seller based on whatever return policy the seller has published on the listing. If a seller refuses to resolve a clear misrepresentation, open a dispute from <strong>Messages → Report</strong> and our moderation team will step in.',
  },
  {
    q: 'How do I post my first ad?',
    a: 'From your dashboard, click <strong>Post Ad</strong>. Add up to 8 photos, a clear title, a description with key details (condition, model, year, etc.), a price, and a category. Listings with at least 3 photos and a complete description get 4× more enquiries.',
  },
  {
    q: 'How long does a listing stay active?',
    a: 'Standard listings stay live for <strong>60 days</strong>. After that they are auto-archived but remain in your dashboard. You can renew or repost a listing any time with one click.',
  },
  {
    q: 'What are featured listings and how do they work?',
    a: 'Featured listings appear at the top of search results and on the homepage for 7 days. You can upgrade any active listing to featured from your dashboard for a small fee. Average featured listings receive 3&ndash;5× more views.',
  },
  {
    q: 'Can I edit a listing after posting?',
    a: 'Yes. Go to <strong>Dashboard → My Ads</strong>, pick the listing, and click <strong>Edit</strong>. Photos, price, description, and category can all be updated. The listing will re-appear in search results after a quick re-moderation (usually &lt; 5 minutes).',
  },
  {
    q: 'How does eSawda keep buyers and sellers safe?',
    a: 'Every listing goes through automated checks (duplicate images, price anomalies, banned keywords) plus a human review queue. We verify seller identities, moderate chat for scams and phishing links, and provide a dispute resolution team. <strong>Never</strong> share OTPs, send advance payments to strangers, or click suspicious links.',
  },
  {
    q: 'What should I do if I suspect a scam?',
    a: 'Report the listing or the user directly from the chat (⋮ menu → <strong>Report</strong>). Our trust &amp; safety team reviews every report within a few hours. For financial fraud, also contact your bank or mobile-wallet provider immediately.',
  },
  {
    q: 'I forgot my password — how do I reset it?',
    a: 'On the sign-in page, click <strong>Forgot password</strong>, enter the email or phone on your account, and we&rsquo;ll send a reset link or code. The link expires in 30 minutes. If you no longer have access to the original email/phone, contact support with proof of identity.',
  },
  {
    q: 'How do I delete my account?',
    a: 'Go to <strong>Dashboard → Settings → Account → Delete account</strong>. We will archive your data for 30 days (in case you change your mind) and then permanently delete it. Active subscriptions must be cancelled before deletion.',
  },
  {
    q: 'Does eSawda have a mobile app?',
    a: 'Yes — Android and iOS apps are available. Search <em>eSawda</em> on the Play Store and App Store, or scan the QR code at the bottom of the homepage. The web version works on any modern browser; no install required.',
  },
  {
    q: 'I run a shop — can I have a store page?',
    a: 'Absolutely. <strong>Store plans</strong> give you a branded storefront, bulk upload, analytics, and priority support. Plans start at BDT 999/month. See <a href="/membership">Membership</a> for the full comparison.',
  },
  {
    q: 'How do I contact eSawda support?',
    a: 'The fastest way is in-app chat (Mon&ndash;Sat, 9 AM&ndash;9 PM BST). You can also email <a href="mailto:support@esawda.com">support@esawda.com</a> or use the form on the <a href="/contact">Contact</a> page. Press and partnership enquiries go to <a href="mailto:press@esawda.com">press@esawda.com</a>.',
  },
];

export default async function FaqPage() {
  const user = await getSessionUser();

  return (
    <>
      <Header user={user ?? undefined} />
      <HeaderSpacer />

      <main className="bg-bg text-ink">
        <section className="container-page pt-14 pb-10 md:pt-20 md:pb-14">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <HelpCircle size={22} />
            </div>
            <h1 className="text-[38px] leading-[1.1] font-extrabold tracking-[-0.02em] text-ink md:text-[52px]">
              Frequently asked questions
            </h1>
            <p className="mt-4 text-[17px] leading-[1.6] text-ink-muted">
              Answers to the most common questions from our community —
              accounts, listings, payments, safety, and more.
            </p>
          </div>
        </section>

        <section className="container-page pb-12 md:pb-16">
          <div className="mx-auto max-w-3xl">
            <div className="surface-card divide-y divide-line">
              {FAQS.map((f) => (
                <details key={f.q} className="group">
                  <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4 text-[15px] font-semibold text-ink hover:bg-brand-50">
                    <span>{f.q}</span>
                    <ChevronDown
                      size={16}
                      className="text-brand-500 transition group-open:rotate-180"
                    />
                  </summary>
                  <div className="px-5 pb-5 text-[15px] leading-[1.6] text-ink-muted">
                    <div
                      className="prose prose-sm max-w-none prose-a:text-brand-700"
                      dangerouslySetInnerHTML={{ __html: f.a }}
                    />
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
