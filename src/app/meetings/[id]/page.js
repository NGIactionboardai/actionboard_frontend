//  app/meetings/[id]/page.js
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

// Components
import MeetingsHeader from '../../components/meetings/MeetingsHeader';
import AlertMessages from '../../components/ui/AlertMessages';
import MeetingsFilters from '../../components/meetings/MeetingsFilters';
import MeetingsList from '../../components/meetings/MeetingsList';
import ZoomConnectionModal from '../../components/modals/ZoomConnectionModal';
import CreateMeetingModal from '../../components/CreateMeetingModal';
import ZoomConnection from '../../components/ZoomConnection';

// Hooks
import { useMeetings, useMeetingsFilters, useMeetingsModal } from '../../hooks/useMeetings';

// Utils
import { formatMeetingDateTime, getMeetingStatus, getTranscriptionStatus } from '../../utils/meetingsUtils';
import { getAuthHeaders, makeApiCall } from '@/app/utils/api';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import MeetingsSidebar from '@/app/components/meetings/MeetingsSidebar';
import SendInviteModal from '@/app/components/modals/SendInviteModal';
import InstructionModal from '@/app/components/meetings/InstructionModal';

export default function Meetings() {
  const params = useParams();
  const organizationId = params?.id;
  const [orgName, setOrgName] = useState('')
  const [members, setMembers] = useState([]);

  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [showRecordingInfoModal, setShowRecordingInfoModal] = useState(false);

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
          const res = await makeApiCall(`https://actionboard-ai-backend.onrender.com/api/organisations/${organizationId}/`, {
            method: 'GET',
            headers: getAuthHeaders(token)
          });
          const data = await res.json();
          setOrgName(data.name)
          console.log("Organization Data: ", )
          // or use saved map
        } catch {
          console.log("Failed to fetch organization details")
        }
      };
      fetchOrg();
    }, [organizationId]);

    useEffect(() => {
      const fetchMembers = async () => {
        
        if (!organizationId || !token) return;
        try {
          const headers = getAuthHeaders(token);
          const res = await makeApiCall(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/organisations/${organizationId}/members/`,
            { method: 'GET', headers }
          );
          const data = await res.json();
          setMembers(data.members || []);
        } catch (err) {
          console.error('Error fetching members', err);
        }
      };
    
      fetchMembers();
    }, [organizationId, token]);

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
    <div className="flex flex-col md:flex-row min-h-screen overflow-x-hidden">
      {/* Sidebar */}
      <aside className="hidden md:block w-64 shrink-0">
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
      <main className="flex-1 min-w-0 px-4 py-6 w-full max-w-[95%] md:max-w-4xl mx-auto">
        <MeetingsHeader
          organizationId={organizationId}
          orgName={orgName}
          onZoomConnectionClick={handleZoomConnectionClick}
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
              // Optional: show success toast or refetch meeting list
            }}
          />
        )}
      </main>
    </div>
  );
  
}