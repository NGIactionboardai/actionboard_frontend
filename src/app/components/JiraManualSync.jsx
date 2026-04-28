'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  syncJiraMeeting,
  selectJiraIsConnected,
  selectJiraLoading,
} from '@/redux/auth/jiraSlice';

export default function JiraManualSync({ meetingId, source = 'normal' }) {
  const dispatch = useDispatch();

  const isConnected = useSelector(selectJiraIsConnected);
  const loading = useSelector(selectJiraLoading);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSync = async () => {
    if (!meetingId) return;

    setMessage('');
    setError('');

    const result = await dispatch(
      syncJiraMeeting({
        meeting_id: String(meetingId),
        source,
      })
    );

    if (syncJiraMeeting.fulfilled.match(result)) {
      setMessage(result.payload?.message || 'Jira sync triggered successfully.');
    } else {
      setError(
        typeof result.payload === 'string'
          ? result.payload
          : 'Failed to sync this meeting to Jira.'
      );
    }
  };

  if (!isConnected || !meetingId) return null;

  return (
    <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Jira Manual Sync
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Sync this meeting to Jira. Source: <span className="font-medium">{source}</span>
          </p>
        </div>

        <button
          onClick={handleSync}
          disabled={loading}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Syncing...' : 'Manual Sync'}
        </button>
      </div>

      {message && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
