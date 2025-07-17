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
import { ZoomConnectionStatus } from '../ZoomConnection';
import OrgSwitcher from './OrgSwitcher';

export default function MeetingsSidebar({
  organizationId,
  onCreateMeetingClick
}) {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth?.token);
  const isZoomConnected = useSelector(selectZoomIsConnected);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(organizationId);
  

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await makeApiCall('https://actionboard-ai-backend.onrender.com/api/organisations/my-organisations/', {
          method: 'GET',
          headers: getAuthHeaders(token)
        });
        const data = await res.json();
        setOrganizations(data || []);
      } catch (err) {
        console.error('Failed to fetch organizations');
      }
    };

    fetchOrgs();
  }, []);

  const handleOrgChange = (e) => {
    const newOrgId = e.target.value;
  
    if (newOrgId === 'all-orgs') {
      window.location.href = '/organizations';
    } else if (newOrgId !== organizationId) {
      window.location.href = `/meetings/${newOrgId}`;
    }
  };

  const handleZoomConnectionClick = () => {
    if (isZoomConnected) {
      dispatch(setShowDisconnectModal(true));
    } else {
      dispatch(setShowConnectionModal(true));
    }
  };

  return (
    <div className="fixed top-20 bottom-0 left-0 w-full md:w-64 p-4 h-[calc(100vh-80px)] overflow-y-auto bg-gray-100 border-r border-gray-200">
      
      {/* Organization Selector */}
      <OrgSwitcher
        selectedOrg={selectedOrg}
        setSelectedOrg={setSelectedOrg}
        organizations={organizations}
        organizationId={organizationId}
      />

      {/* Heading */}
        <h3 className="text-2xl font-bold text-center text-gray-800 mb-4 mt-2">Meeting Zone</h3>
  
      {/* Zoom Connection Status Badge */}
      <div className="mb-4">
        <ZoomConnectionStatus organizationId={organizationId} showDetails={false} />
      </div>
  
      <div className="space-y-3">
        {/* Connect or Manage Zoom */}
        <button
            onClick={handleZoomConnectionClick}
            className={`w-full inline-flex justify-center items-center px-4 py-2 text-lg font-bold rounded-md transition-all
                bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white hover:from-[#080aa8] hover:to-[#6d0668] cursor-pointer
            `}
        >
            {isZoomConnected ? 'Manage Zoom' : 'Connect to Zoom'}
        </button>

        {/* Create Meeting */}
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

            {/* Org Calendar */}
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
        </div>

    </div>
  );
}
