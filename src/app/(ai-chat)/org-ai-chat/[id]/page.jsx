'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Search, CheckSquare, Square, Building2, Info } from 'lucide-react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Trash2 } from "lucide-react";
import ClearChatModal from '@/app/components/ai-chat/ClearChatModal';





export default function AIChatPage() {
  const { id: orgId } = useParams();
  const [messages, setMessages] = useState([
    { sender: 'bot', text: '👋 Hello! I’m your AI assistant. Select meetings and ask me anything!' },
  ]);
  const [input, setInput] = useState('');
  const [meetings, setMeetings] = useState([]); // real meetings from API
  const [selectedMeetings, setSelectedMeetings] = useState([]);
  const [search, setSearch] = useState('');
  const [loadingReply, setLoadingReply] = useState(false);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [orgName, setOrgName] = useState('Acme Corp');
  const [loadingConversation, setLoadingConversation] = useState(true);
  const [conversationId, setConversationId] = useState(null);
  const [error, setError] = useState(null);
  const [quickStartQuestions, setQuickStartQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)


  const chatEndRef = useRef(null);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const initialLoadDone = useRef(false);

  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);


  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const MEETINGS_API = `${API_BASE_URL}/ai-assistant/meetings/${orgId}/`;
  const CONVERSATION_API = `${API_BASE_URL}/ai-assistant/organisations/${orgId}/conversation/`;
  // Assumption: chat POST endpoint. Change if your backend uses a different route.
  const CHAT_API = `${API_BASE_URL}/ai-assistant/query/`;

  // const chatEndRef = useRef(null);

  useEffect(() => {
    if (!initialLoadDone.current) {
      chatEndRef.current?.scrollIntoView({ behavior: 'auto' });
      initialLoadDone.current = true;
    } else {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/organisations/${orgId}/`);
        const data = res.data;
        setOrgName(data.name);
      } catch (err) {
        console.error('Error fetching organization:', err);
      }
    };

    if (orgId) {
      fetchOrg();
    }
  }, [orgId, API_BASE_URL]);

  // Fetch meetings on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchMeetings() {
      setLoadingMeetings(true);
      setError(null);
      try {
        const res = await axios.get(MEETINGS_API);
        if (cancelled) return;
        // Expecting array of meetings as in your example
        // Normalize to local shape: { id, topic, date }
        const normalized = (res.data || []).map((m) => ({
          id: m.id,
          topic: m.topic ?? m.title ?? `Meeting ${m.id}`,
          date: m.start_time ?? m.date ?? null,
          full_transcript: m.full_transcript ?? '',
          raw: m,
        }));
        setMeetings(normalized);
      } catch (err) {
        console.error('Failed to fetch meetings', err);
        setError('Failed to fetch meetings.');
      } finally {
        if (!cancelled) setLoadingMeetings(false);
      }
    }
    fetchMeetings();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch existing conversation + messages (if any)
  useEffect(() => {
    let cancelled = false;
    async function fetchConversation() {
      setLoadingConversation(true);
      try {
        const res = await axios.get(CONVERSATION_API);
        if (cancelled) return;
        const payload = res.data || {};
        // payload example you provided contained: conversation_id, created, messages[]
        if (payload.conversation_id) setConversationId(payload.conversation_id);

        // Map backend messages -> UI messages:
        // backend sender values: "user" or "assistant"
        const mapped = (payload.messages || []).map((m) => ({
          sender: m.sender === 'assistant' ? 'bot' : 'user',
          text: m.text,
          meta: m.meta ?? null,
          created_at: m.created_at ?? null,
        }));

        // If there are messages, replace the default greeting
        if (mapped.length > 0) {
          setMessages((prev) => {
            // If the only message is the default greeting, replace it; else append
            const hasGreeting =
              prev.length === 1 && prev[0].text?.includes('I’m your AI assistant');
            if (hasGreeting) return mapped;
            return [...prev, ...mapped];
          });
        }
      } catch (err) {
        console.error('Failed to fetch conversation', err);
        // don't escalate too loudly—chat can work without prior history
      } finally {
        if (!cancelled) setLoadingConversation(false);
      }
    }
    fetchConversation();
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced search for smoother typing (simple implementation)
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 220);
    return () => clearTimeout(t);
  }, [search]);

  const filteredMeetings = meetings.filter((m) =>
    m.topic.toLowerCase().includes(debouncedSearch)
  );

  const handleSelectAll = () => {
    if (selectedMeetings.length === filteredMeetings.length) {
      setSelectedMeetings([]);
    } else {
      setSelectedMeetings(filteredMeetings.map((m) => m.id));
    }
  };

  const toggleMeeting = (id) => {
    setSelectedMeetings((prev) => {
      // if already selected, unselect
      if (prev.includes(id)) return prev.filter((x) => x !== id);
  
      // if not selected and already 10 selected, block further selection
      if (prev.length >= 10) {
        toast.error("You can select up to 10 meetings only.");
        return prev;
      }
  
      // else add it
      return [...prev, id];
    });
  };

  async function fetchQuickStartQuestions(meetings) {
    const snippets = meetings.map(m => {
      const parts = [];
  
      // Always include topic
      if (m.topic) parts.push(`Topic: ${m.topic}`);
  
      // Include agenda if available
      if (m.agenda) parts.push(`Agenda: ${m.agenda}`);
  
      // Include first ~300 chars of full transcript if available
      if (m.full_transcript) {
        const transcriptSnippet = m.full_transcript.slice(0, 500);
        parts.push(`Transcript snippet: ${transcriptSnippet}`);
      }
  
      // Join all parts into a single snippet, limit to 500 chars total
      return parts.join("\n").slice(0, 500);
    });
  
    try {
      console.log("Snippits: ", snippets)
      const res = await axios.post(
        `${API_BASE_URL}/ai-assistant/quick-start-questions/`,
        { snippets }
      );
      return res.data.questions || [];
    } catch (err) {
      console.error('Failed to generate quick start questions:', err);
      throw new Error(
        err.response?.data?.error || 'Failed to generate quick start questions'
      );
    }
  }
  

  useEffect(() => {
    if (selectedMeetings.length === 0) {
      setQuickStartQuestions([]);
      return;
    }
  
    setInput('');
    setIsLoadingQuestions(true);
  
    const selected = meetings.filter(m => selectedMeetings.includes(m.id));
  
    // Generic base question templates (no sentiment)
    const baseQuestions = [
      "Meeting Topic",
      "Meeting Minutes",
      "Meeting Summary",
      "Action Items",
      "Speaker Names",
      "Annual Report",
    ];
  
    // Build tailored questions randomly using selected meetings
    const dynamicQuestions = [];
  
    selected.forEach(m => {
      const templates = [
        `Summarize the meeting "${m.topic}"`,
        `Can you summarize meeting "${m.topic}"?`,
        `List the action items from "${m.topic}"`,
        `Can you tell me the action items of meeting "${m.topic}"?`,
        `Show meeting minutes for "${m.topic}"`,
        `Who were the speakers in "${m.topic}"?`,
        `Give a summary of speaker A from "${m.topic}"`,
        `What are the key takeaways from "${m.topic}"?`,
        `Can you compare "${m.topic}" with another meeting?`,
      ];
  
      // Randomly pick one or two per meeting
      const randomCount = Math.random() > 0.5 ? 2 : 1;
      const shuffledTemplates = templates.sort(() => 0.5 - Math.random());
      dynamicQuestions.push(...shuffledTemplates.slice(0, randomCount));
    });
  
    // Merge base + dynamic + randomize + limit
    const allQuestions = [...baseQuestions, ...dynamicQuestions];
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    const finalQuestions = [...new Set(shuffled)].slice(0, 1);
  
    setQuickStartQuestions(finalQuestions);
    setIsLoadingQuestions(false);
  }, [selectedMeetings]);
  
  

  


  // Core send function: posts to chat API and appends assistant answer
  const handleSend = async (textOverride = null) => {
    if (selectedMeetings.length === 0) {
      toast.error('Please select at least one meeting before sending your query.');
      return;
    }
  
    const text = (textOverride ?? input).trim();
    if (!text) return;
  
    setError(null);
  
    // Add user message optimistically
    const userMessage = { sender: 'user', text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
  
    // Add temporary "bot typing" indicator
    const typingMessage = { sender: 'bot', text: '', typing: true };
    setMessages((prev) => [...prev, typingMessage]);
  
    setLoadingReply(true);
  
    try {
      const payload = {
        org_id: orgId,
        meeting_ids: selectedMeetings,
        query: text,
        conversation_id: conversationId,
      };
  
      const res = await axios.post(CHAT_API, payload);
      const data = res.data || {};
  
      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }
  
      const assistantText = data.answer ?? 'No answer returned from assistant.';
      const assistantMessage = {
        sender: 'bot',
        text: assistantText,
        meta: {
          followups: data.followups ?? [],
          sources: data.sources ?? [],
        },
      };
  
      // Replace typing message with the real assistant reply
      setMessages((prev) => [
        ...prev.filter((m) => !m.typing),
        assistantMessage,
      ]);
    } catch (err) {
      console.error('Chat API failed', err);
  
      const errorMessage =
        err?.response?.data?.detail ||
        'Failed to get a reply from the assistant. Please try again.';
      toast.error(errorMessage);
      setError(errorMessage);
  
      // Remove typing indicator
      setMessages((prev) => prev.filter((m) => !m.typing));
  
      // Add bot failure message
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: '❗️ Failed to fetch assistant response.' },
      ]);
    } finally {
      setLoadingReply(false);
    }
  };

  const handleClearChat = async () => {
    if (!conversationId || !orgId) {
      toast.error("No active conversation found.");
      return;
    }

    setIsClearing(true);
    console.log("Conversation ID:", conversationId);
  
    try {
      const url = `${API_BASE_URL}/ai-assistant/conversations/${orgId}/${conversationId}/messages/clear/`;
  
      const res = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`, // or use your getAuthHeaders() util
        },
      });
  
      if (res.data?.success) {
        toast.success("Chat cleared successfully.");
        setMessages([]); // clear locally
        setShowClearModal(false);
      } else {
        toast.error(res.data?.message || "Failed to clear chat.");
      }
    } catch (err) {
      console.error("Failed to clear conversation", err);
      toast.error("Something went wrong while clearing chat.");
    }finally {
      setIsClearing(false);
    }
  };
  

  // Convenience: send a suggested quick question
  const handleQuickQuestion = (q) => {
    // set input for user to edit OR send immediately
    // We'll send immediately to streamline UX
    handleSend(q);
  };

  // Formatting helper
  const formatDate = (iso) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  };

  const TypingIndicator = () => (
    <div className="flex items-center gap-2">
      {/* <div className="w-9 h-9 bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] rounded-full flex items-center justify-center text-white shrink-0">
        <Bot size={18} />
      </div> */}
      <div className="flex gap-1">
        <motion.span
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="w-2 h-2 bg-gray-400 rounded-full"
        ></motion.span>
        <motion.span
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 0.8, delay: 0.2, repeat: Infinity }}
          className="w-2 h-2 bg-gray-400 rounded-full"
        ></motion.span>
        <motion.span
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 0.8, delay: 0.4, repeat: Infinity }}
          className="w-2 h-2 bg-gray-400 rounded-full"
        ></motion.span>
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-4.5rem)] bg-gray-50 overflow-hidden">
      {/* Sidebar for larger screens */}
      <div className="hidden md:flex w-72 flex-col border-r border-gray-200 bg-white shadow-sm min-h-0">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Meetings</h2>

          {/* Search */}
          <div className="flex items-center bg-gray-100 rounded-lg px-2 py-1 mb-3">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search meetings..."
              className="bg-transparent outline-none px-2 py-1 w-full text-sm text-gray-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Note: Selection Limit */}
          <div className="space-y-2 mt-3">
            <div className="flex items-start space-x-2 text-xs p-3 bg-blue-50/70 border border-blue-100 rounded-lg text-blue-700">
              <Info className="w-4 h-4 mt-0.5" />
              <p>
                You can select up to <span className="font-semibold">10 meetings</span> at a time.
              </p>
            </div>

            <div className="flex items-start space-x-2 text-xs p-3 bg-amber-50/70 border border-amber-100 rounded-lg text-amber-700">
              <Info className="w-4 h-4 mt-0.5" />
              <p>
                <span className="font-semibold">Note:</span> Only ended and transcribed meetings are displayed here.
              </p>
            </div>
          </div>

          {loadingMeetings && <p className="text-xs text-gray-500 mt-2">Loading meetings...</p>}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
        {filteredMeetings.map((meeting) => {
          const isDisabled =
            !selectedMeetings.includes(meeting.id) && selectedMeetings.length >= 10;

          return (
            <div
              key={meeting.id}
              onClick={() => !isDisabled && toggleMeeting(meeting.id)} // prevent click if disabled
              className={`flex items-center justify-between cursor-pointer border rounded-lg px-3 py-2 text-sm transition 
                ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                ${
                  selectedMeetings.includes(meeting.id)
                    ? "bg-gradient-to-r from-[#0A0DC4]/90 to-[#8B0782]/90 text-white"
                    : "hover:bg-gray-100 text-gray-800 border-gray-200"
                }`}
            >
              <div>
                <p className="font-medium">{meeting.topic}</p>
                <p className="text-xs opacity-70">{formatDate(meeting.date)}</p>
              </div>
              {selectedMeetings.includes(meeting.id) ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
            </div>
          );
        })}

          {!loadingMeetings && filteredMeetings.length === 0 && (
            <p className="text-gray-400 text-center text-sm mt-3">No meetings found</p>
          )}
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        </div>
      </div>

      {/* Chat Section */}
      <div className="flex-1 flex flex-col bg-gray-50 min-h-0">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white shadow-sm flex flex-col md:flex-row md:items-center md:gap-3 gap-4">
          {/* Top section (icon + text) */}
          <div className="flex items-center flex-wrap gap-3 md:flex-1 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] flex items-center justify-center text-white flex-shrink-0">
              <Building2 size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">
                {orgName} - AI Meeting Assistant
              </h1>
              <p className="text-sm text-gray-500 truncate">
                Chat about your organization’s meetings
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3 md:ml-auto w-full md:w-auto">
            {/* Select Meetings — only visible on mobile */}
            <button
              onClick={() => setShowMeetingModal(true)}
              className="text-sm bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white px-3 py-1.5 rounded-lg shadow-sm hover:opacity-90 transition w-full md:hidden"
            >
              Select Meetings
            </button>

            {/* Clear Chat — always visible */}
            <button
              onClick={() => setShowClearModal(true)}
              className="flex items-center justify-center gap-1 text-sm text-gray-600 hover:text-red-600 transition w-full md:w-auto"
            >
              <Trash2 size={16} />
              Clear Chat
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 min-h-0">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] rounded-full flex items-center justify-center text-white shrink-0">
                      <Bot size={16} />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] sm:max-w-lg px-3 sm:px-4 py-2 rounded-2xl shadow-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    {msg.typing ? (
                      <TypingIndicator />
                    ) : msg.sender === 'bot' ? (
                      <div className="prose prose-sm max-w-full break-words">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      msg.text
                    )}

                    {/* {msg.sender === 'bot' && msg.meta?.followups?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {msg.meta.followups.map((f, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuickQuestion(f)}
                            className="text-xs border px-2 py-1 rounded-full hover:border-[#8B0782]"
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    )} */}


                  </div>
                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-300 rounded-full flex items-center justify-center shrink-0">
                      <User size={16} className="text-gray-700" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* <div className="px-6 py-3 flex flex-wrap gap-2 justify-center">
                {isLoadingQuestions ? (
                  <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                  </div>
                ) : (
                  quickStartQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        handleQuickQuestion(q);
                        setQuickStartQuestions(prev => prev.filter(qq => qq !== q));
                      }}
                      className="text-sm border border-gray-300 rounded-full px-3 py-1.5 hover:border-[#8B0782] hover:text-[#8B0782] transition"
                    >
                      {q}
                    </button>
                  ))
                )}
              </div> */}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 bg-white px-4 sm:px-6 py-3 sm:py-4 shadow-[0_-2px_6px_rgba(0,0,0,0.05)] flex flex-col gap-3">
            <div className="flex items-center bg-gray-100 rounded-xl p-2">
              <input
                type="text"
                disabled={selectedMeetings.length === 0 }
                // placeholder={
                //   selectedMeetings.length === 0
                //     ? 'Select meetings first...'
                //     : quickStartQuestions.length === 0
                //       ? 'Generating quick questions...'
                //       : `Ask about ${selectedMeetings.length} meeting(s)...`
                // }

                placeholder={
                  selectedMeetings.length === 0
                    ? 'Select meetings first...'
                    : `Ask about ${selectedMeetings.length} meeting(s)...`
                }
                className="flex-1 px-3 py-2 outline-none text-sm text-gray-800 bg-transparent"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button
                onClick={() => handleSend()}
                disabled={loadingReply}
                className="ml-2 bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#080aa8] hover:to-[#6d0668] text-white rounded-lg px-4 py-2 text-sm flex items-center gap-1 transition disabled:opacity-60"
              >
                <Send size={16} />
                {loadingReply ? 'Processing...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Chat Modal */}
      <ClearChatModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClearChat}
      />

      {/* Mobile Meeting Selection Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Select Meetings</h2>
              <button
                onClick={() => setShowMeetingModal(false)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-3 text-center italic">
              You can select up to <span className="font-medium text-gray-700">10 meetings</span> at a time.
            </p>


            <div className="space-y-2">
            {filteredMeetings.map((meeting) => {
              const isDisabled =
                !selectedMeetings.includes(meeting.id) && selectedMeetings.length >= 10;

              return (
                <div
                  key={meeting.id}
                  onClick={() => !isDisabled && toggleMeeting(meeting.id)} // prevent click if disabled
                  className={`flex items-center justify-between cursor-pointer border rounded-lg px-3 py-2 text-sm transition 
                    ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                    ${
                      selectedMeetings.includes(meeting.id)
                        ? "bg-gradient-to-r from-[#0A0DC4]/90 to-[#8B0782]/90 text-white"
                        : "hover:bg-gray-100 text-gray-800 border-gray-200"
                    }`}
                >
                  <div>
                    <p className="font-medium">{meeting.topic}</p>
                    <p className="text-xs opacity-70">{formatDate(meeting.date)}</p>
                  </div>
                  {selectedMeetings.includes(meeting.id) ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </div>
              );
            })}

              {!loadingMeetings && filteredMeetings.length === 0 && (
                <p className="text-gray-400 text-center text-sm mt-3">No meetings found</p>
              )}
            </div>

            <div className="mt-4 text-right">
              <button
                onClick={() => setShowMeetingModal(false)}
                className="text-sm bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white px-4 py-2 rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
