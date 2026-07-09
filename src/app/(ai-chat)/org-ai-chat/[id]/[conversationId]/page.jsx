'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Send, Trash2, ListChecks, Crown } from 'lucide-react';
import toast from 'react-hot-toast';
import MessageList from '@/app/components/ai-chat/MessageList';
import MeetingSelectionModal from '@/app/components/ai-chat/MeetingSelectionModal';
import ClearChatModal from '@/app/components/ai-chat/ClearChatModal';
import UpgradeModal from '@/app/components/billing/UpgradeModal';
import { useFeature } from '@/app/hooks/useFeature';
import {
  fetchConversationDetail,
  sendQuery,
  updateConversationMeetings,
  clearConversationMessages,
  selectActiveConversation,
} from '@/redux/aiChat/aiChatSlice';

export default function AiChatConversationPage() {
  const { id: orgId, conversationId } = useParams();
  const dispatch = useDispatch();
  const activeConversation = useSelector(selectActiveConversation);

  const [input, setInput] = useState('');
  const [showMeetingsModal, setShowMeetingsModal] = useState(false);
  const [updatingMeetings, setUpdatingMeetings] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [upgradeConfig, setUpgradeConfig] = useState(null);

  const aiAssistant = useFeature('ai_assistant');

  useEffect(() => {
    if (!orgId || !conversationId) return;
    if (String(activeConversation.id) !== String(conversationId)) {
      dispatch(fetchConversationDetail({ orgId, conversationId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, conversationId]);

  const openUpgrade = (type) => setUpgradeConfig({ type, featureKey: 'ai_assistant' });
  const closeUpgrade = () => setUpgradeConfig(null);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    if (!aiAssistant.enabled) {
      openUpgrade('disabled');
      return;
    }
    if (!aiAssistant.canUse) {
      openUpgrade('limit');
      return;
    }
    if (aiAssistant.remaining !== null && aiAssistant.remaining <= 5) {
      toast("⚠️ You're running low on AI queries");
    }

    setInput('');
    try {
      await dispatch(sendQuery({ orgId, conversationId, query: text })).unwrap();
    } catch (err) {
      if (err?.usageExceeded) {
        openUpgrade('limit');
        return;
      }
      toast.error(err?.message || 'Failed to get a reply from the assistant.');
    }
  };

  const handleUpdateMeetings = async (newSelectedIds) => {
    const currentIds = (activeConversation.data?.selected_meetings || []).map((m) => m.id);
    const add = newSelectedIds.filter((id) => !currentIds.includes(id));
    const remove = currentIds.filter((id) => !newSelectedIds.includes(id));

    if (add.length === 0 && remove.length === 0) {
      setShowMeetingsModal(false);
      return;
    }

    setUpdatingMeetings(true);
    try {
      await dispatch(updateConversationMeetings({ orgId, conversationId, add, remove })).unwrap();
      setShowMeetingsModal(false);
      toast.success('Meetings updated.');
    } catch (err) {
      toast.error(err?.message || 'Failed to update meetings.');
    } finally {
      setUpdatingMeetings(false);
    }
  };

  const handleClearChat = async () => {
    setIsClearing(true);
    try {
      await dispatch(clearConversationMessages({ orgId, conversationId })).unwrap();
      toast.success('Chat cleared successfully.');
      setShowClearModal(false);
    } catch (err) {
      toast.error(err?.message || 'Something went wrong while clearing chat.');
    } finally {
      setIsClearing(false);
    }
  };

  if (activeConversation.status === 'loading' || (!activeConversation.data && activeConversation.status !== 'failed')) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        Loading conversation...
      </div>
    );
  }

  if (activeConversation.status === 'failed' || !activeConversation.data) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
        {activeConversation.error || 'Conversation not found.'}
      </div>
    );
  }

  const conversation = activeConversation.data;
  const selectedMeetings = conversation.selected_meetings || [];

  console.log("Messages: ", conversation.messages)

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Conversation header */}
      <div className="px-4 sm:px-6 py-3 border-b border-gray-200 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
            {conversation.title || 'New conversation'}
          </h1>
          <p className="text-xs text-gray-500 truncate">
            {selectedMeetings.length} meeting{selectedMeetings.length === 1 ? '' : 's'} selected
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowMeetingsModal(true)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#0A0DC4] transition"
          >
            <ListChecks size={16} />
            Manage meetings
          </button>
          <button
            onClick={() => setShowClearModal(true)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition"
          >
            <Trash2 size={16} />
            Clear Chat
          </button>
        </div>
      </div>

      <MessageList messages={conversation.messages || []} />

      {aiAssistant.limit && (
        <div className="px-4 sm:px-6 pb-1 text-xs text-gray-500 flex justify-between">
          <span>{aiAssistant.used} / {aiAssistant.limit} queries used</span>
          {aiAssistant.remaining <= 5 && <span className="text-orange-500 font-medium">Low usage</span>}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 bg-white px-4 sm:px-6 py-3 sm:py-4 shadow-[0_-2px_6px_rgba(0,0,0,0.05)] flex flex-row gap-3">
        <div className="flex w-[90%] items-center bg-gray-100 rounded-xl p-2">
          <input
            type="text"
            placeholder={
              !aiAssistant.enabled
                ? 'Upgrade to use AI Assistant'
                : !aiAssistant.canUse
                ? 'Limit reached — upgrade to continue'
                : `Ask about ${selectedMeetings.length} meeting(s)...`
            }
            className="flex-1 px-3 py-2 outline-none text-sm text-gray-800 bg-transparent"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
        </div>
        <div className="flex justify-end w-[10%]">
          <div className="relative inline-block">
            {!aiAssistant.enabled && (
              <div className="absolute -top-2 -right-2 z-10">
                <div className="bg-yellow-400 text-white rounded-full p-1 shadow-md ring-2 ring-white">
                  <Crown className="w-3 h-3" />
                </div>
              </div>
            )}
            <button
              onClick={handleSend}
              disabled={activeConversation.sending}
              className="bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white rounded-lg px-4 py-2 text-sm flex items-center gap-1 transition disabled:opacity-60 hover:from-[#080aa8] hover:to-[#6d0668]"
            >
              <Send size={16} />
              {activeConversation.sending ? 'Processing...' : 'Send'}
            </button>
          </div>
        </div>
      </div>

      {showMeetingsModal && (
        <MeetingSelectionModal
          isOpen={showMeetingsModal}
          onClose={() => setShowMeetingsModal(false)}
          orgId={orgId}
          mode="manage"
          initialSelectedIds={selectedMeetings.map((m) => m.id)}
          onConfirm={handleUpdateMeetings}
          isSubmitting={updatingMeetings}
        />
      )}

      <ClearChatModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClearChat}
        isClearing={isClearing}
      />

      {upgradeConfig && (
        <UpgradeModal type={upgradeConfig.type} featureKey="ai_assistant" onClose={closeUpgrade} />
      )}
    </div>
  );
}
