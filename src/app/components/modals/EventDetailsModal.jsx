import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function EventDetailsModal({
  isOpen,
  onClose,
  selectedEvent,
  onEdit,
  onDelete,
}) {
  const meeting = selectedEvent?.meeting;


  const providerIcon = {
    zoom: "/images/zoom02.png",
    google: "/images/meet.png",
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)]" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">

            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedEvent?.color }}
                />
                <Dialog.Title className="text-lg font-semibold text-gray-900">
                  {selectedEvent?.title}
                </Dialog.Title>
              </div>

              <button onClick={onClose}>
                <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            {/* Body */}
            <div className="mt-6 space-y-5">

              {/* Organization */}
              {selectedEvent?.organization !== "Personal" && (
                <div className="flex">
                  <div className="w-24 text-sm text-gray-500">Organization</div>
                  <div className="text-sm text-gray-900">
                    {selectedEvent?.organization}
                  </div>
                </div>
              )}

              {/* When */}
              <div className="flex">
                <div className="w-24 text-sm text-gray-500">When</div>
                <div className="text-sm text-gray-900">
                  {selectedEvent?.start?.toLocaleString()}
                  {selectedEvent?.end && (
                    <>
                      <br />
                      to {selectedEvent.end.toLocaleString()}
                    </>
                  )}
                </div>
              </div>

              {/* Details */}
              {selectedEvent?.description && (
                <div className="flex">
                  <div className="w-24 text-sm text-gray-500">Details</div>
                  <div className="text-sm text-gray-900">
                    {selectedEvent.description}
                  </div>
                </div>
              )}

              {/* 🔥 NEW: Meeting Section */}
              {selectedEvent?.join_url && (
                <>
                    <div className="flex items-start">
                        <div className="w-24 text-sm text-gray-500">Meeting</div>

                        <div className="text-sm text-gray-900 space-y-1">
                        <div className="flex items-center gap-2">
                            <img
                            src={providerIcon[selectedEvent.provider]}
                            className="w-4 h-4"
                            />
                            <span className="capitalize">{selectedEvent.provider}</span>
                        </div>
                        </div>
                    </div>

                    <div className="flex items-start">

                        <div className="w-24 text-sm text-gray-500">Join URL</div>
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          <a
                            href={selectedEvent.join_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                            title={selectedEvent.join_url}
                          >
                            {selectedEvent.join_url}
                          </a>
                        </div>

                    </div>
                </>
                
              )}
              

            </div>

            {/* Footer */}
            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md"
              >
                Close
              </button>

              <button
                onClick={onEdit}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md"
              >
                Edit
              </button>

              <button
                onClick={onDelete}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-md"
              >
                Delete
              </button>
            </div>

          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
}