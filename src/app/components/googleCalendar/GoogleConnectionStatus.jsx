import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchGoogleStatus,
  selectGoogleIsConnected,
  selectGoogleEmail,
  selectGoogleName,
} from "@/redux/integrations/googleCalendarSlice";

export const GoogleConnectionStatus = ({ showDetails = false }) => {
  const dispatch = useDispatch();

  const isConnected = useSelector(selectGoogleIsConnected);
  const email = useSelector(selectGoogleEmail);
  const name = useSelector(selectGoogleName);

  useEffect(() => {
    dispatch(fetchGoogleStatus());
  }, [dispatch]);

  return (
    <div className="flex items-center space-x-2">
      
      {/* Status Dot */}
      <div
        className={`w-2 h-2 rounded-full ${
          isConnected ? "bg-green-400" : "bg-gray-400"
        }`}
      />

      {/* Status Text */}
      <span className="text-sm text-gray-600">
        {isConnected ? "Connected to Google" : "Not Connected"}
      </span>

      {/* Optional Details */}
      {showDetails && isConnected && (
        <span className="text-xs text-gray-500">
          ({email || name || "Google User"})
        </span>
      )}
    </div>
  );
};