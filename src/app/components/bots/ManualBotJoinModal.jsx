'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

export default function ManualBotJoinModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({
    meeting_name: '',
    meeting_link: '',
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // mock submit
    onSubmit?.(form);

    // optional reset
    setForm({ meeting_name: '', meeting_link: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 py-6 text-center">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.3)] transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        {/* Modal */}
        <div className="relative inline-block align-bottom bg-white rounded-lg text-left shadow-xl transform transition-all w-full max-w-md sm:my-8 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Manual Bot Join
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div className="px-4 pt-5 pb-4 sm:p-6 space-y-4">
              <p className="text-sm text-gray-500">
                Add a meeting name and link to manually invite the bot.
              </p>

              {/* Meeting Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Meeting Name *
                </label>
                <input
                  type="text"
                  name="meeting_name"
                  required
                  value={form.meeting_name}
                  onChange={handleChange}
                  placeholder="e.g. Weekly Standup"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2
                    focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              {/* Meeting Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Meeting Link *
                </label>
                <input
                  type="url"
                  name="meeting_link"
                  required
                  value={form.meeting_link}
                  onChange={handleChange}
                  placeholder="https://zoom.us/j/xxxxxx"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2
                    focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Supports Zoom, Google Meet, and Microsoft Teams
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={!form.meeting_name.trim() || !form.meeting_link.trim()}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2
                  bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                  sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Bot
              </button>

              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2
                  bg-white text-base font-medium text-gray-700 hover:bg-gray-50
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                  sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
