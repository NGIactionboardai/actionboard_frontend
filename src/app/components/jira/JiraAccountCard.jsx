import React from "react";
import { useSelector } from "react-redux";
import { Link2, Globe } from "lucide-react";

export default function JiraAccountCard({ onDisconnect, isJiraConnected }) {
  const siteName = useSelector((state) => state.jira.siteName);
  const siteUrl = useSelector((state) => state.jira.siteUrl);

  if (!isJiraConnected) return null;

  return (
    <div className="mt-8 sm:mt-10 px-4 sm:px-6">
      <div className="bg-blue-50 border border-blue-200 rounded-2xl shadow-md p-5 sm:p-6 md:p-8 max-w-4xl mx-auto">
        <h2 className="text-lg sm:text-xl font-semibold text-center text-blue-800 mb-5 sm:mb-6">
          Jira Account Details
        </h2>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 sm:gap-6">

          {/* Left Side */}
          <div className="space-y-4 text-sm sm:text-base text-blue-900 w-full md:w-auto">

            {/* Site Name */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-xs sm:text-sm">Workspace</p>
                <p className="text-xs sm:text-sm break-all">
                  {siteName || "—"}
                </p>
              </div>
            </div>

            {/* Site URL */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Link2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-xs sm:text-sm">Site URL</p>
                <p className="text-xs sm:text-sm break-all">
                  {siteUrl || "—"}
                </p>
              </div>
            </div>

          </div>

          {/* Right Side */}
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">

            {/* Primary - Manage Mapping */}
            <button
                onClick={() => window.location.href = '/integrations/jira'}
                className="w-full md:w-auto px-4 py-2 rounded-full text-white text-xs sm:text-sm font-medium shadow
                bg-gradient-to-r from-[#0A0DC4] to-[#8B0782]
                hover:from-[#080aa8] hover:to-[#6d0668]
                transition-all cursor-pointer"
            >
                Manage Mapping
            </button>

            {/* Secondary - Disconnect */}
            <button
                onClick={onDisconnect}
                className="w-full md:w-auto px-4 py-2 rounded-full text-white bg-red-500 hover:bg-red-600 text-xs sm:text-sm font-medium shadow cursor-pointer"
            >
                Disconnect
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}