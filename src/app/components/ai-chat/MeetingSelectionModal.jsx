'use client';

import { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import { Dialog, Transition } from '@headlessui/react';
import { Search, CheckSquare, Square, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const MAX_SELECTABLE_MEETINGS = 30;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const formatDate = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

export default function MeetingSelectionModal({
  isOpen,
  onClose,
  orgId,
  mode = 'create', // 'create' | 'manage'
  initialSelectedIds = [],
  onConfirm,
  minRequired = 1,
  isSubmitting = false,
}) {
  const [meetings, setMeetings] = useState([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selected, setSelected] = useState(initialSelectedIds);

  useEffect(() => {
    if (isOpen) setSelected(initialSelectedIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !orgId) return;
    let cancelled = false;
    async function fetchMeetings() {
      setLoadingMeetings(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/ai-assistant/meetings/${orgId}/`);
        if (cancelled) return;
        const normalized = (res.data || []).map((m) => ({
          id: m.id,
          topic: m.topic ?? m.title ?? `Meeting ${m.id}`,
          date: m.scheduled_time ?? m.date ?? null,
        }));
        setMeetings(normalized);
      } catch (err) {
        console.error('Failed to fetch meetings', err);
        toast.error('Failed to load meetings.');
      } finally {
        if (!cancelled) setLoadingMeetings(false);
      }
    }
    fetchMeetings();
    return () => {
      cancelled = true;
    };
  }, [isOpen, orgId]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 220);
    return () => clearTimeout(t);
  }, [search]);

  const filteredMeetings = meetings.filter((m) => m.topic.toLowerCase().includes(debouncedSearch));

  const toggleMeeting = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= minRequired) {
          toast.error(
            minRequired > 0
              ? 'A conversation must have at least one meeting.'
              : 'Select at least one meeting.'
          );
          return prev;
        }
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= MAX_SELECTABLE_MEETINGS) {
        toast.error(`You can select up to ${MAX_SELECTABLE_MEETINGS} meetings only.`);
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleConfirm = () => {
    if (selected.length < minRequired) {
      toast.error('Select at least one meeting to continue.');
      return;
    }
    onConfirm(selected);
  };

  const title = mode === 'create' ? 'Select meetings to start a new conversation' : 'Manage meetings';
  const confirmLabel = mode === 'create' ? 'Start conversation' : 'Save changes';

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={isSubmitting ? () => {} : onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] flex flex-col p-6">
              <Dialog.Title className="text-lg font-semibold text-gray-800 mb-1">{title}</Dialog.Title>
              <p className="text-xs text-gray-500 mb-3">
                You can select up to <span className="font-medium text-gray-700">{MAX_SELECTABLE_MEETINGS} meetings</span> at a time.
              </p>

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

              <div className="flex-1 overflow-y-auto space-y-2 min-h-[200px]">
                {loadingMeetings && <p className="text-xs text-gray-500 text-center mt-4">Loading meetings...</p>}

                {!loadingMeetings &&
                  filteredMeetings.map((meeting) => {
                    const isSelected = selected.includes(meeting.id);
                    const isDisabled = !isSelected && selected.length >= MAX_SELECTABLE_MEETINGS;
                    return (
                      <div
                        key={meeting.id}
                        onClick={() => !isDisabled && toggleMeeting(meeting.id)}
                        className={`flex items-center justify-between cursor-pointer border rounded-lg px-3 py-2 text-sm transition
                          ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                          ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#0A0DC4]/90 to-[#8B0782]/90 text-white'
                              : 'hover:bg-gray-100 text-gray-800 border-gray-200'
                          }`}
                      >
                        <div className="min-w-0">
                          <p className="font-medium truncate">{meeting.topic}</p>
                          <p className="text-xs opacity-70">{formatDate(meeting.date)}</p>
                        </div>
                        {isSelected ? <CheckSquare className="w-4 h-4 shrink-0" /> : <Square className="w-4 h-4 shrink-0" />}
                      </div>
                    );
                  })}

                {!loadingMeetings && filteredMeetings.length === 0 && (
                  <p className="text-gray-400 text-center text-sm mt-4">No meetings found</p>
                )}
              </div>

              {mode === 'manage' && (
                <div className="flex items-start gap-2 text-xs p-3 mt-3 bg-blue-50/70 border border-blue-100 rounded-lg text-blue-700">
                  <Info className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>You can&apos;t remove the last remaining meeting from a conversation.</p>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg text-sm border border-gray-300 hover:bg-gray-100 transition disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isSubmitting || selected.length < minRequired}
                  className="px-4 py-2 rounded-lg text-sm text-white bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#080aa8] hover:to-[#6d0668] transition disabled:opacity-60"
                >
                  {isSubmitting ? 'Please wait...' : confirmLabel}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
