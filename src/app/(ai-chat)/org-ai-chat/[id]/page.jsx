'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { MessageSquarePlus } from 'lucide-react';
import MeetingSelectionModal from '@/app/components/ai-chat/MeetingSelectionModal';
import { useCreateConversation } from '@/app/hooks/useCreateConversation';

export default function AiChatEmptyStatePage() {
  const { id: orgId } = useParams();
  const [showModal, setShowModal] = useState(false);
  const { create, creating } = useCreateConversation(orgId);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
      <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] flex items-center justify-center text-white">
        <MessageSquarePlus size={26} />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Start a new conversation</h2>
        <p className="text-sm text-gray-500 mt-1 max-w-sm">
          Select one or more meetings and ask the AI assistant anything about them.
        </p>
      </div>
      <button
        onClick={() => setShowModal(true)}
        className="mt-2 text-sm font-medium bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition"
      >
        New Chat
      </button>

      {showModal && (
        <MeetingSelectionModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          orgId={orgId}
          mode="create"
          onConfirm={(ids) => create(ids, { onDone: () => setShowModal(false) })}
          isSubmitting={creating}
        />
      )}
    </div>
  );
}
