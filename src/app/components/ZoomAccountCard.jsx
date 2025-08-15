import React from "react";
import { useSelector } from "react-redux";
import { User2, Mail, KeySquare } from "lucide-react";

export default function ZoomAccountCard({ onDisconnect, isZoomConnected }) {
  const zoomUserInfo = useSelector((state) => state.zoom.userInfo);

  if (!isZoomConnected || !zoomUserInfo) return null;

  return (
    <div className="mt-8 sm:mt-10 px-4 sm:px-6">
      <div className="bg-blue-50 border border-blue-200 rounded-2xl shadow-md p-5 sm:p-6 md:p-8 max-w-4xl mx-auto">
        <h2 className="text-lg sm:text-xl font-semibold text-center text-blue-800 mb-5 sm:mb-6">
          Zoom Account Details
        </h2>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 sm:gap-6">
          {/* Left side - Zoom user details */}
          <div className="space-y-4 text-sm sm:text-base text-blue-900 w-full md:w-auto">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-xs sm:text-sm">Email</p>
                <p className="text-xs sm:text-sm break-all">{zoomUserInfo?.email || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-xs sm:text-sm">Zoom User ID</p>
                <p className="text-xs sm:text-sm break-all">{zoomUserInfo?.zoom_user_id || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <KeySquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-xs sm:text-sm">Account ID</p>
                <p className="text-xs sm:text-sm break-all">{zoomUserInfo?.account_id || "—"}</p>
              </div>
            </div>
          </div>

          {/* Right side - Disconnect Button */}
          <div className="self-start md:self-center w-full md:w-auto">
            <button
              onClick={onDisconnect}
              className="w-full md:w-auto px-4 py-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm font-medium shadow cursor-pointer"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
