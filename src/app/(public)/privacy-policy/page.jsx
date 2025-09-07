'use client';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-start justify-center p-6 sm:p-10">
      <div className="mt-20 w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8 sm:p-12 backdrop-blur-sm border border-gray-100">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-sm text-gray-500">Version 1.0, August 15th, 2025</p>
        </div>

        {/* Policy Content */}
        <div className="prose prose-gray max-w-none text-justify">
          <p>
            Welcome to Nous Meeting’s website and application. Nous Meeting provides an
            AI-powered smart meeting assistant designed to record, transcribe, summarize, extract
            action items, analyze speaker sentiment, prepare reports, and manage follow-ups. The
            service caters to a wide range of users, regardless of their professional background or
            personal needs. Additionally, the platform aims to make learning about Nous Meeting’s
            application and business activities easier and facilitate communication with the
            platform.
          </p>
          <p>
            We recognize the importance of privacy, and we are committed to protecting your personal
            information. This Privacy Policy outlines how Nous Meeting collects, uses, and
            safeguards your data when you interact with our website and application.
          </p>

          <h2 className="font-bold mt-8">Applicability of This Policy</h2>
          <p>
            This Privacy Policy applies solely to Nous Meeting’s website and application. If you
            visit any third-party websites or applications through our platform, we advise you to
            review their respective privacy policies.
          </p>
          <p>
            For the purposes of this policy, “Nous Meeting” refers to the application owned by
            Next Generation Innovation L.L.C., a company registered in the State of New York as a
            limited liability company.
          </p>

          <h2 className="font-bold mt-8">Personal Information</h2>
          <p>
            “Personal information” refers to any information that can be used to identify an
            individual, such as name, date of birth, address, phone number, voice recordings,
            emotions, and sentiments. This also includes identifiable information related to a
            juridical entity.
          </p>

          <h2 className="font-bold mt-8">Information We Collect</h2>
          <div className="ml-4">
            <h3 className="font-bold mt-6">1. Personal Information</h3>
            <p className="">
              Nous Meeting may collect personal information when users interact with the platform,
              such as during registration, completing surveys, transactions, or when submitting
              information via email.
            </p>

            <h3 className="font-bold mt-6">2. Automatically Collected Information</h3>
            <p className="">We may automatically collect the following non-personally identifiable information when you visit our website or use our application:</p>
            <ul className="mt-2">
              <li className="mt-1 ml-3">a) Domain name and IP address</li>
              <li className="mt-1 ml-3">b) Browser type and operating system</li>
              <li className="mt-1 ml-3">c) Date and time of visit</li>
              <li className="mt-1 ml-3">d) Pages and services accessed</li>
              <li className="mt-1 ml-3">e) Referring websites and exit pages</li>
              <li className="mt-1 ml-3">f) Forms or documents downloaded</li>
            </ul>
            <p className="mt-2">
              This data is used to improve the functionality of the website, understand user
              interaction, and for statistical analysis. Rest assured, Nous Meeting does not sell or
              disclose this information for commercial purposes.
            </p>

            <h3 className="font-bold mt-6">3. Cookies</h3>
            <p>
              Nous Meeting uses “persistent” and “session” cookies, which store data temporarily for
              the duration of your visit or longer, depending on your browser settings. You can manage
              cookie preferences through your browser settings, though disabling certain cookies may
              impact your ability to use some website features.
            </p>

            <h3 className="font-bold mt-6">4. Text Message Data</h3>
            <p>We may retain text message data provided via the website for an indefinite period.</p>

          </div>

          <h2 className="font-bold mt-8">Information Collected During User Interaction</h2>
          <div className="ml-4">

            <h3 className="font-bold mt-6">1. Personal Information during Registration</h3>
            <p className="ml-1">When registering for an account, we may collect the following personal information:</p>
            <ul>
              <li className="mt-1 ml-3">a) Name, email address, phone number (optional), and login credentials</li>
              <li className="mt-1 ml-3">b) Profile details such as job title or organization name (optional)</li>
              <li className="mt-1 ml-3">c) Meeting-related data if you schedule or host meetings (e.g., meeting title,
                participant list, scheduled time)
              </li>
            </ul>

            <h3 className="font-bold mt-6">2. Billing Information</h3>
            <p>
              For users who purchase premium plans, billing information (e.g., credit card details) is
              securely processed through third-party payment processors.
            </p>

            <h3 className="font-bold mt-6">3. Usage Data</h3>
            <p className="ml-1">We automatically collect device and technical information to improve platform
            performance, including:</p>
            <ul>
              <li className="mt-1 ml-3">a) IP address, browser type, operating system, and device identifiers</li>
              <li className="mt-1 ml-3">b) Meeting activity, including participation time, features used (e.g., screen sharing,
                chat), and meeting duration
              </li>
            </ul>

            <h3 className="font-bold mt-6">4. User-Generated Content</h3>
            <p>
              Any content shared during meetings (such as audio, video, chat messages, screen shares,
              uploaded files) may be collected and stored based on your preferences. Support
              communications and feedback are also recorded to enhance our services.
            </p>

          </div>
          

          <h2 className="font-bold mt-8">Information Provided via Email</h2>
          <p>
            When you email Nous Meeting, the email address and its contents (including text,
            audio, video, or images) are collected. This information is used to respond to inquiries,
            improve the website, and address any issues. Nous Meeting does not sell or disclose
            email data for commercial purposes.
          </p>

          <h2 className="font-bold mt-8">Information Use and Disclosure</h2>

          <div className="ml-4">
            <h3 className="font-bold mt-6">1. Use of Information</h3>
            <p>
              The information collected is used to operate and improve our services, fulfil
              transactions, and enhance user experience. We may disclose this information for
              operational purposes, but never for commercial sale.
            </p>

            <h3 className="font-bold mt-6">2. Compliance with Laws</h3>
            <p>
              Nous Meeting complies with U.S. state and federal laws. We may disclose personal
              information as required by law, including in response to legal processes, or to protect
              our intellectual property and ensure the integrity of our platform.
            </p>
          </div>
          

          <h2 className="font-bold mt-8">Child Privacy</h2>
          <p>
            Nous Meeting does not knowingly collect information from children. We strongly advise
            parents or guardians to monitor their children’s online activity and ensure that children
            are not submitting personal information without supervision.
          </p>

          <h2 className="font-bold mt-8">Security and Confidentiality</h2>
          <p>
            We are committed to safeguarding your personal information against unauthorized access
            or disclosure. Nous Meeting employs security measures to protect your data, including
            contractual obligations with employees to ensure data integrity and confidentiality.
          </p>

          <h2 className="font-bold mt-8">External Links</h2>
          <p>
            Nous Meeting may provide links to third-party applications or websites. Please be aware
            that once you leave our platform, you are subject to the privacy policies of those
            external sites. We do not endorse the content, services, or privacy practices of external
            sites.
          </p>

          <h2 className="font-bold mt-8">Changes to This Privacy Policy</h2>
          <p>
            Nous Meeting reserves the right to modify this Privacy Policy at any time. Users should
            periodically review this policy to stay informed of any changes.
          </p>

          <h2 className="font-bold mt-8">User Responsibility</h2>
          <p>
            We encourage users to carefully protect their personal information, including login
            credentials and any sensitive data submitted through the website.
          </p>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
