'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../../redux/auth/authSlices';
import {
  selectZoomIsConnected,
  selectZoomSuccessMessage,
  setShowConnectionModal,
  setShowDisconnectModal,
} from '@/redux/auth/zoomSlice';
import {
  selectJiraIsConnected,
  getJiraConnectionStatus,
  setShowJiraConnectionModal,
  setShowJiraDisconnectModal,
} from '@/redux/auth/jiraSlice';

import { useMeetingsModal } from '../../hooks/useMeetings';
import ZoomConfig from '../../components/ZoomConfig';
import JiraConfig from '../../components/JiraConfig';
import JiraWorkspaceMappings from '../../components/JiraWorkspaceMappings';
import JiraManualSync from '../../components/JiraManualSync';
import ZoomAccountCard from '../../components/ZoomAccountCard';
import withProfileCompletionGuard from '../../components/withProfileCompletionGuard';
import { ChevronLeft } from 'lucide-react';

function ConfigureMeetingToolsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isZoomConnected = useSelector(selectZoomIsConnected);
  const isJiraConnected = useSelector(selectJiraIsConnected);
  const successMessage = useSelector(selectZoomSuccessMessage);

  const {
    isZoomConnectionModalOpen,
    setIsZoomConnectionModalOpen,
  } = useMeetingsModal(successMessage);

  // ✅ STEP 6A — Load Jira status on page load
  useEffect(() => {
    dispatch(getJiraConnectionStatus());
  }, [dispatch]);

  // ✅ STEP 6B — Handle OAuth callback
  useEffect(() => {
    const connected = searchParams.get('connected');
    const jiraError = searchParams.get('jira');

    if (connected === 'true') {
      dispatch(getJiraConnectionStatus());
    }

    if (jiraError === 'error') {
      console.error('Jira integration failed');
    }
  }, [searchParams, dispatch]);

  const handleZoomConnectionClick = () => {
    if (isZoomConnected) {
      dispatch(setShowDisconnectModal(true));
    } else {
      dispatch(setShowConnectionModal(true));
    }
  };

  const handleJiraConnectionClick = () => {
    if (isJiraConnected) {
      dispatch(setShowJiraDisconnectModal(true));
    } else {
      dispatch(setShowJiraConnectionModal(true));
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">

      {/* Back Button */}
      <button
        onClick={() => {
          if (window.history.length > 1) {
            router.back();
          } else {
            router.push('/dashboard');
          }
        }}
        className="absolute top-22 left-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium border border-blue-200 hover:bg-blue-100 hover:text-blue-800 transition-all duration-200"
      >
        <ChevronLeft size={18} />
        Back
      </button>

      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-8 sm:mb-10">
          Configure Your Meeting Platforms
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 justify-items-center">

          {/* Zoom Card */}
          <div
            onClick={handleZoomConnectionClick}
            className="relative flex flex-col items-center group cursor-pointer transition-transform hover:scale-105"
          >
            {isZoomConnected && (
              <div className="absolute top-2 right-2 bg-[#00BA00] text-white rounded-full p-1 shadow-md">
                ✓
              </div>
            )}

            <div className={`rounded-2xl p-10 shadow-lg w-48 h-48 flex items-center justify-center ${
              isZoomConnected ? 'border-[3px] border-[#00BA00]' : 'border-2 border-gray-300'
            }`}>
              <img src="/meeting-tools-icons/zoom-logo.png" className="h-24 w-24" />
            </div>

            <p className="mt-4 text-lg font-semibold text-blue-700">Zoom</p>

            <span className={`mt-1 px-3 py-1 text-sm rounded-full ${
              isZoomConnected ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
            }`}>
              {isZoomConnected ? 'Connected' : 'Not Connected'}
            </span>
          </div>

          {/* Jira Card */}
          <div
            onClick={handleJiraConnectionClick}
            className="relative flex flex-col items-center group cursor-pointer transition-transform hover:scale-105"
          >
            {isJiraConnected && (
              <div className="absolute top-2 right-2 bg-[#00BA00] text-white rounded-full p-1 shadow-md">
                ✓
              </div>
            )}

            <div className={`rounded-2xl p-10 shadow-lg w-48 h-48 flex items-center justify-center ${
              isJiraConnected ? 'border-[3px] border-[#00BA00]' : 'border-2 border-gray-300'
            }`}>
              <img src="https://cdn.worldvectorlogo.com/logos/jira-1.svg" className="h-24 w-24" />
            </div>

            <p className="mt-4 text-lg font-semibold text-blue-700">Jira</p>

            <span className={`mt-1 px-3 py-1 text-sm rounded-full ${
              isJiraConnected ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
            }`}>
              {isJiraConnected ? 'Connected' : 'Not Connected'}
            </span>
          </div>

        </div>
      </div>

      {/* Existing Components */}
      <ZoomAccountCard
        onDisconnect={handleZoomConnectionClick}
        isZoomConnected={isZoomConnected}
      />

      <ZoomConfig
        isOpen={isZoomConnectionModalOpen}
        onClose={() => setIsZoomConnectionModalOpen(false)}
      />

      {/* Jira Components */}
      <JiraConfig />
      <JiraWorkspaceMappings />
      <JiraManualSync />

    </main>
  );
}

export default withProfileCompletionGuard(ConfigureMeetingToolsPage);
