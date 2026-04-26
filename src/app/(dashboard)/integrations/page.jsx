'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import withProfileCompletionGuard from '@/app/components/withProfileCompletionGuard';

function IntegrationsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const jiraStatus = searchParams.get('jira');

  if (jiraStatus === 'auth-error') {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl bg-white border border-red-100 shadow-sm p-8 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
            <AlertTriangle size={28} />
          </div>

          <h1 className="mt-5 text-2xl font-semibold text-gray-900">
            Jira integration failed
          </h1>

          <p className="mt-3 text-sm text-gray-600">
            Your Jira integration failed. Try again.
          </p>

          <button
            onClick={() => router.push('/configure-meeting-tools')}
            className="mt-6 inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium border border-blue-200 hover:bg-blue-100 hover:text-blue-800 transition-all duration-200"
          >
            Back to Meeting Tools
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-white border border-gray-200 shadow-sm p-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Integrations</h1>
        <p className="mt-3 text-sm text-gray-600">
          Choose an integration from the meeting tools page.
        </p>
        <button
          onClick={() => router.push('/configure-meeting-tools')}
          className="mt-6 inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium border border-blue-200 hover:bg-blue-100 hover:text-blue-800 transition-all duration-200"
        >
          Go to Meeting Tools
        </button>
      </div>
    </main>
  );
}

export default withProfileCompletionGuard(IntegrationsPage);
