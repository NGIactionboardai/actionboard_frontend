'use client';

import Link from 'next/link';

const MeetingsHeader = ({ organizationId, orgName }) => {

  return (
    <div className="md:flex md:items-center md:justify-between mb-8">
      <div className="flex-1 min-w-0">
        {/* Back to organizations link */}
        {/* <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          <svg className="mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Back to Organizations
        </Link> */}

        {/* Org title and ID */}
        <div className="mt-2">
          {!orgName ? (
            <>
              <div className="h-7 w-64 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold leading-7 pb-1 text-gray-900 sm:text-3xl sm:truncate">
                Welcome to {orgName}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Organization ID: {organizationId}
              </p>
            </>
          )}
        </div>

        {/* Welcome message */}
        {/* <p className="mt-4 text-base text-gray-700">
          Welcome to the <span className="font-semibold">{orgName}</span> meetings dashboard. Use the sidebar to manage Zoom, create meetings, and explore the organization calendar.
        </p> */}
      </div>
    </div>
  );
};

export default MeetingsHeader;