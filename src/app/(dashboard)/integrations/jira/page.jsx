'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronLeft } from 'lucide-react';
import {
  getJiraConnectionStatus,
  selectJiraIsConnected,
  selectJiraLoading,
  setShowJiraConnectionModal,
} from '@/redux/auth/jiraSlice';
import JiraConfig from '@/app/components/JiraConfig';
import JiraWorkspaceMappings from '@/app/components/JiraWorkspaceMappings';
import withProfileCompletionGuard from '@/app/components/withProfileCompletionGuard';

function JiraIntegrationPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const isJiraConnected = useSelector(selectJiraIsConnected);
  const loading = useSelector(selectJiraLoading);

  useEffect(() => {
    dispatch(getJiraConnectionStatus());
  }, [dispatch]);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <button
        onClick={() => router.push('/configure-meeting-tools')}
        className="absolute top-22 left-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium border border-blue-200 hover:bg-blue-100 hover:text-blue-800 transition-all duration-200"
      >
        <ChevronLeft size={18} />
        Back
      </button>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Jira Integration
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            Connect Jira and map ActionBoard workspaces to Jira projects.
          </p>
        </div>

        {!isJiraConnected && (
          <div className="max-w-xl mx-auto rounded-3xl bg-white border border-gray-200 shadow-sm p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Jira is not connected
            </h2>
            <p className="mt-3 text-sm text-gray-600">
              Connect Jira first to view and manage workspace mappings.
            </p>

            <button
              onClick={() => dispatch(setShowJiraConnectionModal(true))}
              disabled={loading}
              className="mt-6 inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium border border-blue-200 hover:bg-blue-100 hover:text-blue-800 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Connect Jira'}
            </button>
          </div>
        )}

        {isJiraConnected && <JiraWorkspaceMappings />}
      </div>

      <JiraConfig />
    </main>
  );
}

export default withProfileCompletionGuard(JiraIntegrationPage);
