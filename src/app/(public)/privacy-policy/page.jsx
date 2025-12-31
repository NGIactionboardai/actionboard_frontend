'use client';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-start justify-center p-6 sm:p-10">
      <div className="mt-20 w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8 sm:p-12 backdrop-blur-sm border border-gray-100">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500">
            Version 2.0 · Effective Date: December 22, 2025
          </p>
        </div>

        {/* Policy Content */}
        <div className="prose prose-gray max-w-none text-justify">

          <p>
            Welcome to Nous Meeting’s website and application. Nous Meeting provides an
            AI-powered smart meeting assistant designed to record, transcribe, summarize,
            extract action items, analyze speaker sentiment, prepare reports, and manage
            follow-ups.
          </p>

          <p>
            We recognize the importance of privacy and are committed to protecting your
            personal information. This Privacy Policy explains how Nous Meeting collects,
            uses, and safeguards your data.
          </p>

          <h2>1. Applicability of This Policy</h2>
          <p>
            This Privacy Policy applies solely to Nous Meeting’s website and application.
            Third-party services accessed through our platform are governed by their own
            privacy policies.
          </p>
          <p>
            “Nous Meeting” refers to the application owned by Next Generation Innovation
            L.L.C., a limited liability company registered in the State of New York, USA.
          </p>

          <h2>2. Personal Information</h2>
          <p>
            Personal information includes any data that can identify an individual, such as
            name, email address, date of birth, phone number, voice recordings, emotions,
            sentiments, and related meeting content.
          </p>

          <h2>3. Information We Collect</h2>

          <h3>3.1 Personal Information</h3>
          <p>
            We collect personal information during registration, surveys, transactions,
            support requests, and communications via email.
          </p>

          <h3>3.2 Automatically Collected Information</h3>
          <ul>
            <li>Domain name and IP address</li>
            <li>Browser type and operating system</li>
            <li>Date and time of visit</li>
            <li>Pages and services accessed</li>
            <li>Referring and exit pages</li>
            <li>Downloaded forms or documents</li>
          </ul>

          <h3>3.3 Cookies</h3>
          <p>
            We use session and persistent cookies to improve functionality. You may disable
            cookies via browser settings, though some features may be limited.
          </p>

          <h3>3.4 Text Message Data</h3>
          <p>
            Text message data submitted via the website may be retained indefinitely unless
            legally required otherwise.
          </p>

          <h2>4. Information Collected During User Interaction</h2>

          <h3>4.1 Registration Data</h3>
          <ul>
            <li>Name, email, phone number (optional), login credentials</li>
            <li>Profile details such as organization or job title (optional)</li>
            <li>Meeting metadata (title, participants, schedule)</li>
          </ul>

          <h3>4.2 Billing Information</h3>
          <p>
            Payments are processed securely by third-party payment processors. Nous
            Meeting does not store credit card details.
          </p>

          <h3>4.3 Usage Data</h3>
          <ul>
            <li>Device and browser identifiers</li>
            <li>Meeting duration, participation time, and feature usage</li>
          </ul>

          <h3>4.4 User-Generated Content</h3>
          <p>
            Audio, video, chat messages, screen shares, uploaded files, and feedback may be
            stored based on your settings.
          </p>

          <h2>5. Information Provided via Email</h2>
          <p>
            Emails sent to Nous Meeting may be stored and used solely for support,
            communication, and service improvement purposes.
          </p>

          <h2>6. Recording of Meetings – User Responsibility & Legal Compliance</h2>

          <p className="font-semibold text-red-600">
            CRITICAL NOTICE: Nous Meeting is a technology provider only. You are solely
            responsible for complying with all recording, consent, and data-protection laws.
          </p>

          <p>
            As the meeting host or recording initiator, you are exclusively responsible for:
          </p>

          <ul>
            <li>Determining applicable federal, state, and international recording laws</li>
            <li>Providing legally sufficient notice of recording</li>
            <li>Obtaining all required participant consents</li>
            <li>Complying with GDPR, CCPA, PIPEDA, and similar regulations</li>
            <li>Securing, retaining, and deleting recordings appropriately</li>
          </ul>

          <p>
            Automated recording indicators provided by Nous Meeting are technical features
            only and may not constitute legal notice in all jurisdictions.
          </p>

          <p>
            Nous Meeting disclaims all liability for recording misuse, non-compliance, or
            legal consequences arising from user actions.
          </p>

          <h2>7. Information Use & Disclosure</h2>
          <p>
            We use collected information to operate and improve services, provide support,
            conduct analytics, and meet legal obligations. We do not sell personal
            information.
          </p>

          <h2>8. Security & Confidentiality</h2>
          <p>
            We employ industry-standard security measures including encryption, access
            controls, and contractual confidentiality obligations. However, no system is
            completely secure.
          </p>

          <h2>9. Your Privacy Rights</h2>
          <p>
            Depending on your jurisdiction, you may request access, correction, deletion,
            restriction, portability, or withdrawal of consent by contacting us.
          </p>

          <h2>10. Children’s Privacy</h2>
          <p>
            Nous Meeting does not knowingly collect personal data from children under 13
            (or under 16 where applicable).
          </p>

          <h2>11. External Links</h2>
          <p>
            We are not responsible for the privacy practices of third-party services linked
            from our platform.
          </p>

          <h2>12. Data Retention</h2>
          <p>
            Data is retained only as long as necessary for legal, operational, and business
            purposes, then securely deleted or anonymized.
          </p>

          <h2>13. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically. Continued use of the service
            constitutes acceptance of changes.
          </p>

          <h2>14. User Responsibility</h2>
          <p>
            Users are responsible for safeguarding their credentials and all activity under
            their account.
          </p>

          <h2>15. Contact Us</h2>
          <p>
            <strong>Next Generation Innovation L.L.C.</strong><br />
            State of Registration: New York, USA<br />
            Email: support@nousmeeting.com<br />
            Website: www.nousmeeting.com
          </p>

          <hr />

          <p className="text-sm text-gray-500">
            FINAL LEGAL NOTICE: This Privacy Policy is informational only and does not
            constitute legal advice. Users must consult qualified legal counsel to ensure
            compliance with applicable laws.
          </p>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
