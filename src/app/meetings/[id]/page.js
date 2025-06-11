// pages/meetings/[id].js or app/meetings/[id]/page.js
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
import { formatMeetingDateTime, getMeetingStatus } from '../../utils/meetingsUtils';

export default function Meetings() {
  const params = useParams();
  const organizationId = params?.id;

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
    <div className="max-w-6xl mx-auto p-6">
      {/* Header Section */}
      <MeetingsHeader
        organizationId={organizationId}
        onZoomConnectionClick={handleZoomConnectionClick}
        onCreateMeetingClick={handleCreateMeetingClick}
      />

      {/* Alert Messages Section */}
      <AlertMessages
        successMessage={successMessage}
        error={zoomError}
        isZoomConnected={isZoomConnected}
        organizationId={organizationId}
        onZoomConnectionClick={handleZoomConnectionClick}
      />

      {/* Filters Section */}
      <MeetingsFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
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

      {/* Meetings List Section */}
      <MeetingsList
        filteredMeetings={filteredMeetings}
        loading={zoomLoading}
        isZoomConnected={isZoomConnected}
        organizationId={organizationId}
        onZoomConnectionClick={handleZoomConnectionClick}
        onCreateMeetingClick={handleCreateMeetingClick}
        clearFilters={clearFilters}
        formatMeetingDateTime={formatMeetingDateTime}
        getMeetingStatus={getMeetingStatus}
      />

      {/* Modals */}
      <CreateMeetingModal
        isOpen={isCreateMeetingModalOpen}
        onClose={() => setIsCreateMeetingModalOpen(false)}
        organizationId={organizationId}
        isZoomConnected={isZoomConnected}
      />

      <ZoomConnection
        isOpen={isZoomConnectionModalOpen}
        onClose={() => setIsZoomConnectionModalOpen(false)}
        organizationId={organizationId}
      />
    </div>
  );
}