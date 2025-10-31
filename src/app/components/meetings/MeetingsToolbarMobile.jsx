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
import { Video, MessageSquare, CalendarDays, Users, Settings } from "lucide-react";


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
      <div className="grid grid-cols-1 gap-3">
        {/* Create Meeting */}
        <button
          onClick={onCreateMeetingClick}
          disabled={!isZoomConnected}
          className={`w-full max-w-xs mx-auto inline-flex justify-center items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all
            bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white
            ${isZoomConnected
              ? 'hover:from-[#080aa8] hover:to-[#6d0668] cursor-pointer'
              : 'opacity-50 cursor-not-allowed'}
          `}
        >
          <Video className="w-4 h-4" />
          <span>Create Meeting</span>
        </button>

        {/* AI Assistant */}
        <button
          onClick={() => (window.location.href = `/org-ai-chat/${organizationId}`)}
          disabled={!isZoomConnected}
          className={`w-full max-w-xs mx-auto inline-flex justify-center items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all
            bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white
            ${isZoomConnected
              ? 'hover:from-[#080aa8] hover:to-[#6d0668] cursor-pointer'
              : 'opacity-50 cursor-not-allowed'}
          `}
        >
          <MessageSquare className="w-4 h-4" />
          <span>AI Assistant</span>
        </button>

        {/* Org Calendar */}
        <Link
          href={`/calendar/${organizationId}`}
          className={`w-full max-w-xs mx-auto inline-flex justify-center items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all
            bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white
            ${isZoomConnected
              ? 'hover:from-[#080aa8] hover:to-[#6d0668]'
              : 'opacity-50 pointer-events-none'}
          `}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Org Calendar</span>
        </Link>

        {/* Member List */}
        <Link
          href={`/member-list/${organizationId}`}
          className={`w-full max-w-xs mx-auto inline-flex justify-center items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all
            bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white
            ${isZoomConnected
              ? 'hover:from-[#080aa8] hover:to-[#6d0668]'
              : 'opacity-50 pointer-events-none'}
          `}
        >
          <Users className="w-4 h-4" />
          <span>Member List</span>
        </Link>

        {/* Meeting Platforms */}
        <button
          onClick={() => (window.location.href = '/configure-meeting-tools')}
          className="w-full max-w-xs mx-auto inline-flex justify-center items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all
            bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white hover:from-[#080aa8] hover:to-[#6d0668]"
        >
          <Settings className="w-4 h-4" />
          <span>Meeting Platforms</span>
        </button>
      </div>





    </div>
  );
}
