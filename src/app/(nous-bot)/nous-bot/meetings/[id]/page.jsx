"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Plus, Link2, Play, Square, Type, Building2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function BotMeetingsPage() {
  const { id: orgId } = useParams();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [orgName, setOrgName] = useState('Loading...');

  const ACTIVE_STATUSES = [
    "joining",
    "joined",
    "joined_recording",
    "joined_transcribing",
    "leaving",
  ];


  const [meetingName, setMeetingName] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [leavingBotId, setLeavingBotId] = useState(null);

  /* -----------------------------
   * Fetch bot meetings
   * ----------------------------- */
  const fetchMeetings = async () => {
    try {
      // setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/nous-bot-manager/bots/meetings/${orgId}/`
      );
      setMeetings(res.data.results || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load meetings");
    } finally {
      // setLoading(false);
    }
  };

  const fetchOrg = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/organisations/${orgId}/`);
      const data = res.data;
      setOrgName(data.name);
    } catch (err) {
      console.error('Error fetching organization:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (orgId) fetchMeetings();
    if (orgId) fetchOrg();
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    const hasActiveMeeting = meetings.some(
      (m) => ACTIVE_STATUSES.includes(m.latest_bot?.status)
    );
  
    if (!hasActiveMeeting) return;
  
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/nous-bot-manager/bots/meetings/${orgId}/`
        );
        setMeetings(res.data.results || []);
      } catch (err) {
        console.error("Polling meetings failed", err);
      }
    }, 3000);
  
    return () => clearInterval(interval);
  }, [meetings, orgId]);



  /* -----------------------------
   * Join bot
   * ----------------------------- */
  const handleJoin = async () => {
    if (!meetingName.trim() || !meetingUrl.trim()) {
      toast.error("Please provide meeting name and link");
      return;
    }

    try {
      setJoining(true);

      await axios.post(
        `${API_BASE_URL}/nous-bot-manager/bots/join/${orgId}/`,
        {
          meeting_name: meetingName.trim(),
          meeting_url: meetingUrl.trim(),
          platform: "zoom",
          bot_name: "Nous Bot",
        }
      );

      toast.success("Bot is joining the meeting");
      setMeetingName("");
      setMeetingUrl("");
      await fetchMeetings();
    } catch (err) {
      console.error(err);
      toast.error("Failed to join meeting");
    } finally {
      setJoining(false);
    }
  };

  /* -----------------------------
   * Leave bot
   * ----------------------------- */
  const handleLeave = async (botId) => {
    try {
      setLeavingBotId(botId);

      await axios.post(
        `${API_BASE_URL}/nous-bot-manager/bots/${botId}/leave/`
      );

      toast.success("Bot is leaving the meeting");
      await fetchMeetings();
    } catch (err) {
      console.error(err);
      toast.error("Failed to leave meeting");
    } finally {
      setLeavingBotId(null);
    }
  };

  const getBotStatus = (meeting) => meeting.latest_bot?.status ?? "idle";

  const getUiStatus = (meeting) => {
    const raw = meeting.latest_bot?.status ?? "idle";
  
    if (raw === "joining")
      return {
        label: "Joining",
        type: "joining",
        message: "Please wait a few seconds while the notetaker joins the meeting",
      };
  
    if (raw === "leaving")
      return {
        label: "Leaving",
        type: "leaving",
        message: "The notetaker is leaving the meeting",
      };
  
    if (raw === "ended")
      return { label: "Ended", type: "ended" };
  
    if (raw === "error")
      return { label: "Error", type: "error" };
  
    if (raw.startsWith("joined")) {
      if (raw.includes("recording"))
        return { label: "Joined • Recording", type: "joined" };
  
      if (raw.includes("transcribing"))
        return { label: "Joined • Transcribing", type: "joined" };
  
      return { label: "Joined", type: "joined" };
    }
  
    return { label: "Idle", type: "idle" };
  };
  
  // const status = getUiStatus(m);


  return (
    <div className="bg-gray-50 px-6 py-6 min-h-screen mt-20">
      <div className="max-w-5xl mx-auto">
        {/* Back to Meetings */}
        <div className="mb-4">
          <Link
            href={`/meetings/${orgId}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft size={16} />
            Back to Org Home
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6">
        {/* Organization */}
        <div className="flex items-center gap-2  text-gray-500 mb-1">
          <Building2 size={14} className="text-gray-400" />
          <span className="font-medium text-lg">{orgName}</span>
          <span className="opacity-60 text-sm">• {orgId}</span>
        </div>

      </div>

        {/* Join Meeting Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-10"
        >
          <h2 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
            <Link2 size={16} /> Join a meeting
          </h2>

          <div className="space-y-3">
            {/* Meeting Name */}
            <div className="relative">
              <Type
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Meeting name (required)"
                value={meetingName}
                onChange={(e) => setMeetingName(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-[#8B0782]/30"
              />
            </div>

            {/* Meeting URL */}
            <input
              type="text"
              placeholder="Paste Zoom meeting link"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-[#8B0782]/30"
            />

            <button
              onClick={handleJoin}
              disabled={joining}
              className="w-full md:w-auto bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
            >
              <Plus size={16} />
              {joining ? "Joining..." : "Join meeting"}
            </button>
          </div>
        </motion.div>

        {/* Meetings List */}
        <div className="space-y-4">
          {loading && (
            <p className="text-sm text-gray-500">Loading meetings...</p>
          )}

          {meetings.map((m, idx) => {
            const status = getUiStatus(m);

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between"
              >
                <div className="max-w-[65%]">
                  <p className="font-medium text-gray-800 truncate">
                    {m.name || "Untitled meeting"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(m.created_at).toLocaleString()}
                  </p>
                  {status.message && (
                    <p className="text-xs text-gray-500 mt-1">
                      {status.message}
                      {status.type === "joining" && (
                        <span className="ml-1 animate-pulse">•••</span>
                      )}
                    </p>
                  )}
                </div>
                

                <div className="flex items-center gap-4">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full border ${
                    status.type === "joining"
                      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                      : status.type === "leaving"
                      ? "bg-orange-50 text-orange-700 border-orange-200"
                      : status.type === "ended"
                      ? "bg-gray-100 text-gray-600"
                      : status.type === "error"
                      ? "bg-red-50 text-red-600 border-red-200"
                      : status.type === "joined"
                      ? "bg-green-50 text-green-600 border-green-200"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {status.label}
                </span>

                {/* <button
                  onClick={() => handleLeave(m.latest_bot.id)}
                  disabled={leavingBotId === m.latest_bot.id}
                  className="flex items-center gap-1.5 text-sm text-red-600 hover:underline disabled:opacity-50"
                >
                  <Square size={14} />
                  {leavingBotId === m.latest_bot.id
                    ? "Leaving..."
                    : "Leave"}
                </button>

                <button className="flex items-center gap-1.5 text-sm text-[#8B0782] hover:underline">
                  <Play size={14} /> View
                </button> */}



                {status.type === "joined" && (
                    <>
                      <button
                        onClick={() => handleLeave(m.latest_bot.id)}
                        disabled={leavingBotId === m.latest_bot.id}
                        className="flex items-center gap-1.5 text-sm text-red-600 hover:underline disabled:opacity-50"
                      >
                        <Square size={14} />
                        {leavingBotId === m.latest_bot.id ? "Leaving..." : "Leave"}
                      </button>

                      <Link
                        href={`/nous-bot/meeting/${m.id}/${orgId}`}
                        className="flex items-center gap-1.5 text-sm text-[#8B0782] hover:underline"
                      >
                        <Play size={14} /> View
                      </Link>
                    </>
                  )}

                  {status.type === "ended" && (
                    <Link
                      href={`/nous-bot/meeting/${m.id}/${orgId}`}
                      className="flex items-center gap-1.5 text-sm text-[#8B0782] hover:underline"
                    >
                      <Play size={14} /> View
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
