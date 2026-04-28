'use client';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectJiraIsConnected,
  selectJiraLoading,
  setShowJiraConnectionModal,
  setShowJiraDisconnectModal,
  startJiraOAuth,
  disconnectJira,
} from '@/redux/auth/jiraSlice';

export default function JiraConfig() {
  const dispatch = useDispatch();

  const isConnected = useSelector(selectJiraIsConnected);
  const loading = useSelector(selectJiraLoading);
  const showConnectionModal = useSelector((state) => state.jira.showConnectionModal);
  const showDisconnectModal = useSelector((state) => state.jira.showDisconnectModal);
  const siteName = useSelector((state) => state.jira.siteName);
  const siteUrl = useSelector((state) => state.jira.siteUrl);

  const closeConnectModal = () => {
    dispatch(setShowJiraConnectionModal(false));
  };

  const closeDisconnectModal = () => {
    dispatch(setShowJiraDisconnectModal(false));
  };

  const handleConnect = () => {
    dispatch(startJiraOAuth());
  };

  const handleDisconnect = async () => {
    await dispatch(disconnectJira());
    dispatch(setShowJiraDisconnectModal(false));
  };

  return (
    <>
      {showConnectionModal && !isConnected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
            <h2 className="text-xl font-semibold text-gray-900">Connect Jira</h2>
            <p className="mt-3 text-sm text-gray-600 leading-6">
              Connect your Jira account to map ActionBoard workspaces to Jira projects
              and enable sync to Jira.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={closeConnectModal}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>

              <button
                onClick={handleConnect}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Connecting...' : 'Connect Jira'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDisconnectModal && isConnected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
            <h2 className="text-xl font-semibold text-gray-900">Disconnect Jira</h2>

            <p className="mt-3 text-sm text-gray-600 leading-6">
              {siteName
                ? `You are currently connected to ${siteName}.`
                : 'You are currently connected to Jira.'}
            </p>

            {siteUrl && (
              <p className="mt-2 text-sm text-blue-600 break-all">
                {siteUrl}
              </p>
            )}

            <p className="mt-4 text-sm text-gray-500 leading-6">
              Disconnecting will stop future Jira sync. Existing mappings will remain saved.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={closeDisconnectModal}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>

              <button
                onClick={handleDisconnect}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Disconnecting...' : 'Disconnect Jira'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
