"use client";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { XCircle } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

export default function ClearChatModal({ isOpen, onClose, onConfirm, orgId, isClearing}) {

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const MEETINGS_API = `${API_BASE_URL}/ai-assistant/meetings/${orgId}/`;

    

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay */}
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

        {/* Modal Panel */}
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
            <Dialog.Panel className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                  <XCircle size={24} />
                </div>
                <Dialog.Title className="text-lg font-semibold text-gray-800">
                  Clear Chat
                </Dialog.Title>
              </div>

              <Dialog.Description className="text-sm text-gray-600 mb-6">
                Are you sure you want to clear this chat? All messages in the
                current conversation will be removed locally.
              </Dialog.Description>

              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-sm border border-gray-300 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                  }}
                  disabled={isClearing}
                  className="px-4 py-2 rounded-lg text-sm text-white bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#080aa8] hover:to-[#6d0668] transition"
                >
                  {isClearing ? "Clearing..." : "Clear Chat"}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
