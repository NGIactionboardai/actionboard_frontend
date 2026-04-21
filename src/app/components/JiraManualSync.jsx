'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  syncJiraMeeting,
  selectJiraIsConnected,
  selectJiraLoading,
  selectJiraWorkspaces,
} from '@/redux/auth/jiraSlice';

export default function JiraManualSync() {
  const dispatch = useDispatch();
  const isConnected = useSelector(selectJiraIsConnected);
  const loading = useSelector(selectJiraLoading);
  const workspaces = useSelector(selectJiraWorkspaces);

  const [meetingId, setMeetingId] = useState('');

  const hasMappedWorkspace = (workspaces || []).some(
    (workspace) => workspace.jira_project_key
  );

  const handleSync = () => {
    if (!meetingId.trim()) return;

    dispatch(
      syncJiraMeeting({
        meeting_id: meetingId.trim(),
        source: 'normal',
      })
    );
  };

  if (!isConnected || !hasMappedWorkspace) return null;

  return (
    <div className="mt-8 w-full max-w-4xl mx-auto">
      <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900">Retry Jira Sync</h3>
        <p className="mt-2 text-sm text-gray-600 leading-6">
          Use this only if you want to manually retry syncing a meeting to Jira.
        </p>

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
            placeholder="Enter meeting ID"
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleSync}
            disabled={loading || !meetingId.trim()}
            className="px-5 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Syncing...' : 'Retry Sync'}
          </button>
        </div>
      </div>
    </div>
  );
}
