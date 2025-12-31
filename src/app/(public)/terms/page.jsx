'use client';

import termsText from '@/content/terms-v2.txt';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex justify-center p-6">
      <div className="mt-20 w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-gray-100">

        {/* Header */}
        <div className="text-center px-6 pt-10 pb-6 border-b">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900">
            TERMS OF USE
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Version 2.0 · Effective Date: December 22, 2025
          </p>
        </div>

        {/* EXACT LEGAL TEXT */}
        <div className="px-6 sm:px-10 py-8">
          <pre
            className="
              whitespace-pre-wrap
              text-sm
              leading-relaxed
              text-gray-800
              font-sans
              text-justify
            "
          >
            {termsText}
          </pre>
        </div>

      </div>
    </div>
  );
};

export default TermsPage;
