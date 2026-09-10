import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { Header, HeaderSpacer } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getSessionUser } from '@/lib/session';

export const metadata: Metadata = {
  title: 'Terms of Service',
  alternates: { canonical: '/terms' },
  description:
    'The rules and conditions for using eSawda — our marketplace, your responsibilities, and what to expect from us.',
};

const BRAND_RED = '#FF003F';

const LAST_UPDATED = '1 August 2026';

export default async function TermsPage() {
  const user = await getSessionUser();

  return (
    <>
      <Header user={user ?? undefined} />
      <HeaderSpacer />

      <main className="bg-bg text-ink">
        {/* ─── Page header ─── */}
        <section className="container-page pt-14 pb-10 md:pt-20 md:pb-14">
          <div className="mx-auto max-w-3xl">
            <p
              className="text-[13px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: BRAND_RED }}
            >
              Legal
            </p>
            <h1 className="mt-3 text-[38px] leading-[1.1] font-extrabold tracking-[-0.02em] text-ink md:text-[52px]">
              Terms of Service
            </h1>
            <p className="mt-5 text-[17px] leading-[1.6] text-ink-muted">
              These terms govern your use of eSawda. By creating an account,
              posting a listing, or browsing the site, you agree to them. Read
              carefully — they cover your rights, our rights, and the rules
              that keep the marketplace safe.
            </p>
            <p className="mt-3 text-[13px] uppercase tracking-[0.12em] text-ink-muted">
              Last updated · {LAST_UPDATED}
            </p>
          </div>
        </section>

        {/* ─── Sections ─── */}
        <section className="container-page pb-12 md:pb-16">
          <div className="mx-auto max-w-4xl space-y-12">
            <Block title="1. General">
              <p>
                Seller and Buyer are responsible for ensuring that advertising
                content, text, images, graphics, and video (&quot;Content&quot;)
                uploaded for inclusion on eSawda.com complies with all applicable
                laws. eSawda.com assumes no responsibility for any illegality or
                inaccuracy of the Content.
              </p>
              <p>
                The Seller and user guarantee that their Content does not violate
                any copyright, intellectual property rights, or other rights of
                any person or entity, and agree to release eSawda.com from all
                obligations, liabilities, and claims arising in connection with
                the use of (or the inability to use) the service.
              </p>
              <p>
                Sellers agree that their Content may be presented through
                eSawda.com&apos;s partner sites under the same terms and
                conditions as on eSawda.com.
              </p>
            </Block>

            <Block title="2. Copyright">
              <p>
                Sellers grant eSawda.com a perpetual, royalty-free, irrevocable,
                non-exclusive right and license to use, reproduce, modify, adapt,
                publish, translate, create derivative works from, and distribute
                such Content or incorporate such Content into any form, medium,
                or technology now known or later developed.
              </p>
              <p>
                The material (including the Content, and any other content,
                software, or services) contained on eSawda.com is the property of
                eSawda.com, its subsidiaries, affiliates, and/or third-party
                licensors. Any intellectual property rights, such as copyright,
                trademarks, service marks, trade names, and other distinguishing
                brands on the website, are the property of eSawda.com. No material
                on this site may be copied, reproduced, republished, installed,
                posted, transmitted, stored, or distributed without written
                permission from eSawda.com.
              </p>
            </Block>

            <Block title="3. Watermarks">
              <p>
                All images on eSawda.com are watermarked, which prevents the
                images from being used for other purposes without the consent of
                the advertiser.
              </p>
            </Block>

            <Block title="4. Safety and Images">
              <p>
                eSawda.com reserves the right to change the title of the Content
                for editorial purposes. eSawda.com reserves the right not to
                publish images that are irrelevant or images that violate
                eSawda.com&apos;s rules.
              </p>
            </Block>

            <Block title="5. Personal Data & Cooperation">
              <p>
                eSawda.com has the right to cooperate with authorities in the
                case that any Content violates the law. The identity of Seller or
                Buyer may be determined, for example, by an ISP. IP addresses may
                also be registered in order to ensure compliance with the terms
                and conditions.
              </p>
            </Block>

            <Block title="6. Privacy">
              <p>
                eSawda.com will collect information from Buyers and Sellers. It
                is a condition of use of eSawda.com that each User and advertiser
                consents and authorizes eSawda.com to collect and use this
                information. eSawda.com also reserves the right to disclose it to
                company affiliates and any other person for the purposes of
                administering, supporting, and maintaining eSawda.com, as well as
                for improving eSawda.com (e.g., using information for research,
                marketing, product development, and planning).
              </p>
            </Block>

            <Block title="7. Cookies">
              <p>
                This site uses cookies, which means that you must have cookies
                enabled on your computer in order for all functionality on this
                site to work properly. A cookie is a small data file that is
                written to your hard drive when you visit certain websites. Cookie
                files contain certain information, such as a random number user ID
                that the site assigns to a visitor to track the pages visited. A
                cookie cannot read data off your hard disk or read cookie files
                created by other sites. Cookies, by themselves, cannot be used to
                find out the identity of any user.
              </p>
            </Block>

            <Block title="8. Email Address of Users">
              <p>
                Users and Buyers are required to submit a valid email address
                before they are allowed to post advertisements or interact on the
                platform. The email address of the User shall not be publicly
                displayed, and other Users are permitted to send emails to the
                User through eSawda.com.
              </p>
            </Block>

            <Block title="9. Site Availability">
              <p>
                eSawda.com does not guarantee continuous or secure access to the
                website. The website is provided &quot;as is&quot; and as and
                when available.
              </p>
            </Block>

            <Block title="10. Links to Third Party Websites">
              <p>
                eSawda.com may contain links or references to other websites
                (&quot;Third Party Websites&quot;). eSawda.com shall not be
                responsible for the contents of Third Party Websites. Third Party
                Websites are not investigated or monitored. In the event the user
                decides to leave eSawda.com and access Third Party Sites, the user
                does so at his/her own risk.
              </p>
            </Block>

            <Block title="11. Paid Content and Services">
              <p>
                Some content and services of eSawda.com may require payment,
                including but not limited to membership packages, posting ads in
                select categories, featuring listings, and sale of items through
                Doorstep Delivery.
              </p>
            </Block>

            <Block title="12. Memberships & Shops">
              <p>
                As part of a membership package or vendor onboarding, eSawda.com
                will create or allow the user to manage a Shop. A Shop is a
                dedicated webpage on eSawda.com, maintained by or hosted on
                eSawda.com, with content provided by the user. eSawda.com has the
                right to any content added to the Shop by the user and has the
                right to remove or not publish the content if it violates any
                aspect of these Terms and Conditions.
              </p>
            </Block>

            <Block title="13. Doorstep Delivery">
              <p>
                Doorstep Delivery is an e-commerce fulfillment service provided by
                eSawda.com to help Buyers get items delivered directly to their
                doorstep. In some cases, the delivery and payments are handled by
                the Seller, while in other cases they are handled by eSawda.com.
                Whether an item will be delivered by the Seller or by eSawda.com
                will be specified in the advertisement.
              </p>
              <p>
                A Seller must meet platform membership guidelines to opt into the
                Doorstep Delivery service. For Seller-related terms, please
                contact eSawda support or your dedicated representative. Contact
                support at support@esawda.com.
              </p>
              <p>
                By placing a &quot;Doorstep Delivery&quot; order, Buyers undertake
                to purchase the item unless it is materially different from the
                description provided by the Seller on eSawda.com. If the delivered
                item is not as described in the ad, the Buyer is entitled to a
                replacement or resolution under eSawda.com&apos;s Buyer Protection
                policy.
              </p>
              <p>
                eSawda.com does not provide any guarantees that Sellers have been
                truthful or accurate in their listings, have items in stock, will
                accept the return of the item, or provide any refunds. eSawda.com
                is not responsible for unsatisfactory or delayed performance,
                losses, damages, or delays as a result of items being unavailable
                or mishandled by Sellers.
              </p>
              <p>
                eSawda.com reserves the right to suspend, limit, or withdraw
                access to eSawda.com and/or the Membership of any user who does
                not comply with these terms.
              </p>
            </Block>

            <Block title="14. Doorstep Delivery Return & Replacement Policy">
              <p>
                Returns, replacements, and refunds may be requested under the
                following circumstances:
              </p>
              <ul>
                <li>The product is not in a working condition.</li>
                <li>
                  The specification (color, size, weight, or dimensions) of the
                  product does not match the description given in the listing.
                </li>
                <li>
                  The product is found to be physically damaged at the time of
                  delivery.
                </li>
              </ul>
              <p>
                The replacement claim must be made within 72 hours of delivery by
                emailing support@esawda.com. eSawda.com will investigate the
                validity of the claim and exchange the product with a functional
                product in the case of valid claims only.
              </p>
              <ul>
                <li>
                  For products without warranty: Claims will not be considered
                  after the specified period of 72 hours after delivery.
                </li>
                <li>
                  For products with warranty: Claims will fall under the specific
                  warranty policy, and eSawda.com will facilitate ensuring the
                  warranty is provided by the seller.
                </li>
              </ul>
            </Block>

            <Block title="15. Doorstep Delivery Replacement Process">
              <p>
                Upon receiving a complaint, eSawda.com will contact the buyer to
                verify the issue within 48 hours. If the complaint is found to be
                within the purview of the replacement policy, eSawda.com will
                provide the following options:
              </p>
              <ul>
                <li>
                  The Buyer will be informed of the nearest logistics/courier
                  location where they must send the product to the seller&apos;s
                  location.
                </li>
                <li>
                  Alternatively, eSawda.com will arrange a pickup from the
                  customer to the seller&apos;s location.
                </li>
              </ul>
              <p>
                The product must be returned in the same condition as it was
                received, along with the undamaged box and original packaging.
                Replacements cannot be processed if any parts of the product are
                missing or if the box has been damaged.
              </p>
              <p>
                The Seller will receive the product from the courier, investigate
                the problem, and if the complaint is deemed valid, the product
                will be replaced along with a refund of the courier fee incurred
                by the Buyer. If the same product is unavailable, a full refund
                will be processed along with the courier fee. However, if the
                complaint is found to be invalid, the product will be returned to
                the buyer, and no courier fee refund will be issued.
              </p>
            </Block>

            <Block title="16. Disclaimer">
              <p>
                eSawda.com assumes no responsibility whatsoever for the use of
                eSawda.com and disclaims all responsibility for any injury, claim,
                liability, or damage of any kind resulting from, arising out of,
                or in any way related to:
              </p>
              <ul>
                <li>
                  Any errors on eSawda.com or within the Content, including but
                  not limited to technical errors and typographical errors.
                </li>
                <li>
                  Any third-party websites or content directly or indirectly
                  accessed through links on eSawda.com.
                </li>
                <li>The unavailability of eSawda.com.</li>
                <li>Your use of eSawda.com or the Content.</li>
                <li>
                  Your use of any equipment (or software) in connection with
                  eSawda.com.
                </li>
              </ul>
            </Block>

            <Block title="17. Indemnification">
              <p>
                Sellers and Buyers agree to indemnify eSawda.com as well as its
                officers, directors, employees, and agents from and against all
                losses, expenses, damages, and costs, including attorney&apos;s
                fees, resulting from any violation of these Terms and Conditions
                (including negligent or wrongful conduct).
              </p>
            </Block>

            <Block title="18. Modifications">
              <p>
                eSawda.com reserves the right to modify these Terms and
                Conditions. Such modifications shall be effective immediately upon
                posting on eSawda.com. You are responsible for reviewing such
                modifications. Your continued access or use of eSawda.com shall be
                deemed your acceptance of the modified terms and conditions.
              </p>
            </Block>

            <Block title="19. Governing Law">
              <p>
                eSawda.com is operated under the laws and regulations of
                Bangladesh.
              </p>
            </Block>

            <Block title="20. Contact us">
              <p>
                Questions about these terms? Reach out before you act if
                anything is unclear.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link href={'/contact' as Route} className="contents">
                  <button
                    className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold text-white transition hover:brightness-95"
                    style={{ backgroundColor: BRAND_RED }}
                  >
                    Contact support
                  </button>
                </Link>
                <Link
                  href={'/faq' as Route}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-3 text-[14px] font-semibold text-ink transition hover:border-ink"
                >
                  Read the FAQ
                </Link>
              </div>
            </Block>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
      <h2 className="text-[20px] font-bold text-ink md:text-[22px]">{title}</h2>
      <div className="space-y-4 text-[16px] leading-[1.7] text-ink-muted [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
        {children}
      </div>
    </div>
  );
}
