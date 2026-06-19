import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTeamsStatus,
  selectTeamsIsConnected,
  selectTeamsEmail,
  selectTeamsName,
} from "@/redux/integrations/teamsSlice";

export const TeamsConnectionStatus = ({ showDetails = false }) => {
  const dispatch = useDispatch();

  const isConnected = useSelector(selectTeamsIsConnected);
  const email = useSelector(selectTeamsEmail);
  const name = useSelector(selectTeamsName);

  useEffect(() => {
    dispatch(fetchTeamsStatus());
  }, [dispatch]);

  return (
    <div className="flex items-center space-x-2">
      <div
        className={`w-2 h-2 rounded-full ${
          isConnected ? "bg-green-400" : "bg-gray-400"
        }`}
      />
      <span className="text-sm text-gray-600">
        {isConnected ? "Connected to Teams" : "Not Connected"}
      </span>
      {showDetails && isConnected && (
        <span className="text-xs text-gray-500">
          ({email || name || "Teams User"})
        </span>
      )}
    </div>
  );
};
