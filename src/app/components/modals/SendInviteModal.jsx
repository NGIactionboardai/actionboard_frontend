'use client';

import { Fragment, useState, useEffect, useCallback, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import axios from "axios";

export default function SendInviteModal({
  isOpen,
  onClose,
  onSuccess,
  orgId,
  meeting,
  // members = [],
  // nextUrl,
  // isFetchingMore,
  // hasMore
}) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("invite"); // "invite" | "history"
  const [inviteHistory, setInviteHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const memberListRef = useRef(null);


  const [members, setMembers] = useState([]);
  const [nextUrl, setNextUrl] = useState(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = () => {
    const allIds = filteredMembers.map((m) => m.id);
    setSelected(allIds);
  };

  const handleDeselectAll = () => {
    setSelected([]);
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (isOpen) {
      setSelected([]);
      setViewMode("invite");
      fetchHistory()
      fetchMembers()
    }
  }, [isOpen]);

  const fetchMembers = async () => {
    if (!orgId) return;  // token handled globally by interceptor

    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/organisations/${orgId}/members/`);
      setMembers(res.data.members || []);
      setNextUrl(res.data.next);
      setHasMore(Boolean(res.data.next));
    } catch (err) {
      console.error('Error fetching members', err);
    }
  };

  // Fetch next page for infinite scroll
  const loadMoreMembers = useCallback(async () => {
    if (!nextUrl || isFetchingMore) return;

    setIsFetchingMore(true);
    try {
      const res = await axios.get(nextUrl);

      setMembers((prev) => {
        const map = new Map(prev.map(m => [m.id, m]));
        res.data.members.forEach(m => map.set(m.id, m));
        return Array.from(map.values());
      });
      setNextUrl(res.data.next);
      setHasMore(Boolean(res.data.next));
    } catch (err) {
      console.error('Failed to load more members:', err);
    } finally {
      setIsFetchingMore(false);
    }
  }, [nextUrl, isFetchingMore]);

  // Attach infinite scroll listener
  useEffect(() => {
    const el = memberListRef.current;
    if (!el) return;
  
    const handleScroll = () => {
      if (!hasMore || isFetchingMore || searchTerm) return;
  
      const threshold = 80; // px from bottom
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - threshold) {
        loadMoreMembers();
      }
    };
  
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [hasMore, isFetchingMore, loadMoreMembers, searchTerm]);




  const handleSend = async () => {
    if (selected.length === 0 || !meeting?.id) return;

    setLoading(true);
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const res = await axios.post(
        `${API_BASE_URL}/meetings/send-meeting-invitations/${orgId}/`,
        {
          member_ids: selected,
          meeting_id: meeting.id,
          timezone,
        }
      );

      toast.success(res.data.detail || "Invites sent successfully!");
      onSuccess?.();
      // Refresh history after sending
      fetchHistory();
    } catch (err) {
      console.error("Failed to send invites:", err);
      toast.error("Failed to send invites. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!meeting?.id) return;
    setLoadingHistory(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/meetings/invite-history/${orgId}/${meeting.id}/`
      );
      setInviteHistory(res.data.history || []);
    } catch (err) {
      console.error("Error fetching history", err);
      toast.error("Failed to load invite history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const getTimeZoneAbbr = (date) => {
    const parts = new Intl.DateTimeFormat(undefined, {
      timeZoneName: "short",
    }).formatToParts(date);
  
    const tz = parts.find((p) => p.type === "timeZoneName");
    return tz ? tz.value : "";
  };
  
  const formatInviteDate = (dateString) => {
    const date = new Date(dateString);
  
    // Format the main date/time
    const main = new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  
    // Extract short tz label
    const tz = getTimeZoneAbbr(date);
  
    return `${main}`;
  };
  

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] transition-opacity" />
        </Transition.Child>

        {/* Modal */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    Share Meeting
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Toggle as Tabs */}
                <div className="mb-6 flex justify-center">
                  <div className="inline-flex rounded-md border border-gray-300 bg-gray-100 p-1">
                    <button
                      className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                        viewMode === "invite"
                          ? "bg-indigo-600 text-white shadow"
                          : "text-gray-700 hover:bg-white"
                      }`}
                      onClick={() => setViewMode("invite")}
                    >
                      Invite Members
                    </button>
                    <button
                      className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                        viewMode === "history"
                          ? "bg-indigo-600 text-white shadow"
                          : "text-gray-700 hover:bg-white"
                      }`}
                      onClick={() => {
                        setViewMode("history");
                        fetchHistory();
                      }}
                    >
                      Invite History
                    </button>
                  </div>
                </div>

                {/* Content wrapper with fixed height */}
                <div className="h-[500px] pr-2">
                  {viewMode === "invite" ? (
                      <div className="flex flex-col h-full">
                        {/* Static Content (not scrollable) */}
                        {meeting?.join_url && (
                          <div className="mb-4">
                            <label className="text-sm text-gray-700 font-medium mb-1 block">
                              Meeting Link
                            </label>
                            <div className="flex items-center justify-between bg-gray-100 rounded px-3 py-2 text-sm">
                              <span
                                className="text-gray-700 truncate max-w-[65%] block"
                                title={meeting.join_url}
                              >
                                {meeting.join_url}
                              </span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(meeting.join_url);
                                  toast.success("Copied meeting link!");
                                }}
                                className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Search */}
                        <input
                          type="text"
                          placeholder="Search members..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />

                        {/* Select/Deselect All */}
                        <div className="flex justify-end gap-3 mb-3">
                          <button
                            onClick={handleSelectAll}
                            className="text-sm text-blue-600 hover:underline font-medium"
                          >
                            Select All
                          </button>
                          <button
                            onClick={handleDeselectAll}
                            className="text-sm text-red-600 hover:underline font-medium"
                          >
                            Deselect All
                          </button>
                        </div>

                        {/* Scrollable Members List */}
                        <div 
                          ref={memberListRef}
                          className="flex-1 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 space-y-3"
                        >
                          {loadingHistory ? (
                            // Skeleton loaders
                            Array.from({ length: 5 }).map((_, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white animate-pulse"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-5 h-5 rounded bg-gray-200" />
                                  <div className="space-y-2">
                                    <div className="w-24 h-3 bg-gray-200 rounded" />
                                    <div className="w-40 h-3 bg-gray-200 rounded" />
                                  </div>
                                </div>
                                <div className="w-12 h-5 bg-gray-200 rounded-full" />
                              </div>
                            ))
                          ) : (
                            <>
                              {filteredMembers.map((m) => {
                                const alreadyInvited = inviteHistory.some((h) =>
                                  h.members.some((hm) => hm.id === m.id)
                                );
                                return (
                                  <label
                                    key={m.id}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer bg-white"
                                  >
                                    <div className="flex items-center gap-3">
                                      <input
                                        type="checkbox"
                                        checked={selected.includes(m.id)}
                                        onChange={() => toggleSelect(m.id)}
                                        className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                                      />
                                      <div className="text-sm text-gray-800">
                                        <p className="font-medium">{m.name}</p>
                                        <p className="text-gray-500 text-xs">{m.email}</p>
                                      </div>
                                    </div>
                                    {alreadyInvited && (
                                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                                        Invited
                                      </span>
                                    )}
                                  </label>
                                );
                              })}

                              {filteredMembers.length === 0 && !loadingHistory && (
                                <div className="text-center text-gray-500 p-4 border rounded-lg">
                                  <p>No matching members found.</p>
                                  <a
                                    href={`/member-list/${orgId}`}
                                    className="inline-block mt-2 px-4 py-2 rounded-md bg-black/10 text-sm text-gray-700 hover:bg-black/20 transition"
                                  >
                                    Add Members
                                  </a>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {/* Fixed Footer */}
                        <div className="pt-4 border-t mt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                          <button
                            onClick={onClose}
                            className="w-full sm:w-auto px-4 py-2 rounded-md font-semibold text-gray-700 hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSend}
                            disabled={loading || selected.length === 0}
                            className={`w-full sm:w-auto px-4 py-2 rounded-md font-semibold text-white transition 
                              bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] 
                              hover:from-[#080aa8] hover:to-[#6d0668]
                              disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {loading ? "Sending..." : "Send Invite"}
                          </button>
                        </div>
                      </div>
                  ): (
                        <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                          {loadingHistory ? (
                            <>
                              {[...Array(3)].map((_, idx) => (
                                <div
                                  key={idx}
                                  className="p-3 border rounded-md bg-gray-50 animate-pulse"
                                >
                                  <div className="h-4 w-32 bg-gray-300 rounded mb-2"></div>
                                  <div className="h-3 w-20 bg-gray-200 rounded mb-3"></div>
                                  <div className="space-y-1">
                                    <div className="h-3 w-40 bg-gray-200 rounded"></div>
                                    <div className="h-3 w-28 bg-gray-200 rounded"></div>
                                  </div>
                                </div>
                              ))}
                            </>
                          ) : inviteHistory.length === 0 ? (
                            <p className="text-gray-500 text-center">
                              No invites sent yet.
                            </p>
                          ) : (
                            inviteHistory.map((h) => (
                              <div
                                key={h.id}
                                className="p-3 border rounded-md bg-gray-50"
                              >
                                <p className="text-sm font-semibold text-gray-800">
                                  {formatInviteDate(h.created_at)}
                                </p>
                                <p className="text-xs text-gray-500 mb-2">
                                  By: {h.invited_by}
                                </p>
                                <ul className="list-disc list-inside text-sm text-gray-700">
                                  {h.members.map((m) => (
                                    <li key={m.id}>
                                      {m.name} ({m.email})
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))
                          )}
                        </div>
                  )}
                </div>

                {/* {viewMode === "invite" && (
                  
                )} */}

                {/* {viewMode === "history" && (
                  
                )} */}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
