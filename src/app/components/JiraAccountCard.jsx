'use client';

import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { ExternalLink, Globe2 } from 'lucide-react';
import {
  selectJiraIsConnected,
  selectJiraSiteName,
  selectJiraSiteUrl,
} from '@/redux/auth/jiraSlice';

export default function JiraAccountCard({ onDisconnect }) {
  const router = useRouter();

  const isConnected = useSelector(selectJiraIsConnected);
  const siteName = useSelector(selectJiraSiteName);
  const siteUrl = useSelector(selectJiraSiteUrl);

  if (!isConnected) return null;

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white rounded-2xl shadow-md border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Jira Account Details
          </h2>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center gap-3 text-gray-700">
              <Globe2 size={18} className="text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Site Name</p>
                <p className="font-medium">{siteName || 'Connected Jira Site'}</p>
              </div>
            </div>

            {siteUrl && (
              <div className="flex items-center gap-3 text-gray-700">
                <ExternalLink size={18} className="text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Site URL</p>
                  <p className="font-medium break-all">{siteUrl}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push('/integrations/jira')}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium border border-blue-200 hover:bg-blue-100 hover:text-blue-800 transition-all duration-200"
          >
            View Mappings
          </button>

          <button
            onClick={onDisconnect}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-red-50 text-red-700 text-sm font-medium border border-red-200 hover:bg-red-100 hover:text-red-800 transition-all duration-200"
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}
