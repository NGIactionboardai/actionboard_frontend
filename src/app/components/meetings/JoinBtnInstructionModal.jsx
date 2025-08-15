'use client';

import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";

export default function JoinBtnInstructionModal({ isOpen, onClose, meeting }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(meeting.join_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy join URL:", err);
    }
  };

  const handleJoinNow = () => {
    window.open(meeting.join_url, "_blank", "noopener,noreferrer");
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

        {/* Modal Container */}
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
                    Recording & Transcripts
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="space-y-3 text-sm text-gray-700">
                  <p>
                    To get a transcript and summary after your meeting, you’ll
                    need to record it.
                  </p>
                  <ul className="list-disc list-inside ml-2">
                    <li>
                      <strong>Paid Zoom account:</strong> Use{" "}
                      <em>Cloud Recording</em>.
                    </li>
                    <li>
                      <strong>Free Zoom account:</strong> Use{" "}
                      <em>Local Recording</em> and upload it after.
                    </li>
                  </ul>
                  <p className="text-gray-600">
                    Recording is optional — if you choose not to record,
                    transcripts won’t be available.
                  </p>
                </div>

                {/* Join URL */}
                <div className="mt-6 border-t pt-4 space-y-3">
                  <div className="text-sm">
                    <div className="font-medium text-gray-800">Join URL</div>
                    <div className="flex items-center justify-between mt-1 bg-gray-100 rounded px-3 py-2 text-sm">
                      <span
                        className="text-gray-700 truncate max-w-[70%] block"
                        title={meeting.join_url}
                      >
                        {meeting.join_url}
                      </span>
                      <button
                        onClick={handleCopy}
                        className="ml-3 text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                      >
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
                    >
                      Got it!
                    </button>
                    <button
                      onClick={handleJoinNow}
                      className="px-4 py-2 text-sm text-white rounded-md bg-indigo-600 hover:bg-indigo-700"
                    >
                      Join now
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
