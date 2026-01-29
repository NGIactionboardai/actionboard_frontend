"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Mic, Loader2, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LiveTranscriptionPanel({ botId, botStatus, onLeave, meeting, orgName, orgId }) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [utterances, setUtterances] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const bottomRef = useRef(null);

  /* --------------------------------
   * Poll transcript endpoint
   * -------------------------------- */
  useEffect(() => {
    if (!botId) return;
    if (botStatus === "ended") return;
  
    let intervalId;
  
    const fetchTranscript = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/nous-bot-manager/bots/${botId}/transcript/`
        );
  
        if (Array.isArray(res.data)) {
          setUtterances(res.data);
        }
      } catch (err) {
        console.error("Transcript polling failed", err);
      } finally {
        setIsFetching(false);
      }
    };
  
    fetchTranscript();
    intervalId = setInterval(fetchTranscript, 1000);
  
    return () => clearInterval(intervalId);
  }, [botId, botStatus]);

  /* Auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [utterances]);

  const hasTranscript = utterances.length > 0;

  return (
    <div className="bg-white border mt-20 border-gray-200 rounded-2xl shadow-sm p-6 min-h-[300px] flex flex-col">
      {/* Meeting Header */}
      <div className="mb-6">
        {/* Organization */}
        <div className="flex items-center gap-2 text-gray-500 mb-1">
          <Building2 size={14} className="text-gray-400" />
          <span className="font-medium text-lg">{orgName}</span>
          <span className="opacity-60 text-sm">• {orgId}</span>
        </div>

        {/* Meeting name */}
        <h1 className="text-lg font-semibold text-gray-900 leading-tight">
          {meeting?.name || "Live Meeting"}
        </h1>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Mic className="text-[#8B0782]" size={18} />
          <h2 className="font-semibold text-gray-800 text-sm">
            Live Transcription
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-green-600">
            <Loader2 className="animate-spin" size={14} />
            Recording & transcribing
          </div>

          <button
            onClick={onLeave}
            className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition cursor-pointer"
          >
            Leave
          </button>
        </div>
      </div>

      {/* EMPTY STATE */}
      {!hasTranscript && !isFetching && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col items-center justify-center text-center text-gray-500"
        >
          <Mic size={28} className="mb-3 opacity-60" />
          <p className="text-sm font-medium">
            No transcripts yet
          </p>
          <p className="text-xs mt-1">
            Live transcription will appear as soon as someone speaks
          </p>
        </motion.div>
      )}

      {/* LOADING STATE */}
      {isFetching && (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm">
          <Loader2 className="animate-spin mb-2" size={18} />
          Connecting to live transcription…
        </div>
      )}

      {botStatus === "ended" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex items-center justify-center text-sm text-gray-500"
        >
          Meeting ended. Preparing summary…
        </motion.div>
      )}

      {/* TRANSCRIPT STREAM */}
      {hasTranscript && (
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
          <AnimatePresence>
            {utterances.map((u, idx) => (
              <motion.div
                key={`${u.timestamp_ms}-${idx}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="flex gap-3"
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                  {u.speaker_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                {/* Text */}
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {u.speaker_name}
                  </p>
                  <p className="text-sm text-gray-700 mt-0.5 leading-relaxed">
                    {u.transcription?.transcript}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
