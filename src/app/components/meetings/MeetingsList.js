// components/meetings/MeetingsList.js
'use client';

import Link from 'next/link';

const MeetingsList = ({ 
  filteredMeetings, 
  loading, 
  isZoomConnected, 
  organizationId,
  orgName,
  onZoomConnectionClick,
  onCreateMeetingClick,
  clearFilters,
  formatMeetingDateTime,
  getMeetingStatus,
  getTranscriptionStatus,
  onShareClick,
}) => {

  
  if (loading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="border-t border-gray-200">
          <ul className="px-4 py-4 space-y-4">
            {[...Array(3)].map((_, index) => (
              <li
                key={index}
                className="mb-4 bg-gray-100 p-4 rounded-lg border border-gray-300 animate-pulse"
              >
                <div className="flex justify-between items-start">
                  {/* LEFT */}
                  <div className="flex flex-col space-y-3 w-full">
                    <div className="h-4 w-1/3 bg-gray-300 rounded" />
                    <div className="h-3 w-1/2 bg-gray-200 rounded" />
                    
                    <div className="flex space-x-2">
                      <div className="h-5 w-24 bg-gray-300 rounded-full" />
                      <div className="h-5 w-32 bg-gray-200 rounded-full" />
                    </div>
                    
                    <div className="h-3 w-3/4 bg-gray-300 rounded" />
                  </div>
    
                  {/* RIGHT */}
                  <div className="flex flex-col items-center justify-center space-y-2 ml-4">
                    <div className="h-8 w-28 bg-gray-300 rounded-full" />
                    <div className="h-8 w-28 bg-gray-200 rounded-full" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
    
  }

  if (filteredMeetings.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="border-t border-gray-200">
          <div className="py-12">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {!isZoomConnected ? 'Connect to Zoom to see meetings' : 'No meetings found'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {!isZoomConnected 
                  ? `You need to connect your Zoom account to create and view meetings for organization ${orgName}.`
                  : 'Try adjusting your filters or create a new meeting.'}
              </p>
              {/* <div className="mt-6">
                {!isZoomConnected ? (
                  <button
                    onClick={onZoomConnectionClick}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Connect to Zoom
                  </button>
                ) : (
                  <>
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Clear Filters
                    </button>
                    <button
                      onClick={onCreateMeetingClick}
                      className="ml-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Create Meeting
                    </button>
                  </>
                )}
              </div> */}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="border-t border-gray-200">

      <ul className="px-4 py-4">
        {filteredMeetings.map((meeting) => {
          const status = getMeetingStatus(meeting);
          const transcriptStatus = getTranscriptionStatus(meeting);

          const transcriptLabel = (() => {
            if (transcriptStatus === 'completed') return 'Transcribed';
            if (transcriptStatus === 'pending' || transcriptStatus === 'processing') return 'Processing';
            if (transcriptStatus === 'not_found') return 'Not Transcribed';
            return 'Unknown';
          })();

          const transcriptBadgeClass = (() => {
            if (transcriptLabel === 'Transcribed') return 'bg-green-100 text-green-800';
            if (transcriptLabel === 'Processing') return 'bg-yellow-100 text-yellow-800';
            if (transcriptLabel === 'Not Transcribed') return 'bg-gray-100 text-gray-800';
            return 'bg-red-100 text-red-800';
          })();

          return (
            <li
              key={meeting.id}
              className="mb-4 bg-white hover:bg-gray-50 p-4 rounded-lg border border-gray-500 hover:shadow-md transition cursor-pointer"
            >
              <Link href={`/meeting/${meeting.meeting_id || meeting.id}`} className="block">
                <div className="flex justify-between items-start">
                  {/* LEFT: Meeting Info */}
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-indigo-600 truncate">{meeting.topic}</p>
                    {/* <p className="text-sm text-gray-500">Meeting ID: {meeting.id}</p> */}
                    <p className="text-sm text-gray-500">
                      {formatMeetingDateTime(meeting.start_time)} • {meeting.duration || 'N/A'} min
                    </p>

                    {/* Status Section (Stacked) */}
                    <div className="mt-2 space-y-1">
                      {/* Meeting Status */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900">Meeting Status:</span>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            status === 'started' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>

                      {/* Transcription Status */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900">Transcription Status:</span>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${transcriptBadgeClass}`}>
                          {transcriptLabel}
                        </span>
                      </div>
                    </div>

                    {/* Agenda */}
                    {/* {meeting.agenda && (
                      <p className="text-sm text-gray-600 mt-1">{meeting.agenda}</p>
                    )} */}
                  </div>

                  {/* RIGHT: Action Buttons */}
                  <div className="flex flex-col items-center justify-center space-y-2 ml-4">
                    {meeting.join_url && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.open(meeting.join_url, '_blank', 'noopener,noreferrer');
                        }}
                        className="min-w-[140px] px-6 py-2 text-sm font-semibold rounded-full border border-black text-black bg-[#f9f1fc] hover:bg-[#f0e6f7] transition"
                      >
                        Join
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onShareClick(meeting); // 👈 Pass meeting to modal trigger
                      }}
                      className="min-w-[140px] px-6 py-2 text-sm font-semibold rounded-full border border-black text-black bg-blue-100 hover:bg-blue-200 transition"
                    >
                      Invite
                    </button>
                  </div>


                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      </div>
    </div>
  );
};

export default MeetingsList;