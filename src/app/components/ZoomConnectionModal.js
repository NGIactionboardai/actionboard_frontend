// components/ZoomConnectionModal.js
'use client';

import { useState } from 'react';
import { X, Shield, Video, FileText, CheckCircle } from 'lucide-react';

const ZoomConnectionModal = ({ isOpen, onClose, onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await onConnect();
    } catch (error) {
      console.error('Failed to connect to Zoom:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.51 8.95c-.65.41-1.05 1.11-1.05 1.87v8.36c0 1.24 1.01 2.25 2.25 2.25h8c.76 0 1.46-.4 1.87-1.05L3.51 8.95zM20.49 15.05c.65-.41 1.05-1.11 1.05-1.87V4.82c0-1.24-1.01-2.25-2.25-2.25h-8c-.76 0-1.46.4-1.87 1.05l11.07 11.43z"/>
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Connect to Zoom
                </h3>
                <p className="text-sm text-gray-500">
                  Access your meeting recordings
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              What we'll access:
            </h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <Video className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-sm text-gray-700">Your cloud meeting recordings</span>
              </div>
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-sm text-gray-700">Meeting metadata (date, duration, participants)</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-sm text-gray-700">Read-only access (we cannot modify or delete)</span>
              </div>
            </div>
          </div>

          {/* Security note */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-6">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800">
                  <strong>Secure Connection:</strong> We use OAuth 2.0 authentication. 
                  Your Zoom credentials are never stored on our servers.
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConnect}
              disabled={isConnecting}
              className="flex-1 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connecting...
                </div>
              ) : (
                'Connect to Zoom'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZoomConnectionModal;