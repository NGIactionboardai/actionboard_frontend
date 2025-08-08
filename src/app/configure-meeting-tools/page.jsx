'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../redux/auth/authSlices';
import { selectZoomIsConnected, selectZoomSuccessMessage, setShowConnectionModal, setShowDisconnectModal } from '@/redux/auth/zoomSlice';
import { useMeetingsModal } from '../hooks/useMeetings';
import ZoomConfig from '../components/ZoomConfig';
import ZoomAccountCard from '../components/ZoomAccountCard';
import withProfileCompletionGuard from '../components/withProfileCompletionGuard';

function ConfigureMeetingToolsPage() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const router = useRouter();
  const isZoomConnected = useSelector(selectZoomIsConnected);
  const successMessage = useSelector(selectZoomSuccessMessage);

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

  const handleZoomConnectionClick = () => {
      if (isZoomConnected) {
        dispatch(setShowDisconnectModal(true));
      } else {
        dispatch(setShowConnectionModal(true));
      }
   };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-semibold text-gray-900 mb-10">Configure your Meeting Platforms</h1>

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
            <div className="flex flex-col items-center opacity-50 cursor-not-allowed group transition-transform hover:scale-105">
                <div className="rounded-2xl border-2 p-10 border-gray-300 shadow-md w-48 h-48 flex items-center justify-center transition-all duration-200 group-hover:shadow-lg">
                <img
                    src="/meeting-tools-icons/meet-logo.png"
                    alt="Google Meet"
                    className="h-24 w-24 object-contain"
                />
                </div>
                <p className="mt-4 text-lg font-medium text-gray-700">Google Meet</p>
                <p className="mt-1 text-sm text-gray-500">Coming Soon</p>
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

      <ZoomConfig 
        isOpen={isZoomConnectionModalOpen}
        onClose={() => setIsZoomConnectionModalOpen(false)}
      />
    </main>
  );
}


export default withProfileCompletionGuard(ConfigureMeetingToolsPage)
