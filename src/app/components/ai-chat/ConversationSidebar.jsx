'use client';

import { useState, Fragment } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { Dialog, Transition } from '@headlessui/react';
import { formatDistanceToNow } from 'date-fns';
import { Plus, MessageSquare, Trash2, PanelLeftClose, PanelLeftOpen, ArrowLeft, X } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/app/components/integrations/ConfirmModal';
import MeetingSelectionModal from '@/app/components/ai-chat/MeetingSelectionModal';
import OrgLogo from '@/app/components/organizations/OrgLogo';
import { deleteConversation } from '@/redux/aiChat/aiChatSlice';
import { useCreateConversation } from '@/app/hooks/useCreateConversation';

function OrgCard({ orgId, orgDetails }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-[#0A0DC4]/[0.06] to-[#8B0782]/[0.06] border border-purple-100/80 shadow-sm">
      <OrgLogo org={orgDetails} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-800 truncate">{orgDetails?.name || 'Organization'}</p>
        <p className="text-[11px] text-gray-500 truncate font-mono tracking-wide">{orgDetails?.org_id || orgId}</p>
      </div>
    </div>
  );
}

function SidebarBody({ orgId, orgDetails, conversations, activeConversationId, onNavigate, onNewChat, onDeleteRequest }) {
  return (
    <>
      <div className="p-3 border-b border-gray-100 space-y-3">
        <Link
          href={`/meetings/${orgId}`}
          onClick={onNavigate}
          className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-800 transition"
        >
          <ArrowLeft size={14} />
          Back to Org Home
        </Link>

        <OrgCard orgId={orgId} orgDetails={orgDetails} />

        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 text-sm font-medium bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white px-3 py-2 rounded-lg shadow-sm hover:opacity-90 transition"
        >
          <Plus size={16} />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0">
        {conversations.length === 0 && (
          <p className="text-gray-400 text-center text-sm mt-6 px-2">
            No conversations yet. Start a new chat to select meetings and begin.
          </p>
        )}

        {conversations.map((conv) => {
          const isActive = String(conv.id) === String(activeConversationId);
          return (
            <div
              key={conv.id}
              className={`group flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition ${
                isActive ? 'bg-gradient-to-r from-[#0A0DC4]/10 to-[#8B0782]/10 border border-purple-100' : 'hover:bg-gray-100'
              }`}
            >
              <Link
                href={`/org-ai-chat/${orgId}/${conv.id}`}
                onClick={onNavigate}
                className="flex-1 min-w-0 flex items-center gap-2"
              >
                <MessageSquare size={16} className={isActive ? 'text-[#0A0DC4]' : 'text-gray-400'} />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm truncate ${isActive ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                    {conv.title || 'New conversation'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {conv.updated_at ? formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true }) : ''}
                    {conv.meeting_count ? ` · ${conv.meeting_count} meeting${conv.meeting_count === 1 ? '' : 's'}` : ''}
                  </p>
                </div>
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onDeleteRequest(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition shrink-0"
                title="Delete conversation"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default function ConversationSidebar({
  orgId,
  orgDetails,
  conversations,
  activeConversationId,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) {
  const dispatch = useDispatch();
  const router = useRouter();

  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { create: handleCreateConversation, creating } = useCreateConversation(orgId);

  const handleDeleteConfirmed = async () => {
    if (!pendingDeleteId) return;
    setDeleting(true);
    try {
      await dispatch(deleteConversation({ orgId, conversationId: pendingDeleteId })).unwrap();
      if (String(activeConversationId) === String(pendingDeleteId)) {
        router.push(`/org-ai-chat/${orgId}`);
      }
      setPendingDeleteId(null);
    } catch (err) {
      toast.error(err?.message || 'Failed to delete conversation.');
    } finally {
      setDeleting(false);
    }
  };

  const sharedModals = (
    <>
      {showNewChatModal && (
        <MeetingSelectionModal
          isOpen={showNewChatModal}
          onClose={() => setShowNewChatModal(false)}
          orgId={orgId}
          mode="create"
          onConfirm={(ids) =>
            handleCreateConversation(ids, {
              onDone: () => {
                setShowNewChatModal(false);
                onCloseMobile?.();
              },
            })
          }
          isSubmitting={creating}
        />
      )}

      {pendingDeleteId && (
        <ConfirmModal
          title="Delete conversation"
          description="This will permanently delete the conversation and all of its messages. This can't be undone."
          confirmText={deleting ? 'Deleting...' : 'Delete'}
          cancelText="Cancel"
          danger
          onConfirm={handleDeleteConfirmed}
          onCancel={() => !deleting && setPendingDeleteId(null)}
        />
      )}
    </>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      {collapsed ? (
        <div className="hidden md:flex flex-col items-center w-14 border-r border-gray-200 bg-white py-4 gap-4">
          <OrgLogo org={orgDetails} size="sm" />
          <button onClick={onToggleCollapse} className="text-gray-500 hover:text-gray-800 transition" title="Expand sidebar">
            <PanelLeftOpen size={20} />
          </button>
          <button
            onClick={() => setShowNewChatModal(true)}
            className="w-9 h-9 rounded-full bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white flex items-center justify-center hover:opacity-90 transition"
            title="New chat"
          >
            <Plus size={18} />
          </button>
        </div>
      ) : (
        <div className="hidden md:flex w-72 flex-col border-r border-gray-200 bg-white shadow-sm min-h-0">
          <div className="flex items-center justify-end px-2 pt-2">
            <button onClick={onToggleCollapse} className="text-gray-400 hover:text-gray-700 transition" title="Collapse sidebar">
              <PanelLeftClose size={18} />
            </button>
          </div>
          <SidebarBody
            orgId={orgId}
            orgDetails={orgDetails}
            conversations={conversations}
            activeConversationId={activeConversationId}
            onNavigate={() => {}}
            onNewChat={() => setShowNewChatModal(true)}
            onDeleteRequest={setPendingDeleteId}
          />
        </div>
      )}

      {/* Mobile off-canvas drawer */}
      <Transition show={!!mobileOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 md:hidden" onClose={onCloseMobile}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="ease-in duration-150"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white flex flex-col shadow-xl">
              <div className="flex items-center justify-end px-2 pt-2">
                <button onClick={onCloseMobile} className="text-gray-400 hover:text-gray-700 transition">
                  <X size={20} />
                </button>
              </div>
              <SidebarBody
                orgId={orgId}
                orgDetails={orgDetails}
                conversations={conversations}
                activeConversationId={activeConversationId}
                onNavigate={onCloseMobile}
                onNewChat={() => setShowNewChatModal(true)}
                onDeleteRequest={setPendingDeleteId}
              />
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>

      {sharedModals}
    </>
  );
}
