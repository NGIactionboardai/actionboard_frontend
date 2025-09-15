'use client';

import Link from 'next/link';

const MeetingsHeader = ({ organizationId, orgName }) => {
  return (
    <div className="container mx-auto px-4 mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6 flex-wrap">
        {/* Left side: Title and ID */}
        <div className="flex-1 min-w-0">
          {/* Optional Back Link (uncomment if needed) */}
          {/*
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 mb-2"
          >
            <svg
              className="mr-1 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Back to Organizations
          </Link>
          */}

          <div className="mt-1 space-y-1">
            {!orgName ? (
              <>
                <div className="h-7 w-64 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
              </>
            ) : (
              <>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug max-w-full truncate sm:truncate">
                  <span className="bg-gradient-to-r from-[#0A0DC4] via-[#5A0DB4] to-[#8B0782] bg-clip-text text-transparent">
                    Welcome to {orgName}
                  </span>
                </h2>
                <p className="text-sm text-gray-500 break-words">
                  Organization ID: {organizationId}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingsHeader;
