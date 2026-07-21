"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { cancelMeeting } from "@/redux/meetings/meetingSlice";

export default function CancelMeetingModal({ isOpen, onClose, meeting, organizationId, onCancelled }) {
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  if (!meeting) return null;

  const handleCancel = async () => {
    const idToCancel = meeting.id || meeting.meeting_id;

    if (!idToCancel || !organizationId) return;

    try {
      setLoading(true);

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      await dispatch(
        cancelMeeting({ organizationId, meetingId: idToCancel, timezone })
      ).unwrap();

      toast.success("Meeting cancelled and invitees notified");

      onClose();
      onCancelled?.();
    } catch (err) {
      console.error("Failed to cancel meeting:", err);
      toast.error(err || "Error cancelling meeting");
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
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-semibold leading-6 text-gray-900"
                >
                  Cancel Meeting
                </Dialog.Title>

                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Are you sure you want to cancel{" "}
                    <span className="font-medium text-gray-900">
                      {meeting.topic || meeting.id}
                    </span>
                    ?
                  </p>
                  <p className="mt-2 text-sm text-red-600">
                    All invited members will receive an email notifying them that this meeting has been cancelled. The meeting record and any transcripts will be kept.
                  </p>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Keep Meeting
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    {loading ? "Cancelling..." : "Cancel Meeting"}
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
