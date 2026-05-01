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


  const {
      isCreateMeetingModalOpen,
      setIsCreateMeetingModalOpen,
      isZoomConnectionModalOpen,
      setIsZoomConnectionModalOpen,
      handleCreateMeetingClick
    } = useMeetingsModal(successMessage);

//   useEffect(() => {
//     if (!isAuthenticated) {
//       router.push('/auth/login');
//     }
//   }, [isAuthenticated, router]);

//   if (!isAuthenticated) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p>Checking authentication...</p>
//         </div>
//       </div>
//     );
//   }


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("google") === "connected") {
      dispatch(fetchGoogleStatus());
    }

    if (params.get("google") === "auth-error") {
      console.error("Google authentication failed");
    }
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
    const res = await dispatch(startGoogleOAuth());
  
    if (res.payload?.auth_url) {
      window.location.href = res.payload.auth_url;
    }
  };
  
  const handleGoogleDisconnect = () => {
    dispatch(disconnectGoogle());
    setShowGoogleDisconnectModal(false);
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

            {/* Microsoft Teams Card (disabled) */}
            <div className="flex flex-col items-center opacity-50 cursor-not-allowed group transition-transform hover:scale-105">
                <div className="rounded-2xl border-2 p-10 border-gray-300 shadow-md w-48 h-48 flex items-center justify-center transition-all duration-200 group-hover:shadow-lg">
                <img
                    src="/meeting-tools-icons/teams-logo.png"
                    alt="Microsoft Teams"
                    className="h-24 w-24 object-contain"
                />
                </div>
                <p className="mt-4 text-lg font-medium text-gray-700">Microsoft Teams</p>
                <p className="mt-1 text-sm text-gray-500">Coming Soon</p>
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
    </main>
  );
}


export default withProfileCompletionGuard(ConfigureMeetingToolsPage)
