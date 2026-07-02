import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { createConversation } from '@/redux/aiChat/aiChatSlice';

export function useCreateConversation(orgId) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const create = async (meetingIds, { onDone } = {}) => {
    setCreating(true);
    try {
      const result = await dispatch(createConversation({ orgId, meetingIds })).unwrap();
      onDone?.();
      router.push(`/org-ai-chat/${orgId}/${result.conversation.id}`);
    } catch (err) {
      toast.error(err?.message || 'Failed to create conversation.');
    } finally {
      setCreating(false);
    }
  };

  return { create, creating };
}
