// src/app/(dashboard)/configure-meeting-tools/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../../redux/auth/authSlices';
import { selectZoomIsConnected, selectZoomSuccessMessage, setShowConnectionModal, setShowDisconnectModal } from '@/redux/auth/zoomSlice';
import { useMeetingsModal } from '../../hooks/useMeetings';
import ZoomConfig from '../../components/ZoomConfig';
import ZoomAccountCard from '../../components/ZoomAccountCard';
import withProfileCompletionGuard from '../../components/withProfileCompletionGuard';
import { ChevronLeft } from 'lucide-react';
import { disconnectGoogle, fetchGoogleStatus, selectGoogleEmail, selectGoogleIsConnected, selectGoogleName, startGoogleOAuth } from '@/redux/integrations/googleCalendarSlice';
import GoogleCalendarAccountCard from '@/app/components/googleCalendar/GoogleCalendarAccountCard';
import JiraAccountCard from '@/app/components/jira/JiraAccountCard';
import { disconnectJira, getJiraConnectionStatus, selectJiraIsConnected, selectJiraLoading, startJiraOAuth } from '@/redux/integrations/jiraSlice';
import { disconnectTeams, fetchTeamsStatus, selectTeamsEmail, selectTeamsIsConnected, selectTeamsName, startTeamsOAuth } from '@/redux/integrations/teamsSlice';
import TeamsAccountCard from '@/app/components/teams/TeamsAccountCard';


function ConfigureMeetingToolsPage() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const router = useRouter();
  const isZoomConnected = useSelector(selectZoomIsConnected);
  const successMessage = useSelector(selectZoomSuccessMessage);

  const isGoogleConnected = useSelector(selectGoogleIsConnected);
  const googleEmail = useSelector(selectGoogleEmail);
  const googleName = useSelector(selectGoogleName);

  const [showGoogleConnectModal, setShowGoogleConnectModal] = useState(false);
  const [showGoogleDisconnectModal, setShowGoogleDisconnectModal] = useState(false);

  const isJiraConnected = useSelector(selectJiraIsConnected);
  const jiraLoading = useSelector(selectJiraLoading);

  const [showJiraConnectModal, setShowJiraConnectModal] = useState(false);
  const [showJiraDisconnectModal, setShowJiraDisconnectModal] = useState(false);

  const isTeamsConnected = useSelector(selectTeamsIsConnected);
  const [showTeamsConnectModal, setShowTeamsConnectModal] = useState(false);
  const [showTeamsDisconnectModal, setShowTeamsDisconnectModal] = useState(false);



  const {
      isCreateMeetingModalOpen,
      setIsCreateMeetingModalOpen,
      isZoomConnectionModalOpen,
      setIsZoomConnectionModalOpen,
      handleCreateMeetingClick
    } = useMeetingsModal(successMessage);


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // GOOGLE
    if (params.get("google") === "connected") {
      dispatch(fetchGoogleStatus());
    }

    if (params.get("google") === "auth-error") {
      console.error("Google authentication failed");
    }

    // JIRA
    if (params.get("jira") === "connected") {
      dispatch(getJiraConnectionStatus());
      router.push("/integrations/jira?connected=true");
    }

    if (params.get("jira") === "error") {
      console.error("Jira authentication failed");
    }

    // TEAMS
    if (params.get("teams") === "connected") {
      dispatch(fetchTeamsStatus());
      const url = new URL(window.location.href);
      url.searchParams.delete("teams");
      window.history.replaceState({}, document.title, url.toString());
    }

  }, [dispatch, router]);

  useEffect(() => {
    dispatch(getJiraConnectionStatus());
    dispatch(fetchTeamsStatus());
  }, [dispatch]);


  const handleZoomConnectionClick = () => {
      if (isZoomConnected) {
        dispatch(setShowDisconnectModal(true));
      } else {
        dispatch(setShowConnectionModal(true));
      }
  };

  


  const handleGoogleClick = () => {
    if (isGoogleConnected) {
      setShowGoogleDisconnectModal(true);
    } else {
      setShowGoogleConnectModal(true);
    }
  };

  const handleGoogleConnect = async () => {
    const res = dispatch(startGoogleOAuth());
  
    if (res.payload?.auth_url) {
      window.location.href = res.payload.auth_url;
    }
  };
  
  const handleGoogleDisconnect = () => {
    dispatch(disconnectGoogle());
    setShowGoogleDisconnectModal(false);
  };


  const handleJiraClick = () => {
    if (isJiraConnected) {
      setShowJiraDisconnectModal(true);
    } else {
      setShowJiraConnectModal(true);
    }
  };

  const handleJiraConnect = async () => {
    const res = await dispatch(startJiraOAuth());
  
    if (res.payload?.auth_url) {
      window.location.href = res.payload.auth_url;
    }
  };

  const handleJiraDisconnect = () => {
    dispatch(disconnectJira());
    setShowJiraDisconnectModal(false);
  };

  const handleTeamsClick = () => {
    if (isTeamsConnected) {
      setShowTeamsDisconnectModal(true);
    } else {
      setShowTeamsConnectModal(true);
    }
  };

  const handleTeamsConnect = async () => {
    const res = await dispatch(startTeamsOAuth());
    if (res.payload?.auth_url) {
      window.location.href = res.payload.auth_url;
    }
  };

  const handleTeamsDisconnect = () => {
    dispatch(disconnectTeams());
    setShowTeamsDisconnectModal(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">

    <button
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push("/dashboard");
        }
      }}
      className="absolute top-22 left-6 flex items-center gap-2 px-4 py-2 rounded-lg
      bg-blue-50 text-blue-700 text-sm font-medium
      border border-blue-200
      hover:bg-blue-100 hover:text-blue-800
      transition-all duration-200"
    >
      <ChevronLeft size={18} />
      Back
    </button>

      <div className="max-w-4xl mx-auto text-center">
        {/* Beautiful Back Button */}
        

        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-8 sm:mb-10">
          Configure Your Meeting Platforms
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 justify-items-center">
            {/* Zoom Card */}
            <div
                onClick={handleZoomConnectionClick}
                className="relative flex flex-col items-center group cursor-pointer transition-transform hover:scale-105"
                >
                {/* ✅ Top-right checkmark (only when connected) */}
                {isZoomConnected && (
                    <div className="absolute top-2 right-2 bg-[#00BA00] text-white rounded-full p-1 shadow-md">
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    </div>
                )}

                {/* ✅ Zoom logo box */}
                <div
                    className={`rounded-2xl p-10 shadow-lg w-48 h-48 flex items-center justify-center transition-all duration-200 group-hover:shadow-xl ${
                    isZoomConnected ? 'border-[3px] border-[#00BA00]' : 'border-2 border-gray-300'
                    }`}
                >
                    <img
                    src="/meeting-tools-icons/zoom-logo.png"
                    alt="Zoom"
                    className="h-24 w-24 object-contain"
                    />
                </div>

                {/* ✅ Text + badge */}
                <p className="mt-4 text-lg font-semibold text-blue-700 group-hover:text-blue-800">Zoom</p>
                <span
                    className={`mt-1 inline-block px-3 py-1 text-sm rounded-full font-medium ${
                    isZoomConnected
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                >
                    {isZoomConnected ? 'Connected' : 'Not Connected'}
                </span>
            </div>

            {/* Google Meet Card (disabled) */}
            <div
              onClick={handleGoogleClick}
              className="relative flex flex-col items-center group cursor-pointer transition-transform hover:scale-105"
            >
              {isGoogleConnected && (
                <div className="absolute top-2 right-2 bg-[#00BA00] text-white rounded-full p-1 shadow-md">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              <div
                className={`rounded-2xl p-10 shadow-lg w-48 h-48 flex items-center justify-center transition-all duration-200 group-hover:shadow-xl ${
                  isGoogleConnected ? 'border-[3px] border-[#00BA00]' : 'border-2 border-gray-300'
                }`}
              >
                <img
                  src="/meeting-tools-icons/meet-logo.png"
                  alt="Google Calendar"
                  className="h-24 w-24 object-contain"
                />
              </div>

              <p className="mt-4 text-lg font-semibold text-blue-700 group-hover:text-blue-800">
                Google Meet
              </p>

              <span
                className={`mt-1 inline-block px-3 py-1 text-sm rounded-full font-medium ${
                  isGoogleConnected
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {isGoogleConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>


            <div
              onClick={handleJiraClick}
              className="relative flex flex-col items-center group cursor-pointer transition-transform hover:scale-105"
            >
              {isJiraConnected && (
                <div className="absolute top-2 right-2 bg-[#00BA00] text-white rounded-full p-1 shadow-md">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              <div
                className={`rounded-2xl p-10 shadow-lg w-48 h-48 flex items-center justify-center transition-all duration-200 group-hover:shadow-xl ${
                  isJiraConnected ? 'border-[3px] border-[#00BA00]' : 'border-2 border-gray-300'
                }`}
              >
                <img
                  src="/integrations/jira-logo.png"
                  alt="Jira"
                  className="h-24 w-24 object-contain"
                />
              </div>

              <p className="mt-4 text-lg font-semibold text-blue-700 group-hover:text-blue-800">
                Jira
              </p>

              <span
                className={`mt-1 inline-block px-3 py-1 text-sm rounded-full font-medium ${
                  isJiraConnected
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {isJiraConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>

            {/* Microsoft Teams Card */}
            <div
              onClick={handleTeamsClick}
              className="relative flex flex-col items-center group cursor-pointer transition-transform hover:scale-105"
            >
              {isTeamsConnected && (
                <div className="absolute top-2 right-2 bg-[#00BA00] text-white rounded-full p-1 shadow-md">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              <div
                className={`rounded-2xl p-10 shadow-lg w-48 h-48 flex items-center justify-center transition-all duration-200 group-hover:shadow-xl ${
                  isTeamsConnected ? 'border-[3px] border-[#00BA00]' : 'border-2 border-gray-300'
                }`}
              >
                <img
                  src="/meeting-tools-icons/teams-logo.png"
                  alt="Microsoft Teams"
                  className="h-24 w-24 object-contain"
                />
              </div>

              <p className="mt-4 text-lg font-semibold text-blue-700 group-hover:text-blue-800">
                Microsoft Teams
              </p>

              <span
                className={`mt-1 inline-block px-3 py-1 text-sm rounded-full font-medium ${
                  isTeamsConnected
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {isTeamsConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
        </div>

      </div>

      <ZoomAccountCard
        onDisconnect={handleZoomConnectionClick}
        isZoomConnected={isZoomConnected}
      />

      <GoogleCalendarAccountCard
        onDisconnect={() => setShowGoogleDisconnectModal(true)}
        isGoogleConnected={isGoogleConnected}
      />

      <JiraAccountCard
        onDisconnect={() => setShowJiraDisconnectModal(true)}
        isJiraConnected={isJiraConnected}
      />

      <TeamsAccountCard
        onDisconnect={() => setShowTeamsDisconnectModal(true)}
        isTeamsConnected={isTeamsConnected}
      />

      <ZoomConfig
        isOpen={isZoomConnectionModalOpen}
        onClose={() => setIsZoomConnectionModalOpen(false)}
      />

      {showGoogleConnectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[400px] text-center shadow-xl">
            <h2 className="text-lg font-semibold mb-3">Connect Google Calendar</h2>

            <p className="text-sm text-gray-600 mb-6">
              To create and manage <span className="font-medium">Google Meet</span> meetings,
              you need to grant access to your <span className="font-medium">Google Calendar</span>.
              <br />
              You will be redirected to Google to complete authorization.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowGoogleConnectModal(false)}
                className="px-4 py-2 border rounded-lg text-gray-600"
              >
                Cancel
              </button>

              <button
                onClick={handleGoogleConnect}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {showGoogleDisconnectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[400px] text-center shadow-xl">
            <h2 className="text-lg font-semibold mb-3">Disconnect Google Calendar</h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to disconnect your Google account?
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowGoogleDisconnectModal(false)}
                className="px-4 py-2 border rounded-lg text-gray-600"
              >
                Cancel
              </button>

              <button
                onClick={handleGoogleDisconnect}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {showJiraConnectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[400px] text-center shadow-xl">
            <h2 className="text-lg font-semibold mb-3">Connect Jira</h2>

            <p className="text-sm text-gray-600 mb-6">
              Connect your Jira account to automatically create issues from meetings.
              <br />
              You will be redirected to Jira to authorize access.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowJiraConnectModal(false)}
                className="px-4 py-2 border rounded-lg text-gray-600"
              >
                Cancel
              </button>

              <button
                onClick={handleJiraConnect}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {showJiraDisconnectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[400px] text-center shadow-xl">
            <h2 className="text-lg font-semibold mb-3">Disconnect Jira</h2>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to disconnect your Jira account?
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowJiraDisconnectModal(false)}
                className="px-4 py-2 border rounded-lg text-gray-600"
              >
                Cancel
              </button>

              <button
                onClick={handleJiraDisconnect}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {showTeamsConnectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[400px] text-center shadow-xl">
            <h2 className="text-lg font-semibold mb-3">Connect Microsoft Teams</h2>

            <p className="text-sm text-gray-600 mb-6">
              To create and manage <span className="font-medium">Teams meetings</span>, you need to grant access to your{' '}
              <span className="font-medium">Microsoft 365</span> account.
              <br />
              You will be redirected to Microsoft to complete authorisation.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowTeamsConnectModal(false)}
                className="px-4 py-2 border rounded-lg text-gray-600"
              >
                Cancel
              </button>

              <button
                onClick={handleTeamsConnect}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {showTeamsDisconnectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[400px] text-center shadow-xl">
            <h2 className="text-lg font-semibold mb-3">Disconnect Microsoft Teams</h2>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to disconnect your Microsoft Teams account?
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowTeamsDisconnectModal(false)}
                className="px-4 py-2 border rounded-lg text-gray-600"
              >
                Cancel
              </button>

              <button
                onClick={handleTeamsDisconnect}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}


export default withProfileCompletionGuard(ConfigureMeetingToolsPage)
