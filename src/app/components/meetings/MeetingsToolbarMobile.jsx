'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import axios from 'axios';
import {
  selectZoomIsConnected,
  setShowConnectionModal,
  setShowDisconnectModal,
} from '@/redux/auth/zoomSlice';
import OrgSwitcher from './OrgSwitcher';
import { ZoomConnectionStatus } from '../ZoomConfig';

export default function MeetingsToolbarMobile({ organizationId, onCreateMeetingClick }) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const dispatch = useDispatch();
  const isZoomConnected = useSelector(selectZoomIsConnected);

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(organizationId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/organisations/my-organisations/`);
        setOrganizations(res.data || []);
      } catch (err) {
        console.error('Error fetching organizations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgs();
  }, []);

  const handleZoomConnectionClick = () => {
    if (isZoomConnected) {
      dispatch(setShowDisconnectModal(true));
    } else {
      dispatch(setShowConnectionModal(true));
    }
  };

  return (
    <div className="xl:hidden w-full bg-gray-100 border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
      {/* Org Switcher */}
      {loading ? (
        <div className="h-10 w-full bg-gray-300/70 rounded animate-pulse mb-4" />
      ) : (
        <OrgSwitcher
          selectedOrg={selectedOrg}
          setSelectedOrg={setSelectedOrg}
          organizations={organizations}
          organizationId={organizationId}
        />
      )}

      {/* Zoom Connection Status */}
      <div className="flex items-center justify-between mb-4">
        <ZoomConnectionStatus organizationId={organizationId} showDetails={false} />
        {!isZoomConnected && (
          <button
            onClick={handleZoomConnectionClick}
            className="ml-2 px-3 py-1.5 text-xs rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition"
          >
            Connect Zoom
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 justify-center">
        <button
            onClick={onCreateMeetingClick}
            disabled={!isZoomConnected}
            className={`col-span-2 sm:col-span-1 max-w-xs mx-auto w-full inline-flex justify-center items-center px-4 py-2 text-sm font-semibold rounded-md transition-all
            bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white
            ${isZoomConnected
                ? 'hover:from-[#080aa8] hover:to-[#6d0668] cursor-pointer'
                : 'opacity-50 cursor-not-allowed'}
            `}
        >
            Create Meeting
        </button>

        <Link
            href={`/calendar/${organizationId}`}
            className={`max-w-xs mx-auto w-full inline-flex justify-center items-center px-4 py-2 text-sm font-semibold rounded-md transition-all
            bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white
            ${isZoomConnected
                ? 'hover:from-[#080aa8] hover:to-[#6d0668]'
                : 'opacity-50 pointer-events-none'}
            `}
        >
            Org Calendar
        </Link>

        <Link
            href={`/member-list/${organizationId}`}
            className={`max-w-xs mx-auto w-full inline-flex justify-center items-center px-4 py-2 text-sm font-semibold rounded-md transition-all
            bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white
            ${isZoomConnected
                ? 'hover:from-[#080aa8] hover:to-[#6d0668]'
                : 'opacity-50 pointer-events-none'}
            `}
        >
            Member List
        </Link>

        <button
            onClick={() => (window.location.href = '/configure-meeting-tools')}
            className="col-span-2 sm:col-span-1 max-w-xs mx-auto w-full inline-flex justify-center items-center px-4 py-2 text-sm font-semibold rounded-md transition-all
            bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white hover:from-[#080aa8] hover:to-[#6d0668]"
        >
            Meeting Platforms
        </button>
        </div>



    </div>
  );
}
