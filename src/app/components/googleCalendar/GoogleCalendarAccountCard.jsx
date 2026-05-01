import React from "react";
import { useSelector } from "react-redux";
import { User2, Mail, CalendarDays } from "lucide-react";

export default function GoogleCalendarAccountCard({ onDisconnect, isGoogleConnected }) {
  const googleEmail = useSelector((state) => state.googleCalendar.email);
  const googleName = useSelector((state) => state.googleCalendar.name);
  const lastSyncedAt = useSelector((state) => state.googleCalendar.lastSyncedAt);

  if (!isGoogleConnected) return null;

  return (
    <div className="mt-8 sm:mt-10 px-4 sm:px-6">
      <div className="bg-green-50 border border-green-200 rounded-2xl shadow-md p-5 sm:p-6 md:p-8 max-w-4xl mx-auto">
        <h2 className="text-lg sm:text-xl font-semibold text-center text-green-800 mb-5 sm:mb-6">
          Google Calendar Account Details
        </h2>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 sm:gap-6">

          {/* Left Side */}
          <div className="space-y-4 text-sm sm:text-base text-green-900 w-full md:w-auto">

            {/* Email */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-xs sm:text-sm">Email</p>
                <p className="text-xs sm:text-sm break-all">{googleEmail || "—"}</p>
              </div>
            </div>

            {/* Name */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-xs sm:text-sm">Name</p>
                <p className="text-xs sm:text-sm break-all">{googleName || "—"}</p>
              </div>
            </div>

            {/* Last Synced */}
            {/* <div className="flex items-start gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-xs sm:text-sm">Last Synced</p>
                <p className="text-xs sm:text-sm break-all">
                  {lastSyncedAt
                    ? new Date(lastSyncedAt).toLocaleString()
                    : "Not synced yet"}
                </p>
              </div>
            </div> */}

          </div>

          {/* Right Side - Disconnect */}
          <div className="self-start md:self-center w-full md:w-auto">
            <button
              onClick={onDisconnect}
              className="w-full md:w-auto px-4 py-2 rounded-full text-white bg-green-600 hover:bg-green-700 text-xs sm:text-sm font-medium shadow cursor-pointer"
            >
              Disconnect
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}