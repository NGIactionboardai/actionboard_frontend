import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const conversationsUrl = (orgId) => `${API_BASE_URL}/ai-assistant/organisations/${orgId}/conversations/`;
const conversationUrl = (orgId, conversationId) => `${API_BASE_URL}/ai-assistant/organisations/${orgId}/conversations/${conversationId}/`;
const conversationMeetingsUrl = (orgId, conversationId) => `${API_BASE_URL}/ai-assistant/organisations/${orgId}/conversations/${conversationId}/meetings/`;
const clearMessagesUrl = (orgId, conversationId) => `${API_BASE_URL}/ai-assistant/conversations/${orgId}/${conversationId}/messages/clear/`;
const queryUrl = `${API_BASE_URL}/ai-assistant/query/`;

const extractErrorMessage = (err) =>
  err?.response?.data?.error ||
  err?.response?.data?.detail ||
  err?.message ||
  'Something went wrong';

export const fetchConversations = createAsyncThunk(
  'aiChat/fetchConversations',
  async (orgId, { rejectWithValue }) => {
    try {
      const res = await axios.get(conversationsUrl(orgId));
      return { orgId, items: res.data || [] };
    } catch (err) {
      return rejectWithValue({ orgId, message: extractErrorMessage(err) });
    }
  }
);

export const createConversation = createAsyncThunk(
  'aiChat/createConversation',
  async ({ orgId, meetingIds }, { rejectWithValue }) => {
    try {
      const res = await axios.post(conversationsUrl(orgId), { meeting_ids: meetingIds });
      return { orgId, conversation: res.data };
    } catch (err) {
      return rejectWithValue({ orgId, message: extractErrorMessage(err) });
    }
  }
);

export const fetchConversationDetail = createAsyncThunk(
  'aiChat/fetchConversationDetail',
  async ({ orgId, conversationId }, { rejectWithValue }) => {
    try {
      const res = await axios.get(conversationUrl(orgId, conversationId));
      return { orgId, conversation: res.data };
    } catch (err) {
      return rejectWithValue({ orgId, conversationId, message: extractErrorMessage(err) });
    }
  }
);

export const deleteConversation = createAsyncThunk(
  'aiChat/deleteConversation',
  async ({ orgId, conversationId }, { rejectWithValue }) => {
    try {
      await axios.delete(conversationUrl(orgId, conversationId));
      return { orgId, conversationId };
    } catch (err) {
      return rejectWithValue({ orgId, conversationId, message: extractErrorMessage(err) });
    }
  }
);

export const updateConversationMeetings = createAsyncThunk(
  'aiChat/updateConversationMeetings',
  async ({ orgId, conversationId, add = [], remove = [] }, { rejectWithValue }) => {
    try {
      const res = await axios.post(conversationMeetingsUrl(orgId, conversationId), { add, remove });
      return { orgId, conversationId, selectedMeetings: res.data.selected_meetings || [] };
    } catch (err) {
      return rejectWithValue({ orgId, conversationId, message: extractErrorMessage(err) });
    }
  }
);

export const clearConversationMessages = createAsyncThunk(
  'aiChat/clearConversationMessages',
  async ({ orgId, conversationId }, { rejectWithValue }) => {
    try {
      await axios.delete(clearMessagesUrl(orgId, conversationId));
      return { orgId, conversationId };
    } catch (err) {
      return rejectWithValue({ orgId, conversationId, message: extractErrorMessage(err) });
    }
  }
);

export const sendQuery = createAsyncThunk(
  'aiChat/sendQuery',
  async ({ orgId, conversationId, query }, { rejectWithValue }) => {
    try {
      const res = await axios.post(queryUrl, {
        org_id: orgId,
        conversation_id: conversationId,
        query,
      });
      return { orgId, conversationId, query, data: res.data };
    } catch (err) {
      if (err?.response?.data?.error === 'usage_exceeded') {
        return rejectWithValue({ orgId, conversationId, query, usageExceeded: true, message: extractErrorMessage(err) });
      }
      return rejectWithValue({ orgId, conversationId, query, message: extractErrorMessage(err) });
    }
  }
);

const initialActiveConversation = {
  id: null,
  data: null,
  status: 'idle', // idle | loading | succeeded | failed
  sending: false,
  error: null,
};

const initialState = {
  conversationsByOrg: {},
  activeConversation: { ...initialActiveConversation },
};

const ensureOrgBucket = (state, orgId) => {
  if (!state.conversationsByOrg[orgId]) {
    state.conversationsByOrg[orgId] = { items: [], status: 'idle', error: null };
  }
  return state.conversationsByOrg[orgId];
};

const toListItem = (conversation) => ({
  id: conversation.id,
  title: conversation.title,
  meeting_count: conversation.selected_meetings?.length ?? 0,
  last_message_preview: null,
  created_at: conversation.created_at,
  updated_at: conversation.updated_at,
});

const aiChatSlice = createSlice({
  name: 'aiChat',
  initialState,
  reducers: {
    resetActiveConversation: (state) => {
      state.activeConversation = { ...initialActiveConversation };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch conversations list
      .addCase(fetchConversations.pending, (state, action) => {
        const bucket = ensureOrgBucket(state, action.meta.arg);
        bucket.status = 'loading';
        bucket.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        const bucket = ensureOrgBucket(state, action.payload.orgId);
        bucket.status = 'succeeded';
        bucket.items = action.payload.items;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        const orgId = action.payload?.orgId ?? action.meta.arg;
        const bucket = ensureOrgBucket(state, orgId);
        bucket.status = 'failed';
        bucket.error = action.payload?.message || 'Failed to load conversations';
      })

      // Create conversation
      .addCase(createConversation.fulfilled, (state, action) => {
        const { orgId, conversation } = action.payload;
        const bucket = ensureOrgBucket(state, orgId);
        bucket.items = [toListItem(conversation), ...bucket.items];
        state.activeConversation = {
          id: conversation.id,
          data: conversation,
          status: 'succeeded',
          sending: false,
          error: null,
        };
      })

      // Fetch single conversation detail
      .addCase(fetchConversationDetail.pending, (state, action) => {
        state.activeConversation = {
          id: action.meta.arg.conversationId,
          data: null,
          status: 'loading',
          sending: false,
          error: null,
        };
      })
      .addCase(fetchConversationDetail.fulfilled, (state, action) => {
        const { conversation } = action.payload;
        state.activeConversation = {
          id: conversation.id,
          data: conversation,
          status: 'succeeded',
          sending: false,
          error: null,
        };
      })
      .addCase(fetchConversationDetail.rejected, (state, action) => {
        state.activeConversation.status = 'failed';
        state.activeConversation.error = action.payload?.message || 'Failed to load conversation';
      })

      // Delete conversation
      .addCase(deleteConversation.fulfilled, (state, action) => {
        const { orgId, conversationId } = action.payload;
        const bucket = ensureOrgBucket(state, orgId);
        bucket.items = bucket.items.filter((c) => String(c.id) !== String(conversationId));
        if (String(state.activeConversation.id) === String(conversationId)) {
          state.activeConversation = { ...initialActiveConversation };
        }
      })

      // Add/remove meetings
      .addCase(updateConversationMeetings.fulfilled, (state, action) => {
        const { conversationId, selectedMeetings, orgId } = action.payload;
        if (String(state.activeConversation.id) === String(conversationId) && state.activeConversation.data) {
          state.activeConversation.data.selected_meetings = selectedMeetings;
        }
        const bucket = ensureOrgBucket(state, orgId);
        const item = bucket.items.find((c) => String(c.id) === String(conversationId));
        if (item) item.meeting_count = selectedMeetings.length;
      })

      // Clear messages
      .addCase(clearConversationMessages.fulfilled, (state, action) => {
        const { conversationId, orgId } = action.payload;
        if (String(state.activeConversation.id) === String(conversationId) && state.activeConversation.data) {
          state.activeConversation.data.messages = [];
        }
        const bucket = ensureOrgBucket(state, orgId);
        const item = bucket.items.find((c) => String(c.id) === String(conversationId));
        if (item) item.last_message_preview = null;
      })

      // Send query
      .addCase(sendQuery.pending, (state, action) => {
        const { conversationId, query } = action.meta.arg;
        if (String(state.activeConversation.id) === String(conversationId) && state.activeConversation.data) {
          state.activeConversation.data.messages.push({
            id: `temp-user-${Date.now()}`,
            sender: 'user',
            text: query,
            created_at: new Date().toISOString(),
          });
          state.activeConversation.data.messages.push({
            id: 'temp-typing',
            sender: 'assistant',
            text: '',
            typing: true,
          });
        }
        state.activeConversation.sending = true;
        state.activeConversation.error = null;
      })
      .addCase(sendQuery.fulfilled, (state, action) => {
        const { orgId, conversationId, query, data } = action.payload;
        state.activeConversation.sending = false;
        if (String(state.activeConversation.id) === String(conversationId) && state.activeConversation.data) {
          const messages = state.activeConversation.data.messages.filter((m) => m.id !== 'temp-typing');
          messages.push({
            id: `temp-assistant-${Date.now()}`,
            sender: 'assistant',
            text: data.answer ?? 'No answer returned from assistant.',
            meta: { sources: data.sources ?? [], route: data.route ?? null },
            created_at: new Date().toISOString(),
          });
          state.activeConversation.data.messages = messages;
          if (!state.activeConversation.data.title) {
            state.activeConversation.data.title = query.trim().slice(0, 80);
          }
        }

        const bucket = ensureOrgBucket(state, orgId);
        const item = bucket.items.find((c) => String(c.id) === String(conversationId));
        if (item) {
          if (!item.title) item.title = query.trim().slice(0, 80);
          item.last_message_preview = { sender: 'assistant', text: (data.answer || '').slice(0, 140) };
          item.updated_at = new Date().toISOString();
          bucket.items = [item, ...bucket.items.filter((c) => String(c.id) !== String(conversationId))];
        }
      })
      .addCase(sendQuery.rejected, (state, action) => {
        const { conversationId, message } = action.payload || {};
        state.activeConversation.sending = false;
        state.activeConversation.error = message || 'Failed to get a reply from the assistant.';
        if (String(state.activeConversation.id) === String(conversationId) && state.activeConversation.data) {
          state.activeConversation.data.messages = state.activeConversation.data.messages.filter(
            (m) => m.id !== 'temp-typing'
          );
        }
      });
  },
});

export const { resetActiveConversation } = aiChatSlice.actions;

export const selectConversations = (state, orgId) => state.aiChat.conversationsByOrg[orgId]?.items || [];
export const selectConversationsStatus = (state, orgId) => state.aiChat.conversationsByOrg[orgId]?.status || 'idle';
export const selectActiveConversation = (state) => state.aiChat.activeConversation;

export default aiChatSlice.reducer;
