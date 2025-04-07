import React from "react";
import Layout from "../components/Layout";

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="space-y-4">
    <h2 className="text-xl font-semibold mb-3">{title}</h2>
    <div className="prose dark:prose-invert max-w-none">{children}</div>
  </section>
);

const Privacy: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Last Updated: April 7, 2025
          </p>
        </header>

        <div className="space-y-8">
          <Section title="1. Introduction">
            This Privacy Policy explains how CineNiche (“we”, “us”, “our”)
            collects, uses, and protects your personal information when you use
            our website and services. We are committed to protecting your
            privacy in accordance with the General Data Protection Regulation
            (GDPR) and other applicable privacy laws.
          </Section>

          <Section title="2. Information We Collect">
            We may collect and process the following types of personal data:
            <ul className="ml-6 list-disc">
              <li>
                Personal Information: Name, email address (provided during
                account creation), street address (provided during account
                creation), age, gender
              </li>
              <li>Usage Data: Movies viewed, ratings submitted, preferences</li>
              <li>
                Technical Data: IP address, browser type, operating system,
                device information
              </li>
              <li>
                Cookies and Tracking Technologies: Information collected via
                cookies and similar technologies
              </li>
            </ul>
          </Section>

          <Section title="3. Legal Bases for Processing">
            We process your personal data under the following lawful bases (per
            Article 6 GDPR):
            <ul className="ml-6 list-disc">
              <li>
                Consent – for email communications, use of non-essential
                cookies, and optional features
              </li>
              <li>
                Contractual necessity – to provide and maintain your account and
                services
              </li>
              <li>Legal obligation – for compliance with applicable laws</li>
              <li>
                Legitimate interests – to improve services, personalize content,
                and ensure security (unless your rights override these
                interests)
              </li>
            </ul>
          </Section>

          <Section title="4. How We Use Your Information">
            We use your information to:
            <ul className="ml-6 list-disc">
              <li>Provide and manage your account and user experience</li>
              <li>Personalize movie recommendations and services</li>
              <li>Process transactions and provide customer support</li>
              <li>Communicate important service updates</li>
              <li>Monitor and improve website functionality</li>
              <li>Comply with legal requirements</li>
            </ul>
          </Section>

          <Section title="5. Data Retention">
            We retain your personal data only as long as necessary for the
            purposes outlined in this policy, including legal, tax, or
            accounting requirements. When we no longer need your data, we
            securely delete or anonymize it.
          </Section>

          <Section title="6. Your Rights Under GDPR">
            You have the following rights:
            <ul className="ml-6 list-disc">
              <li>Access – Request a copy of your personal data</li>
              <li>
                Rectification – Request corrections to inaccurate or incomplete
                data
              </li>
              <li>
                Erasure – Request deletion of your data (“right to be
                forgotten”)
              </li>
              <li>
                Restriction – Request limited processing under certain
                conditions
              </li>
              <li>
                Data Portability – Receive your data in a structured,
                machine-readable format
              </li>
              <li>
                Objection – Object to certain processing (e.g., direct
                marketing)
              </li>
              <li>
                Automated decision-making – Not be subject to decisions made
                solely by automated means
              </li>
            </ul>
            To exercise your rights, contact us at privacy@cineniche.com.
          </Section>

          <Section title="7. Cookies">
            We use cookies to enhance your browsing experience, personalize
            content, and analyze traffic. You can manage cookie settings through
            your browser. For more information, see our Cookie Policy.
          </Section>

          <Section title="8. International Data Transfers">
            If your personal data is transferred outside the European Economic
            Area (EEA), we ensure an adequate level of protection through
            measures such as:
            <ul className="ml-6 list-disc">
              <li>
                Standard Contractual Clauses approved by the European Commission
              </li>
              <li>Data transfer agreements with third-party processors</li>
            </ul>
          </Section>

          <Section title="9. Third-Party Services">
            We may use third-party service providers to support our services
            (e.g., analytics, hosting). These third parties only access personal
            data as necessary and in compliance with this policy. Each has its
            own privacy policy.
          </Section>

          <Section title="10. Data Security">
            We implement appropriate technical and organizational measures to
            protect your personal data from unauthorized access, alteration,
            disclosure, or destruction.
          </Section>

          <Section title="11. Changes to This Privacy Policy">
            We may update this Privacy Policy periodically. When we do, we will
            revise the “Last Updated” date at the top. Significant changes will
            be communicated via the app or email if required by law.
          </Section>

          <Section title="12. Contact Us">
            If you have any questions, concerns, or requests related to this
            Privacy Policy, please contact us at:
            <br />
            Email: privacy@cineniche.com
            <br />
            Mailing Address: 790 TNRB, Brigham Young University, Provo, UT
            84602-3113
          </Section>
        </div>

        <div className="mt-16">
          <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Last Updated: April 7, 2025
          </p>

          <div className="space-y-8">
            <Section title="1. What Are Cookies?">
              Cookies are small text files stored on your device when you visit
              a website. They are widely used to make websites work efficiently,
              enhance user experience, and provide analytical data to site
              owners. Cookies can be:
              <ul className="ml-6 list-disc">
                <li>Session cookies: Deleted when you close your browser</li>
                <li>
                  Persistent cookies: Remain until they expire or are manually
                  deleted
                </li>
                <li>
                  First-party cookies: Set by the website you are visiting
                </li>
                <li>
                  Third-party cookies: Set by external services integrated into
                  the site
                </li>
              </ul>
            </Section>

            <Section title="2. How We Use Cookies">
              CineNiche uses cookies for the following purposes:
              <ul className="ml-6 list-disc">
                <li>
                  <strong>Essential Cookies</strong>: Necessary for the website
                  to function properly. They enable core functionality like user
                  login, account management, and security features. You cannot
                  opt out of these.
                </li>
                <li>
                  <strong>Functionality Cookies</strong>: These cookies remember
                  your preferences, such as language, location, or favorite
                  movies, to enhance your experience.
                </li>
              </ul>
            </Section>

            <Section title="4. Cookie Consent">
              When you first visit our site, you will see a cookie banner asking
              for your consent to use non-essential cookies.
            </Section>

            <Section title="5. Managing Cookies">
              You can manage or disable cookies through your browser settings.
              Please note that disabling cookies may affect website
              functionality.
              <ul className="ml-6 list-disc">
                <li>Chrome: chrome://settings/cookies</li>
                <li>Firefox: about:preferences#privacy</li>
                <li>Safari: Settings &gt; Safari &gt; Privacy & Security</li>
                <li>
                  Edge: Settings &gt; Site permissions &gt; Cookies and site
                  data
                </li>
              </ul>
            </Section>

            <Section title="6. Changes to This Cookie Policy">
              We may update this Cookie Policy to reflect changes in our
              practices or legal requirements. Check this page periodically for
              updates. The “Last Updated” date will reflect the most recent
              changes.
            </Section>

            <Section title="7. Contact Us">
              If you have questions about our use of cookies, please contact us
              at:
              <br />
              Email: privacy@movierating.com
            </Section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;
