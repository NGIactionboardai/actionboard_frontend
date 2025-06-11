// components/meetings/MeetingsHeader.js
'use client';

import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectZoomIsConnected,
  setShowConnectionModal,
  setShowDisconnectModal 
} from '../../../redux/auth/zoomSlice';
import { ZoomConnectionStatus } from '../ZoomConnection';

const MeetingsHeader = ({ 
  organizationId, 
  onCreateMeetingClick 
}) => {
  const dispatch = useDispatch();
  const isZoomConnected = useSelector(selectZoomIsConnected);

  const handleZoomConnectionClick = () => {
    if (isZoomConnected) {
      // If connected, show disconnect modal
      dispatch(setShowDisconnectModal(true));
    } else {
      // If not connected, show connection modal
      dispatch(setShowConnectionModal(true));
    }
  };

  return (
    <div className="md:flex md:items-center md:justify-between mb-8">
      <div className="flex-1 min-w-0">
        <Link 
          href="/"
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          <svg className="mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Back to Organizations
        </Link>
        <div className="mt-2">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Meetings
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Organization ID: {organizationId}
          </p>
        </div>
      </div>
      <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
        {/* Zoom Connection Status and Button */}
        <div className="flex items-center space-x-3">
          <ZoomConnectionStatus organizationId={organizationId} showDetails={true} />
          
          {/* Dynamic button based on connection status */}
          <button
            onClick={handleZoomConnectionClick}
            className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isZoomConnected
                ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100 focus:ring-red-500'
                : 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 focus:ring-blue-500'
            }`}
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {isZoomConnected ? 'Manage Zoom' : 'Connect Zoom'}
          </button>
        </div>
        
        {/* Create Meeting Button */}
        <button
          onClick={onCreateMeetingClick}
          disabled={!isZoomConnected}
          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isZoomConnected 
              ? 'bg-indigo-600 hover:bg-indigo-700' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          title={!isZoomConnected ? 'Connect to Zoom first to create meetings' : 'Create new Zoom meeting'}
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Meeting
        </button>
        
        <Link 
          href="/dashboard/upload"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Upload Recording
        </Link>
      </div>
    </div>
  );
};

export default MeetingsHeader;