//  app/meetings/[id]/page.js
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import axios from 'axios';


// Components
import MeetingsHeader from '../../../components/meetings/MeetingsHeader';
import AlertMessages from '../../../components/ui/AlertMessages';
import MeetingsFilters from '../../../components/meetings/MeetingsFilters';
import MeetingsList from '../../../components/meetings/MeetingsList';
import ZoomConnectionModal from '../../../components/modals/ZoomConnectionModal';
import CreateMeetingModal from '../../../components/CreateMeetingModal';
import ZoomConnection from '../../../components/ZoomConnection';

// Hooks
import { useMeetings, useMeetingsFilters, useMeetingsModal } from '../../../hooks/useMeetings';

// Utils
import { formatMeetingDateTime, getMeetingStatus, getTranscriptionStatus } from '../../../utils/meetingsUtils';
import { getAuthHeaders, makeApiCall } from '@/app/utils/api';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import MeetingsSidebar from '@/app/components/meetings/MeetingsSidebar';
import SendInviteModal from '@/app/components/modals/SendInviteModal';
import InstructionModal from '@/app/components/meetings/InstructionModal';
import JoinBtnInstructionModal from '@/app/components/meetings/JoinBtnInstructionModal';
import { selectZoomUserInfo } from '@/redux/auth/zoomSlice';
import { Plus, SlidersHorizontal, X } from 'lucide-react';
import MeetingsToolbarMobile from '@/app/components/meetings/MeetingsToolbarMobile';
import DeleteMeetingModal from '@/app/components/meetings/DeleteMeetingModal';

export default function Meetings() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const params = useParams();
  const organizationId = params?.id;
  const [orgName, setOrgName] = useState('')
  const [members, setMembers] = useState([]);

  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isJoinBtnInstructionModalOpen, setIsJoinBtnInstructionModalOpen] = useState(false);
  const [showRecordingInfoModal, setShowRecordingInfoModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  


  // Custom hooks for state management
  const {
    zoomMeetings,
    zoomLoading,
    zoomError,
    isZoomConnected,
    successMessage
  } = useMeetings(organizationId);

  const {
    searchTerm,
    setSearchTerm,
    sourceFilter,
    setSourceFilter,
    statusFilter,
    setStatusFilter,
    dateFilter,
    handleDateFilterChange,
    clearFilters,
    uniqueSources,
    uniqueStatuses,
    filteredMeetings
  } = useMeetingsFilters(zoomMeetings);

  const {
    isCreateMeetingModalOpen,
    setIsCreateMeetingModalOpen,
    isZoomConnectionModalOpen,
    setIsZoomConnectionModalOpen,
    handleZoomConnectionClick,
    handleCreateMeetingClick
  } = useMeetingsModal(successMessage);

  const token = useSelector((state) => state.auth?.token);

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/organisations/${organizationId}/`);
        setOrgName(res.data.name);
        console.log("Organization Data:", res.data);
      } catch (error) {
        console.log("Failed to fetch organization details", error);
      }
    };
  
    if (organizationId) {
      fetchOrg();
    }
  }, [organizationId]);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!organizationId) return;  // token handled globally by interceptor
  
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/organisations/${organizationId}/members/`);
        setMembers(res.data.members || []);
      } catch (err) {
        console.error('Error fetching members', err);
      }
    };
  
    fetchMembers();
  }, [organizationId]);

  // If organization ID is not found, show message
  if (!organizationId) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Invalid Organization</h2>
          <p className="mt-2 text-gray-600">Organization ID is required to view meetings.</p>
          <Link 
            href="/"
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Organizations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Mobile Sidebar */}
      <div className={`fixed top-20 bottom-0 left-0 w-72 bg-white shadow-lg transform transition-transform duration-300 z-50 xl:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <MeetingsSidebar
          currentOrgId={organizationId}
          organizationId={organizationId}
          onZoomConnectionClick={handleZoomConnectionClick}
          onCreateMeetingClick={handleCreateMeetingClick}
          isZoomConnected={isZoomConnected}
          orgName={orgName}
        />
      </div>

      {/* Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.3)] transition-opacity z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden xl:block w-64 shrink-0 bg-white shadow-lg">
        <MeetingsSidebar
          currentOrgId={organizationId}
          organizationId={organizationId}
          onZoomConnectionClick={handleZoomConnectionClick}
          onCreateMeetingClick={handleCreateMeetingClick}
          isZoomConnected={isZoomConnected}
          orgName={orgName}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 w-full max-w-[95%] md:max-w-4xl mx-auto">
        {/* Header with hamburger on mobile */}
        <div className="flex items-center justify-between md:justify-start mb-4">

        {/* <button
          onClick={() => setIsSidebarOpen(prev => !prev)}
          className="xl:hidden fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-4 py-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isSidebarOpen ? (
            <>
              <X className="w-5 h-5" />
              <span className="text-sm font-medium">Close</span>
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              <span className="text-sm font-medium">Create Meeting</span>
            </>
          )}
        </button> */}


          <MeetingsHeader
            organizationId={organizationId}
            orgName={orgName}
            onZoomConnectionClick={handleZoomConnectionClick}
            onCreateMeetingClick={handleCreateMeetingClick}
          />

          
        </div>
          <MeetingsToolbarMobile
              organizationId={organizationId}
              onCreateMeetingClick={handleCreateMeetingClick}
          />

        <AlertMessages
          successMessage={successMessage}
          error={zoomError}
          isZoomConnected={isZoomConnected}
          organizationId={organizationId}
          onZoomConnectionClick={handleZoomConnectionClick}
        />
  
        <MeetingsFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          loading={zoomLoading}
          sourceFilter={sourceFilter}
          setSourceFilter={setSourceFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateFilter={dateFilter}
          handleDateFilterChange={handleDateFilterChange}
          clearFilters={clearFilters}
          uniqueSources={uniqueSources}
          uniqueStatuses={uniqueStatuses}
        />
  
        <MeetingsList
          filteredMeetings={filteredMeetings}
          loading={zoomLoading}
          isZoomConnected={isZoomConnected}
          orgName={orgName}
          organizationId={organizationId}
          onZoomConnectionClick={handleZoomConnectionClick}
          onCreateMeetingClick={handleCreateMeetingClick}
          clearFilters={clearFilters}
          formatMeetingDateTime={formatMeetingDateTime}
          getMeetingStatus={getMeetingStatus}
          getTranscriptionStatus={getTranscriptionStatus}
          onShareClick={(meeting) => {
            setSelectedMeeting(meeting);
            setIsInviteModalOpen(true);
          }}
          onJoinClick={(meeting) => {
            setSelectedMeeting(meeting);
            setIsJoinBtnInstructionModalOpen(true);
          }}
          onDeleteClick={(meeting) => {
            setSelectedMeeting(meeting);
            setIsDeleteModalOpen(true);
          }}
        />
  
        {/* Modals */}
        <CreateMeetingModal
          isOpen={isCreateMeetingModalOpen}
          onClose={() => setIsCreateMeetingModalOpen(false)}
          organizationId={organizationId}
          isZoomConnected={isZoomConnected}
          setShowRecordingInfoModal={setShowRecordingInfoModal}
        />

        <InstructionModal
          isOpen={showRecordingInfoModal}
          onClose={() => setShowRecordingInfoModal(false)}
        />
  
        <ZoomConnection
          isOpen={isZoomConnectionModalOpen}
          onClose={() => setIsZoomConnectionModalOpen(false)}
          organizationId={organizationId}
        />
  
        {selectedMeeting && (
          <SendInviteModal
            isOpen={isInviteModalOpen}
            onClose={() => setIsInviteModalOpen(false)}
            meeting={selectedMeeting}
            orgId={organizationId}
            members={members}
            onSuccess={() => {
              setIsInviteModalOpen(false);
            }}
          />
        )}

        {selectedMeeting && (
          <JoinBtnInstructionModal
            isOpen={isJoinBtnInstructionModalOpen}
            onClose={() => setIsJoinBtnInstructionModalOpen(false)}
            meeting={selectedMeeting}
          />
        )}

        {selectedMeeting && (
          <DeleteMeetingModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            meeting={selectedMeeting}
          />
        )}
      </main>
    </div>
  );
  
}