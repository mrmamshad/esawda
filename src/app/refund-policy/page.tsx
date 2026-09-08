import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy',
  description: 'eSawda refund, cancellation, and dispute resolution policy for marketplace transactions.',
};

export default function RefundPolicyPage() {
  return (
    <>
      <Header variant="default" />
      <HeaderSpacer />
      <main className="container-page py-12">
        <article className="prose prose-sm mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold text-ink">Refund & Cancellation Policy</h1>
          <p className="text-sm text-ink-muted">Last updated: September 2026</p>

          <section>
            <h2 className="mt-8 text-2xl font-semibold text-ink">Overview</h2>
            <p className="text-ink-muted">
              eSawda is a peer-to-peer marketplace that connects buyers and sellers across Bangladesh. This policy outlines
              refund and cancellation procedures for transactions conducted through our platform.
            </p>
          </section>

          <section>
            <h2 className="mt-8 text-2xl font-semibold text-ink">1. Membership & Plan Refunds</h2>
            <p className="text-ink-muted">
              Membership subscriptions and seller plans are generally non-refundable once activated. Access remains available
              until the recorded expiry date; renewal occurs only when the seller starts another purchase.
            </p>
            <ul className="mt-4 space-y-2 text-ink-muted">
              <li>
                <strong>Monthly/Annual Plans:</strong> Remain active until the next renewal date. Cancel anytime to stop future
                charges.
              </li>
              <li>
                <strong>Paid Listings:</strong> Once featured, highlighting, or urgent badges are activated, they remain active for
                the duration purchased and are non-refundable.
              </li>
              <li>
                <strong>Service Errors:</strong> If you are charged in error (duplicate charge, system failure), contact support
                promptly with the transaction reference for review and potential correction.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mt-8 text-2xl font-semibold text-ink">2. Marketplace Product Transactions</h2>
            <p className="text-ink-muted">
              eSawda is a classified marketplace. Buyers contact sellers directly, and eSawda does not collect online payment for
              the advertised product itself. Delivery, inspection, cancellation, return, and product-price refunds must be agreed
              directly between the buyer and seller.
            </p>
            <ul className="mt-4 space-y-2 text-ink-muted">
              <li>Do not send advance product payment to an unknown seller.</li>
              <li>Inspect the item and verify ownership before completing a transaction.</li>
              <li>Report suspicious listings or messages through the Contact page.</li>
            </ul>
          </section>

          <section>
            <h2 className="mt-8 text-2xl font-semibold text-ink">3. Technical Payment Errors</h2>
            <p className="text-ink-muted">
              DGePay checkout is used only for eSawda seller services such as plans, paid listings, and listing boosts. If a charge
              succeeds but the service is not activated, eSawda will verify the gateway transaction and either activate the
              purchased service or arrange an appropriate correction.
            </p>
          </section>

          <section>
            <h2 className="mt-8 text-2xl font-semibold text-ink">4. Requesting a Review</h2>
            <ol className="mt-4 space-y-3 text-ink-muted">
              <li>Contact eSawda through the Contact page.</li>
              <li>Provide the eSawda transaction reference and a description of the problem.</li>
              <li>eSawda verifies the payment status and service activation record.</li>
              <li>If a refund is approved, it is returned through the original payment method. Timing depends on DGePay and the issuing provider.</li>
            </ol>
          </section>

          <section>
            <h2 className="mt-8 text-2xl font-semibold text-ink">5. Payment Method Refunds</h2>
            <ul className="mt-4 space-y-2 text-ink-muted">
              <li>
                <strong>Digital wallet or card payments:</strong> Approved refunds are sent to the original payment method. Processing time depends on DGePay and the issuing provider.
              </li>
              <li>
                <strong>Cash on Delivery:</strong> Payments made outside eSawda must be resolved directly between the buyer and seller.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mt-8 text-2xl font-semibold text-ink">6. Non-Refundable Items</h2>
            <p className="text-ink-muted">The following are explicitly non-refundable:</p>
            <ul className="mt-4 space-y-2 text-ink-muted">
              <li>Seller membership and plan fees after successful activation</li>
              <li>Paid listing upgrades after activation</li>
              <li>Admin moderation or content removal fees</li>
              <li>Transactions completed outside the eSawda platform (in-person cash)</li>
            </ul>
          </section>

          <section>
            <h2 className="mt-8 text-2xl font-semibold text-ink">7. Fraud & Chargebacks</h2>
            <p className="text-ink-muted">
              Customers who dispute a charge with their payment provider without first contacting eSawda support may be
              permanently banned from the platform. We investigate all chargeback disputes and reserve the right to:
            </p>
            <ul className="mt-4 space-y-2 text-ink-muted">
              <li>Suspend accounts pending investigation</li>
              <li>Reject future transactions</li>
              <li>Report fraud to payment processors and law enforcement</li>
            </ul>
          </section>

          <section>
            <h2 className="mt-8 text-2xl font-semibold text-ink">8. Contact & Support</h2>
            <p className="text-ink-muted">
              For questions about your specific refund or cancellation, please contact us:
            </p>
            <ul className="mt-4 space-y-2 text-ink-muted">
              <li>Use the Contact page to submit a refund or cancellation request.</li>
              <li>Include the eSawda transaction reference and supporting evidence.</li>
              <li>Never share passwords, OTPs, card details, or wallet PINs with support.</li>
            </ul>
          </section>

          <section>
            <h2 className="mt-8 text-2xl font-semibold text-ink">9. Changes to This Policy</h2>
            <p className="text-ink-muted">
              eSawda reserves the right to update this policy at any time. Continued use of the platform after changes constitutes
              acceptance of the updated policy.
            </p>
          </section>

          <div className="mt-12 rounded-lg bg-brand-50 p-6 text-center">
            <p className="text-sm text-ink-muted">
              Have a question about a refund or cancellation?{' '}
              <Link href={'/contact' as Route} className="font-semibold text-brand-700 hover:text-brand-600">
                Contact our support team
              </Link>
            </p>
            <Link href={'/shop' as Route} className="mt-4 inline-block">
              <Button variant="filled" size="sm">
                Back to shop
              </Button>
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
