'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import {
  selectZoomIsConnected,
  setShowConnectionModal,
  setShowDisconnectModal
} from '@/redux/auth/zoomSlice';
import { getAuthHeaders, makeApiCall } from '@/app/utils/api';
import OrgSwitcher from './OrgSwitcher';
import { ZoomConnectionStatus } from '../ZoomConfig';
import axios from 'axios';


export default function MeetingsSidebar({ organizationId, onCreateMeetingClick }) {

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth?.token);
  const isZoomConnected = useSelector(selectZoomIsConnected);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(organizationId);
  const [loading, setLoading] = useState(true); // New loading state

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/organisations/my-organisations/`);
        setOrgs(res.data || []);
      } catch (err) {
        console.error('Error fetching organizations:', err);
      }
    };
  
    if (isAuthenticated) {
      fetchOrgs();
    }
  }, [isAuthenticated]);

  const handleZoomConnectionClick = () => {
    if (isZoomConnected) {
      dispatch(setShowDisconnectModal(true));
    } else {
      dispatch(setShowConnectionModal(true));
    }
  };

  return (
    <div className="fixed top-20 bottom-0 left-0 w-full md:w-72 p-4 h-[calc(100vh-80px)] overflow-y-auto bg-gray-100 border-r border-gray-200">
      {/* Org Switcher or Skeleton */}
      {loading ? (
        <div className="h-10 w-full bg-gray-300/70 dark:bg-gray-700/70 rounded animate-pulse mb-6" />
      ) : (
        <OrgSwitcher
          selectedOrg={selectedOrg}
          setSelectedOrg={setSelectedOrg}
          organizations={organizations}
          organizationId={organizationId}
        />
      )}

      {/* Heading */}
      {loading ? (
        <div className="h-6 w-40 bg-gray-300/70 dark:bg-gray-700/70 rounded animate-pulse mx-auto mb-6" />
      ) : (
        <h3 className="text-2xl font-bold text-center text-gray-800 mb-4 mt-2">Meeting Zone</h3>
      )}

      {/* Zoom Status and Connect Button */}
      {loading ? (
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-32 bg-gray-300/70 dark:bg-gray-700/70 rounded animate-pulse" />
          <div className="h-6 w-24 bg-gray-300/70 dark:bg-gray-700/70 rounded animate-pulse" />
        </div>
      ) : (
        <div className="mb-4 flex items-center justify-between">
          <ZoomConnectionStatus organizationId={organizationId} showDetails={false} />
          {!isZoomConnected && (
            <button
              onClick={() => window.location.href = '/configure-meeting-tools'}
              className="ml-4 px-3 py-1.5 text-xs rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition cursor-pointer"
            >
              Connect Zoom
            </button>
          )}
        </div>
      )}

      {/* Buttons or Skeletons */}
      <div className="space-y-3">
        {loading ? (
          <>
            <div className="animate-pulse space-y-4 mt-4">
              {/* Button Skeleton 1 */}
              <div className="h-10 rounded-md bg-gray-300/70 dark:bg-gray-700/70 w-full"></div>

              {/* Button Skeleton 2 */}
              <div className="h-10 rounded-md bg-gray-300/70 dark:bg-gray-700/70 w-full"></div>

              {/* Button Skeleton 3 */}
              <div className="h-10 rounded-md bg-gray-300/70 dark:bg-gray-700/70 w-full"></div>

              {/* Button Skeleton 4 */}
              <div className="h-10 rounded-md bg-gray-300/70 dark:bg-gray-700/70 w-full"></div>
          </div>
          </>
        ) : (
          <>
            <button
              onClick={onCreateMeetingClick}
              disabled={!isZoomConnected}
              className={`w-full inline-flex justify-center items-center px-4 py-2 text-lg font-bold rounded-md transition-all
                bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white
                ${isZoomConnected
                  ? 'hover:from-[#080aa8] hover:to-[#6d0668] cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'}
              `}
              title={!isZoomConnected ? 'Connect to Zoom first' : 'Create new meeting'}
            >
              Create Meeting
            </button>

            <Link
              href={`/calendar/${organizationId}`}
              className={`w-full inline-flex justify-center items-center px-4 py-2 text-lg font-bold rounded-md transition-all
                bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white
                ${isZoomConnected
                  ? 'hover:from-[#080aa8] hover:to-[#6d0668] cursor-pointer'
                  : 'opacity-50 cursor-not-allowed pointer-events-none'}
              `}
              title={!isZoomConnected ? 'Connect to Zoom first' : 'Go to Org Calendar'}
            >
              Org Calendar
            </Link>

            <Link
              href={`/member-list/${organizationId}`}
              className={`w-full inline-flex justify-center items-center px-4 py-2 text-lg font-bold rounded-md transition-all
                bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white
                ${isZoomConnected
                  ? 'hover:from-[#080aa8] hover:to-[#6d0668] cursor-pointer'
                  : 'opacity-50 cursor-not-allowed pointer-events-none'}
              `}
              title={!isZoomConnected ? 'Connect to Zoom first' : 'View Members'}
            >
              Member list
            </Link>

            <button
              onClick={() => window.location.href = '/configure-meeting-tools'}
              className="w-full inline-flex justify-center items-center px-4 py-2 text-lg font-bold rounded-md transition-all
                bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white hover:from-[#080aa8] hover:to-[#6d0668] cursor-pointer"
            >
              Meeting Platforms
            </button>
          </>
        )}
      </div>
    </div>
  );
}
