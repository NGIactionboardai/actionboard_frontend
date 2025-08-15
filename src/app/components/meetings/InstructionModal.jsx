'use client';

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";

export default function InstructionModal({ isOpen, onClose }) {
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

                {/* Body */}
                <div className="space-y-3 text-sm text-gray-700">
                  <p>
                    To get a transcript and summary after your meeting, you’ll need to record it.
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

                {/* Actions */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm text-white rounded-md bg-indigo-600 hover:bg-indigo-700"
                  >
                    Got it!
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
