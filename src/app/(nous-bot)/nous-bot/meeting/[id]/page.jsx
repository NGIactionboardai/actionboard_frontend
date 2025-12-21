"use client";

import { useState, useEffect, useRef } from "react";
import { FileText, LayoutGrid, Edit3, Save, User, Video, CheckSquare, Square, Building2 } from "lucide-react";
import { useParams } from "next/navigation";
import axios from "axios";
import LiveTranscriptionPanel from "@/app/components/bots/LiveTranscriptionPanel";
import { buildWordTimeline } from "@/app/utils/buildWordTimeline";
// import LiveTranscriptionPanel from "@/components/nous-bot/LiveTranscriptionPanel";


// MOCK SUMMARY TEMPLATES
const SUMMARY_TEMPLATES = [
  {
    id: "general",
    label: "General Summary",
    description: "Overall discussion, key points, and outcomes",
    content: `This meeting focused on the current progress of the Nous Meeting platform.

Key highlights included updates on the AI bot integration, discussion around UI consistency across modules, and planning the next development milestones.`,
  },
  {
    id: "action",
    label: "Action Items",
    description: "Decisions and next steps",
    content: [
      { id: 1, text: "Finalize bot UI for client review", done: false },
      { id: 2, text: "Gather feedback on transcript editing UX", done: false },
      { id: 3, text: "Prepare backend endpoints for meeting notes", done: false },
    ],
  },
];


// MOCK TRANSCRIPT DATA
const MOCK_UTTERANCES = [
  {
    id: 1,
    speaker: "Johurul Hassan",
    text: "Let’s start by reviewing where we are with the bot integration.",
    time: "00:01:12"
  },
  {
    id: 2,
    speaker: "Alex Brown",
    text: "The UI is mostly ready, but we still need client feedback.",
    time: "00:02:03"
  },
  {
    id: 3,
    speaker: "Johurul Hassan",
    text: "Agreed. That’s why we’re prioritizing mockups before backend work.",
    time: "00:02:45"
  }
];


/* ---------------- HELPERS ---------------- */

function useDebouncedAutosave(value, label) {
  const timeoutRef = useRef(null);

  useEffect(() => {
    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      console.log(`🔄 Autosaving ${label}:`, value);
      // 🔗 Replace with API call later
    }, 800);

    return () => clearTimeout(timeoutRef.current);
  }, [value, label]);
}

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function MeetingNotesPage() {
  const { id: meetingId } = useParams();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [meeting, setMeeting] = useState(null);
  const [loadingMeeting, setLoadingMeeting] = useState(true);


  const [activeTab, setActiveTab] = useState("summary");
  const [activeTemplate, setActiveTemplate] = useState("general");
  const [isEditing, setIsEditing] = useState(false);
  const [utterances, setUtterances] = useState(MOCK_UTTERANCES);

  const [botTranscript, setBotTranscript] = useState([]);
  const [recording, setRecording] = useState(null);
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [wordTimeline, setWordTimeline] = useState([]);
  const [activeWordIndex, setActiveWordIndex] = useState(null);

  const [isEditingSummary, setIsEditingSummary] = useState(false);

  const [generalSummary, setGeneralSummary] = useState(
    SUMMARY_TEMPLATES[0].content
  );

  useEffect(() => {
    const fetchMeetingDetails = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/nous-bot-manager/bots/bot-meeting/details/${meetingId}/`
        );
        setMeeting(res.data);
      } catch (err) {
        console.error("Failed to fetch meeting details", err);
      } finally {
        setLoadingMeeting(false);
      }
    };
  
    if (meetingId) fetchMeetingDetails();
  }, [meetingId]);

  const latestBot = meeting?.latest_bot;
  const summaryStatus = meeting?.summary_status;
  const summaryData = meeting?.summary;
  const apiActionItems = meeting?.action_items || [];

  useEffect(() => {
    if (!latestBot?.id) return;
  
    if (!latestBot.status?.startsWith("joined")) return;
  
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/nous-bot-manager/bots/bot-meeting/details/${meetingId}/`
        );
        setMeeting(res.data);
      } catch (err) {
        console.error("Polling meeting status failed", err);
      }
    }, 3000);
  
    return () => clearInterval(interval);
  }, [latestBot?.id, latestBot?.status, meetingId]);

  
  

  const isLiveMeeting =
    latestBot?.status?.startsWith("joined");

  const isEndedMeeting =
  !latestBot || latestBot.status === "ended";

  useEffect(() => {
    if (activeTab !== "transcript") return;
    if (!latestBot?.id) return;
  
    const fetchTranscriptAndRecording = async () => {
      try {
        setLoadingTranscript(true);
  
        const [transcriptRes, recordingRes] = await Promise.all([
          axios.get(
            `${API_BASE_URL}/nous-bot-manager/bots/${latestBot.id}/transcript/`
          ),
          axios.get(
            `${API_BASE_URL}/nous-bot-manager/bots/${latestBot.id}/recording/`
          ),
        ]);
  
        setBotTranscript(transcriptRes.data);
        setRecording(recordingRes.data);
  
        const timeline = buildWordTimeline(
          transcriptRes.data,
          recordingRes.data.start_timestamp_ms
        );
  
        setWordTimeline(timeline);
      } catch (err) {
        console.error("Failed to load transcript or recording", err);
      } finally {
        setLoadingTranscript(false);
      }
    };
  
    fetchTranscriptAndRecording();
  }, [activeTab, latestBot?.id]);

  useEffect(() => {
    if (!recording || wordTimeline.length === 0) return;
  
    const video = document.getElementById("meeting-recording");
    if (!video) return;
  
    const onTimeUpdate = () => {
      const t = video.currentTime;
  
      // binary search would be ideal later — linear is fine for now
      const idx = wordTimeline.findIndex(
        (w) => t >= w.start && t < w.end
      );
  
      setActiveWordIndex(idx !== -1 ? idx : null);
    };
  
    video.addEventListener("timeupdate", onTimeUpdate);
    return () => video.removeEventListener("timeupdate", onTimeUpdate);
  }, [recording, wordTimeline]);


  const [actionItems, setActionItems] = useState(
    Array.isArray(SUMMARY_TEMPLATES[1].content)
      ? SUMMARY_TEMPLATES[1].content
      : []
  );


  const handleLeaveMeeting = async () => {
    if (!latestBot?.id) return;
  
    try {
      await axios.post(
        `${API_BASE_URL}/nous-bot-manager/bots/${latestBot.id}/leave/`
      );
    } catch (err) {
      console.error("Failed to leave meeting", err);
    }
  };

  // Autosave
  useDebouncedAutosave(generalSummary, "General Summary");
  useDebouncedAutosave(actionItems, "Action Items");

  /* ---------------- ACTION ITEM HANDLERS ---------------- */

  const toggleActionItem = (id) => {
    setActionItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, done: !i.done } : i
      )
    );
  };

  const updateActionItemText = (id, text) => {
    setActionItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, text } : i
      )
    );
  };


  const selectedTemplate = SUMMARY_TEMPLATES.find(
    (t) => t.id === activeTemplate
  );

  const handleUtteranceChange = (id, field, value) => {
    setUtterances((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, [field]: value } : u
      )
    );
  };

  if (loadingMeeting) {
    return (
      <div className="px-6 py-6 text-sm text-gray-500">
        Loading meeting…
      </div>
    );
  }
  
  if (isLiveMeeting) {
    return (
      <div className="px-6 py-6 max-w-6xl mx-auto">
        <LiveTranscriptionPanel 
          botId={latestBot.id}
          botStatus={latestBot.status}
          onLeave={handleLeaveMeeting}
          meeting={meeting}
        />
      </div>
    );
  }

  return (
    <div className="px-6 py-6 max-w-7xl mx-auto mt-20">
      {/* Header */}
      <div className="mb-6">
        {/* Organization */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          <Building2 size={14} className="text-gray-400" />
          <span className="font-medium">Nous AI</span>
          <span className="opacity-60">• ORG-001</span>
        </div>

        {/* Meeting name */}
        <h1 className="text-lg font-semibold text-gray-900 leading-tight">
          {meeting?.name || "Live Meeting"}
        </h1>
      </div>
      {/* <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Johurul Hassan – Meeting Notes
        </h1>
        <p className="text-sm text-gray-500">
          Summary and transcript from this meeting
        </p>
      </div> */}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("summary")}
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === "summary"
              ? "text-[#8B0782] border-b-2 border-[#8B0782]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveTab("transcript")}
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === "transcript"
              ? "text-[#8B0782] border-b-2 border-[#8B0782]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Transcript
        </button>
      </div>

      {/* SUMMARY TAB */}
      {activeTab === "summary" && (
        <>
        {/* SUMMARY STATUS HANDLING */}
        {summaryStatus !== "completed" && (
          <div className="lg:col-span-4 bg-white border border-gray-200 rounded-xl p-6 text-center">
            {summaryStatus === "processing" && (
              <>
                <p className="text-sm text-gray-700 font-medium">
                  Summary is being generated
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  You’ll receive an email once it’s ready.
                </p>
              </>
            )}

            {(summaryStatus === "failed" || summaryStatus === "not_started") && (
              <>
                <p className="text-sm text-gray-700 font-medium">
                  Summary is not available yet
                </p>
                <button
                  className="mt-3 px-4 py-2 rounded-lg bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white text-sm hover:opacity-90"
                  onClick={() => {
                    // call regenerate summary API later
                    console.log("Regenerate summary");
                  }}
                >
                  Generate summary
                </button>
              </>
            )}
          </div>
        )}

        {summaryStatus === "completed" && (
        
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Templates */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <LayoutGrid size={16} /> Templates
                </h3>

                {SUMMARY_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveTemplate(t.id);
                      setIsEditingSummary(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition border mb-2 ${
                      activeTemplate === t.id
                        ? "bg-gradient-to-r from-[#0A0DC4]/90 to-[#8B0782]/90 text-white border-transparent"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                  >
                    <p className="font-medium">{t.label}</p>
                    <p className="text-xs opacity-80">{t.description}</p>
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="lg:col-span-3 bg-white border border-gray-200 rounded-xl p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    <h3 className="font-semibold text-sm">
                      {activeTemplate === "general"
                        ? "General Summary"
                        : "Action Items"}
                    </h3>
                  </div>

                  {activeTemplate === "general" && (
                    <button
                      onClick={() => setIsEditingSummary(!isEditingSummary)}
                      className="flex items-center gap-1 text-sm text-[#8B0782]"
                    >
                      {isEditingSummary ? <Save size={14} /> : <Edit3 size={14} />}
                      {isEditingSummary ? "Save" : "Edit"}
                    </button>
                  )}
                </div>

                {/* GENERAL SUMMARY */}
                {activeTemplate === "general" && (
                  <>
                    {isEditingSummary ? (
                      <textarea
                        value={generalSummary}
                        onChange={(e) => setGeneralSummary(e.target.value)}
                        className="w-full min-h-[220px] rounded-xl border border-gray-300 p-4 text-sm bg-gray-50 focus:ring-2 focus:ring-[#8B0782]/30"
                      />
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        <p><strong>Objective</strong></p>
                        <p>{summaryData?.meeting_objective}</p>

                        <p className="mt-4"><strong>Key Outcomes</strong></p>
                        <ul>
                          {summaryData?.high_level_outcomes?.map((o, i) => (
                            <li key={i}>{o}</li>
                          ))}
                        </ul>

                        <p className="mt-4"><strong>Discussion Themes</strong></p>
                        <ul>
                          {summaryData?.key_discussion_themes?.map((t, i) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>

                        {summaryData?.minutes?.map((section, i) => (
                          <div key={i} className="mt-4">
                            <p className="font-medium">{section.title}</p>
                            <ul>
                              {section.points.map((p, j) => (
                                <li key={j}>{p}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* ACTION ITEMS */}
                {activeTemplate === "action" && (
                  <div className="space-y-3">
                    {apiActionItems.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg">
                        <CheckSquare
                          size={18}
                          className={item.is_completed ? "text-[#8B0782]" : "text-gray-300"}
                        />
                        <div>
                          <p className="text-sm text-gray-800">{item.text}</p>
                          <p className="text-xs text-gray-500">
                            {/* Confidence: {Math.round(item.confidence * 100)}% */}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          
        )}
        </>

        
        
      )}


      {/* TRANSCRIPT TAB */}
      {activeTab === "transcript" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Transcript */}
          <div className="lg:col-span-3 bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Transcript</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-1 text-sm text-[#8B0782]"
              >
                {isEditing ? <Save size={14} /> : <Edit3 size={14} />}
                {isEditing ? "Save" : "Edit"}
              </button>
            </div>

            <div className="space-y-4">
              {loadingTranscript && (
                <p className="text-sm text-gray-500">Loading transcript…</p>
              )}

              {!loadingTranscript && botTranscript.map((u, idx) => (
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white flex items-center justify-center text-xs font-semibold">
                    {getInitials(u.speaker_name)}
                  </div>
                
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {u.speaker_name}
                    </p>

                    <p className="text-sm text-gray-700 mt-1 leading-relaxed flex flex-wrap gap-1">
                      {u.transcription.words.map((w, i) => {
                        const timelineIndex = wordTimeline.findIndex(
                          (tw) =>
                            tw.utteranceIndex === idx &&
                            tw.wordIndex === i
                        );

                        const isActive = timelineIndex === activeWordIndex;

                        return (
                          <span
                            key={i}
                            className={`cursor-pointer rounded px-0.5 transition ${
                              isActive
                                ? "bg-yellow-300 text-black"
                                : "hover:bg-yellow-100"
                            }`}
                            onClick={() => {
                              if (!recording) return;

                              const word = wordTimeline[timelineIndex];
                              if (!word) return;

                              const videoEl = document.getElementById("meeting-recording");
                              if (videoEl) {
                                videoEl.currentTime = word.start;
                              }
                            }}
                          >
                            {w.word}
                          </span>
                        );
                      })}
                    </p>
                
                    {/* <p className="text-sm text-gray-700 mt-1 leading-relaxed flex flex-wrap gap-1">
                      {u.transcription.words.map((w, i) => (
                        <span
                          key={i}
                          className="cursor-pointer hover:bg-yellow-100 rounded px-0.5"
                          onClick={() => {
                            if (!recording) return;
                          
                            const seekTimeSeconds =
                              (u.timestamp_ms +
                                w.start * 1000 -
                                recording.start_timestamp_ms) / 1000;
                          
                            const videoEl = document.getElementById("meeting-recording");
                            if (videoEl) {
                              videoEl.currentTime = Math.max(seekTimeSeconds, 0);
                            }
                          }}
                        >
                          {w.word}
                        </span>
                      ))}
                    </p> */}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Media Panel */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            {recording ? (
              <video
                id="meeting-recording"
                controls
                className="w-full rounded-lg"
                src={recording.url}
              />
            ) : (
              <div className="text-sm text-gray-500 text-center">
                Recording not available
              </div>
            )}
          </div>
        </div>
      )}


    </div>
  );
}
