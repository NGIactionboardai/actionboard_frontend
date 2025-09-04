// components/SendSummaryModal.jsx
"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import axios from "axios";

export default function SendSummaryModal({
  isOpen,
  onClose,
  onSuccess,
  orgId,
  meeting,
  members = [],
}) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const authToken = useSelector((state) => state.auth.token);
  const [searchTerm, setSearchTerm] = useState("");

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
    if (isOpen) setSelected([]);
  }, [isOpen]);

  const handleSend = async () => {
    if (selected.length === 0 || !meeting?.meeting_id) return;

    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/transcripts/send-meeting-summary/${orgId}/`,
        {
          member_ids: selected,
          meeting_id: meeting.meeting_id, // note: uses meeting.meeting_id, not meeting.id
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      toast.success(res.data.detail || "Summary shared successfully!");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Failed to send summary:", err);
      toast.error("Failed to share summary. Please try again.");
    } finally {
      setLoading(false);
    }
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
                    Share Meeting Summary
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

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

                {/* Members List */}
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {filteredMembers.map((m) => (
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
                    </label>
                  ))}

                  {filteredMembers.length === 0 && (
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
                </div>

                {/* Footer */}
                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
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
                    {loading ? "Sending..." : "Send Summary"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
