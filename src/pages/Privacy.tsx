import React, { useState, useEffect } from "react";

import Layout from "../components/Layout";

interface PrivacySection {
  title: string;
  content: string;
}

const Privacy: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Last Updated: April 7, 2025
        </p>

        <div className="space-y-8">
          <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
          <div className="prose dark:prose-invert max-w-none">
            This Privacy Policy explains how CineNiche (“we”, “us”, “our”)
            collects, uses, and protects your personal information when you use
            our website and services. We are committed to protecting your
            privacy in accordance with the General Data Protection Regulation
            (GDPR) and other applicable privacy laws.
          </div>
          <h2 className="text-xl font-semibold mb-3">
            2. Information We Collect
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            We may collect and process the following types of personal data:
            Personal Information: Name, email address (provided during account
            creation) Usage Data: Movies viewed, ratings submitted, preferences
            Technical Data: IP address, browser type, operating system, device
            information Cookies and Tracking Technologies: Information collected
            via cookies and similar technologies
          </div>
          <h2 className="text-xl font-semibold mb-3">
            3. Legal Bases for Processing
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            We process your personal data under the following lawful bases (per
            Article 6 GDPR): Consent – for email communications, use of
            non-essential cookies, and optional features Contractual necessity –
            to provide and maintain your account and services Legal obligation –
            for compliance with applicable laws Legitimate interests – to
            improve services, personalize content, and ensure security (unless
            your rights override these interests)
          </div>
          <h2 className="text-xl font-semibold mb-3">
            4. How We Use Your Information
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            We use your information to: Provide and manage your account and user
            experience Personalize movie recommendations and services Process
            transactions and provide customer support Communicate important
            service updates Monitor and improve website functionality Comply
            with legal requirements
          </div>
          <h2 className="text-xl font-semibold mb-3">5. Data Retention</h2>
          <div className="prose dark:prose-invert max-w-none">
            We retain your personal data only as long as necessary for the
            purposes outlined in this policy, including legal, tax, or
            accounting requirements. When we no longer need your data, we
            securely delete or anonymize it.
          </div>
          <h2 className="text-xl font-semibold mb-3">
            6. Your Rights Under GDPR
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            You have the following rights: Access – Request a copy of your
            personal data Rectification – Request corrections to inaccurate or
            incomplete data Erasure – Request deletion of your data (“right to
            be forgotten”) Restriction – Request limited processing under
            certain conditions Data Portability – Receive your data in a
            structured, machine-readable format Objection – Object to certain
            processing (e.g., direct marketing) Automated decision-making – Not
            be subject to decisions made solely by automated means To exercise
            your rights, contact us at privacy@cineniche.com.
          </div>
          <h2 className="text-xl font-semibold mb-3">7. Cookies</h2>
          <div className="prose dark:prose-invert max-w-none">
            We use cookies to enhance your browsing experience, personalize
            content, and analyze traffic. You can manage cookie settings through
            your browser. For more information, see our Cookie Policy.
          </div>
          <h2 className="text-xl font-semibold mb-3">
            8. International Data Transfers
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            If your personal data is transferred outside the European Economic
            Area (EEA), we ensure an adequate level of protection through
            measures such as: Standard Contractual Clauses approved by the
            European Commission Data transfer agreements with third-party
            processors (Include this section only if you're using services
            hosted outside the EU, e.g., AWS, Google Cloud, Firebase, etc.)
          </div>
          <h2 className="text-xl font-semibold mb-3">
            9. Third-Party Services
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            We may use third-party service providers to support our services
            (e.g., analytics, hosting). These third parties only access personal
            data as necessary and in compliance with this policy. Each has its
            own privacy policy.
          </div>
          <h2 className="text-xl font-semibold mb-3">10. Data Security</h2>
          <div className="prose dark:prose-invert max-w-none">
            We implement appropriate technical and organizational measures to
            protect your personal data from unauthorized access, alteration,
            disclosure, or destruction.
          </div>
          <h2 className="text-xl font-semibold mb-3">
            11. Changes to This Privacy Policy
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            We may update this Privacy Policy periodically. When we do, we will
            revise the “Last Updated” date at the top. Significant changes will
            be communicated via the app or email if required by law.
          </div>
          <h2 className="text-xl font-semibold mb-3">12. Contact Us</h2>
          <div className="prose dark:prose-invert max-w-none">
            If you have any questions, concerns, or requests related to this
            Privacy Policy, please contact us at: Email: privacy@cineniche.com
            Mailing Address: 790 TNRB, Brigham Young University, Provo, UT
            84602-3113
          </div>
        </div>
        <br />
        <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Last Updated: April 7, 2025
        </p>
        <div className="space-y-8">
          <h2 className="text-xl font-semibold mb-3">1. What Are Cookies?</h2>
          <div className="prose dark:prose-invert max-w-none">
            Cookies are small text files stored on your device when you visit a
            website. They are widely used to make websites work efficiently,
            enhance user experience, and provide analytical data to site owners.
            Cookies can be: Session cookies: Deleted when you close your browser
            Persistent cookies: Remain until they expire or are manually deleted
            First-party cookies: Set by the website you are visiting Third-party
            cookies: Set by external services integrated into the site
          </div>
          <h2 className="text-xl font-semibold mb-3">2. How We Use Cookies</h2>
          <div className="prose dark:prose-invert max-w-none">
            Movie Rating App uses cookies for the following purposes: a.
            Essential Cookies These cookies are necessary for the website to
            function properly. They enable core functionality like user login,
            account management, and security features. You cannot opt out of
            these. b. Performance & Analytics Cookies These cookies help us
            understand how visitors interact with our website by collecting
            anonymous usage data. We use tools like Google Analytics to: Analyze
            traffic and usage patterns Improve site functionality Identify
            performance issues c. Functionality Cookies These cookies remember
            your preferences, such as language, location, or favorite movies, to
            enhance your experience. d. Marketing & Personalization Cookies
            (Optional) If you consent, we may use cookies to show personalized
            content or movie recommendations based on your activity on our site.
          </div>
          <h2 className="text-xl font-semibold mb-3">3. Third-Party Cookies</h2>
          <div className="prose dark:prose-invert max-w-none">
            Some cookies are set by third-party services we use, such as: Google
            Analytics – for traffic analytics Firebase (if applicable) – for
            authentication or performance monitoring Each third party has its
            own privacy and cookie policies.
          </div>
          <h2 className="text-xl font-semibold mb-3">4. Cookie Consent</h2>
          <div className="prose dark:prose-invert max-w-none">
            When you first visit our site, you will see a cookie banner asking
            for your consent to use non-essential cookies. You can change your
            preferences or withdraw consent at any time via the [Cookie
            Settings] link in the site footer.
          </div>
          <h2 className="text-xl font-semibold mb-3">5. Managing Cookies</h2>
          <div className="prose dark:prose-invert max-w-none">
            You can manage or disable cookies through your browser settings.
            Please note that disabling cookies may affect website functionality.
            Chrome: chrome://settings/cookies Firefox: about:preferences#privacy
            Safari: Settings {">"} Safari {">"} Privacy & Security Edge:
            Settings {">"} Site permissions {">"} Cookies and site data
          </div>
          <h2 className="text-xl font-semibold mb-3">
            6. Changes to This Cookie Policy
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            We may update this Cookie Policy to reflect changes in our practices
            or legal requirements. Check this page periodically for updates. The
            “Last Updated” date will reflect the most recent changes.
          </div>
          <h2 className="text-xl font-semibold mb-3">7. Contact Us</h2>
          <div className="prose dark:prose-invert max-w-none">
            If you have questions about our use of cookies, please contact us
            at: Email: privacy@cineniche.com
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;
