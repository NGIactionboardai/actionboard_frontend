// components/modals/ZoomConnectionModal.js
'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  disconnectZoom,
  selectZoomIsConnected,
  selectZoomUserInfo,
  selectZoomLoading,
  selectZoomError,
  selectZoomSuccessMessage,
  clearMessages
} from '../../../redux/auth/zoomSlice';
import { ZoomConnectButton, ZoomConnectionStatus } from '../ZoomConnection';

const ZoomConnectionModal = ({ isOpen, onClose, organizationId }) => {
  const dispatch = useDispatch();
  const isZoomConnected = useSelector(selectZoomIsConnected);
  const userInfo = useSelector(selectZoomUserInfo);
  const loading = useSelector(selectZoomLoading);
  const error = useSelector(selectZoomError);
  const successMessage = useSelector(selectZoomSuccessMessage);
  
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  const handleDisconnect = () => {
    setShowDisconnectConfirm(true);
  };

  const handleConfirmDisconnect = () => {
    if (organizationId) {
      dispatch(disconnectZoom(organizationId));
      setShowDisconnectConfirm(false);
    }
  };

  const handleCancelDisconnect = () => {
    setShowDisconnectConfirm(false);
  };

  // Clear messages when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      dispatch(clearMessages());
    }
  }, [isOpen, dispatch]);

  // Close modal on successful disconnect
  useEffect(() => {
    if (successMessage && !isZoomConnected) {
      const timer = setTimeout(() => {
        onClose();
        setShowDisconnectConfirm(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, isZoomConnected, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
              <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
              {isZoomConnected ? 'Zoom Connection' : 'Connect to Zoom'}
            </h3>
          </div>

          {/* Content */}
          <div className="px-2 py-3">
            {/* Error Message */}
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">{successMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {!showDisconnectConfirm ? (
              <>
                {/* Connection Status */}
                <div className="mb-4">
                  <ZoomConnectionStatus organizationId={organizationId} showDetails={true} />
                </div>

                {/* User Info */}
                {isZoomConnected && userInfo && (
                  <div className="mb-4 bg-gray-50 rounded-md p-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Connected Account</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      {userInfo.first_name && (
                        <p><span className="font-medium">Name:</span> {userInfo.first_name} {userInfo.last_name}</p>
                      )}
                      {userInfo.email && (
                        <p><span className="font-medium">Email:</span> {userInfo.email}</p>
                      )}
                      {userInfo.account_id && (
                        <p><span className="font-medium">Account ID:</span> {userInfo.account_id}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Organization Info */}
                <div className="mb-4 bg-blue-50 rounded-md p-3">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">Organization:</span> {organizationId}
                  </p>
                </div>

                {!isZoomConnected ? (
                  <p className="text-sm text-gray-500 mb-4">
                    Connect your Zoom account to create and manage meetings directly from this platform.
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 mb-4">
                    Your Zoom account is connected. You can create and manage meetings.
                  </p>
                )}
              </>
            ) : (
              // Disconnect Confirmation
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Confirm Disconnect
                </h4>
                <p className="text-sm text-gray-500 mb-4">
                  Are you sure you want to disconnect from Zoom? This will remove access to your Zoom account and you'll need to reconnect to create meetings.
                </p>
                {userInfo && userInfo.email && (
                  <p className="text-sm text-gray-700 font-medium mb-4">
                    Currently connected as: {userInfo.email}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-4 py-3">
            {!showDisconnectConfirm ? (
              <div className="flex space-x-3">
                {!isZoomConnected ? (
                  <ZoomConnectButton 
                    organizationId={organizationId}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  />
                ) : (
                  <button
                    onClick={handleDisconnect}
                    disabled={loading}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                    </svg>
                    {loading ? 'Disconnecting...' : 'Disconnect'}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  {isZoomConnected ? 'Close' : 'Cancel'}
                </button>
              </div>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={handleConfirmDisconnect}
                  disabled={loading}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Disconnecting...' : 'Yes, Disconnect'}
                </button>
                <button
                  onClick={handleCancelDisconnect}
                  disabled={loading}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZoomConnectionModal;