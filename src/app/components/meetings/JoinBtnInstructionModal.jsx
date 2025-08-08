'use client';

import { Dialog } from '@headlessui/react';
import { Button } from '@/components/ui/button'; // your styled button
import { useState } from 'react';

export default function JoinBtnInstructionModal({ isOpen, onClose, meeting }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(meeting.join_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy join URL:', err);
    }
  };

  const handleJoinNow = () => {
    window.open(meeting.join_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] transition-opacity" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="max-w-lg w-full bg-white rounded-xl p-6 shadow-lg">
          <Dialog.Title className="text-xl font-semibold text-gray-800 mb-4">
            Recording & Transcripts
          </Dialog.Title>

          <div className="space-y-3 text-sm text-gray-700">
            <p>
              To get a transcript and summary after your meeting, you’ll need to record it.
            </p>
            <ul className="list-disc list-inside ml-2">
              <li><strong>Paid Zoom account:</strong> Use <em>Cloud Recording</em>.</li>
              <li><strong>Free Zoom account:</strong> Use <em>Local Recording</em> and upload it after.</li>
            </ul>
            <p className="text-gray-600">
              Recording is optional — if you choose not to record, transcripts won’t be available.
            </p>
          </div>

          <div className="mt-6 border-t pt-4 space-y-3">
            <div className="text-sm">
              <div className="font-medium text-gray-800">Join URL</div>
              <div className="flex items-center justify-between mt-1 bg-gray-100 rounded px-3 py-2 text-sm">
                <span
                    className="text-gray-700 truncate max-w-[70%] block"
                    title={meeting.join_url} // shows full URL on hover
                >
                    {meeting.join_url}
                </span>
                <button
                    onClick={handleCopy}
                    className="ml-3 text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                >
                    {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-md font-semibold text-black bg-gray-200 hover:bg-gray-300"
              >
                Got it!
              </button>

              <button
                onClick={handleJoinNow}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
              >
                Join now
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
