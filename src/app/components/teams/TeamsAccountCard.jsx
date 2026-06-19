import React from "react";
import { useSelector } from "react-redux";
import { User2, Mail } from "lucide-react";

export default function TeamsAccountCard({ onDisconnect, isTeamsConnected }) {
  const teamsEmail = useSelector((state) => state.teams.email);
  const teamsName = useSelector((state) => state.teams.name);

  if (!isTeamsConnected) return null;

  return (
    <div className="mt-8 sm:mt-10 px-4 sm:px-6">
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl shadow-md p-5 sm:p-6 md:p-8 max-w-4xl mx-auto">
        <h2 className="text-lg sm:text-xl font-semibold text-center text-indigo-800 mb-5 sm:mb-6">
          Microsoft Teams Account Details
        </h2>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 sm:gap-6">

          {/* Left Side */}
          <div className="space-y-4 text-sm sm:text-base text-indigo-900 w-full md:w-auto">

            {/* Email */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-xs sm:text-sm">Email</p>
                <p className="text-xs sm:text-sm break-all">{teamsEmail || "—"}</p>
              </div>
            </div>

            {/* Name */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User2 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-xs sm:text-sm">Name</p>
                <p className="text-xs sm:text-sm break-all">{teamsName || "—"}</p>
              </div>
            </div>

          </div>

          {/* Right Side - Disconnect */}
          <div className="self-start md:self-center w-full md:w-auto">
            <button
              onClick={onDisconnect}
              className="w-full md:w-auto px-4 py-2 rounded-full text-white bg-indigo-600 hover:bg-indigo-700 text-xs sm:text-sm font-medium shadow cursor-pointer"
            >
              Disconnect
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
