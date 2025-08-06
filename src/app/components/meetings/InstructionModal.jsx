'use client';

import { Dialog } from '@headlessui/react';
import { Button } from '@/components/ui/button'; // use your styled button

export default function InstructionModal({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] transition-opacity" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="max-w-lg w-full bg-white rounded-xl p-6 shadow-lg">
          <Dialog.Title className="text-xl font-semibold text-gray-800 mb-4">
            Important: Recording Required for Transcription
          </Dialog.Title>

          <div className="space-y-3 text-sm text-gray-700">
            <p>
              To receive transcripts and summaries after the meeting, you need to record it.
            </p>
            <ul className="list-disc list-inside ml-2">
              <li>
                <strong>Paid Zoom account:</strong> Enable <em>Cloud Recording</em> in Zoom.
              </li>
              <li>
                <strong>Free Zoom account:</strong> Use <em>Local Recording</em> and upload the file manually after the meeting.
              </li>
            </ul>
            <p>
              Recordings are processed to generate transcripts, speaker analysis, and meeting summaries.
            </p>
          </div>

          <div className="mt-6 text-right">
            <button
                onClick={onClose}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
                Got it!
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
