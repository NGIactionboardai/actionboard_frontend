"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { removeMeetingFromState } from "@/redux/auth/zoomSlice";
import toast from "react-hot-toast";


export default function DeleteMeetingModal({ isOpen, onClose, meeting, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const token = useSelector((state) => state.auth?.token);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const dispatch = useDispatch();

  if (!meeting) return null;

  const handleDelete = async () => {
    const idToDelete = meeting.meeting_id || meeting.id;
    console.log("Delete modal meeting:", meeting);
    if (!idToDelete) return;

    try {
      setLoading(true);
      await axios.delete(
        `${API_BASE_URL}/meetings/zoom/meeting/${idToDelete}/delete/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      dispatch(removeMeetingFromState(idToDelete)); // tell parent to remove it from list

      toast.success("Meeting deleted successfully");

      onClose();
    } catch (err) {
      console.error("Failed to delete meeting:", err);
      alert("Error deleting meeting. Please try again.");
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
                  Delete Meeting
                </Dialog.Title>

                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Are you sure you want to delete this meeting?{" "}
                    <span className="font-medium text-gray-900">
                      {meeting.topic || meeting.meeting_id}
                    </span>
                    .
                  </p>
                  <p className="mt-2 text-sm text-red-600">
                    This will also delete transcripts and any data related to it.
                  </p>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    {loading ? "Deleting..." : "Delete Meeting"}
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
