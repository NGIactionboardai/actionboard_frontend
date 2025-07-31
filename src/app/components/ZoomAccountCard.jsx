import React from "react";
import { useSelector } from "react-redux";
import { User2, Mail, KeySquare } from "lucide-react";

export default function ZoomAccountCard({ onDisconnect, isZoomConnected }) {
  const zoomUserInfo = useSelector((state) => state.zoom.userInfo);

  if (!isZoomConnected || !zoomUserInfo) return null;

  return (
    <div className="mt-10 px-6">
      <div className="bg-blue-50 border border-blue-200 rounded-2xl shadow-md p-6 md:p-8 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-center text-blue-800 mb-6">
          Zoom Account Details
        </h2>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Left side - Zoom user details */}
          <div className="space-y-4 text-sm text-blue-900">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">Email</p>
                <p className="text-xs">{zoomUserInfo?.email || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">Zoom User ID</p>
                <p className="text-xs break-all">{zoomUserInfo?.zoom_user_id || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <KeySquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">Account ID</p>
                <p className="text-xs break-all">{zoomUserInfo?.account_id || "—"}</p>
              </div>
            </div>
          </div>

          {/* Right side - Disconnect Button */}
          <div className="self-start md:self-center">
            <button
              onClick={onDisconnect}
              className="px-5 py-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 text-sm font-medium shadow cursor-pointer"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
