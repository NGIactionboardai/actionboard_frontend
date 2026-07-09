import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { storage } from '@/redux/auth/authSlices';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const ACCESS_TOKEN_KEY = 'meetingsummarizer_token';

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

// Parses one complete "data: {...}\n\n" SSE frame into its JSON payload.
// Returns null for frames without a data line (SSE comments/keepalives).
function parseSseFrame(rawFrame) {
  const line = rawFrame.split('\n').find((l) => l.startsWith('data:'));
  if (!line) return null;
  try {
    return JSON.parse(line.slice(5).trim());
  } catch {
    return null;
  }
}

// The /ai-assistant/query/ endpoint streams SSE for the normal RAG route,
// but still returns a single JSON body (possibly a 202 "still processing"
// response) for the hierarchical-digest route and for validation errors —
// axios can't consume a streaming body incrementally, so this uses fetch
// directly and attaches the auth header manually (axios's interceptor
// doesn't apply here).
export const sendQuery = createAsyncThunk(
  'aiChat/sendQuery',
  async ({ orgId, conversationId, query }, { dispatch, rejectWithValue }) => {
    const token = storage.get(ACCESS_TOKEN_KEY);

    let res;
    try {
      res = await fetch(queryUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ org_id: orgId, conversation_id: conversationId, query }),
      });
    } catch (err) {
      dispatch(streamFailed({ conversationId }));
      return rejectWithValue({ orgId, conversationId, query, message: err.message || 'Network error' });
    }

    const contentType = res.headers.get('content-type') || '';

    if (!contentType.includes('text/event-stream')) {
      // Non-streamed path: digest route, a 202 "still processing" response,
      // or a validation/error response — all arrive as one JSON body.
      let data = {};
      try {
        data = await res.json();
      } catch {
        // ignore — handled by the !res.ok / missing-answer checks below
      }

      if (!res.ok) {
        dispatch(streamFailed({ conversationId }));
        return rejectWithValue({
          orgId,
          conversationId,
          query,
          usageExceeded: data.error === 'usage_exceeded',
          message: data.error || data.detail || 'Failed to get a reply from the assistant.',
        });
      }

      if (res.status === 202) {
        // Embeddings/memory still processing — show the friendly notice as
        // a transient assistant message rather than an error toast.
        dispatch(showTransientNotice({ conversationId, text: data.answer }));
        return { orgId, conversationId, query };
      }

      dispatch(finalizeStreamedMessage({
        orgId,
        conversationId,
        query,
        text: data.answer ?? 'No answer returned from assistant.',
        meta: { sources: data.sources ?? [], route: data.route ?? null },
      }));
      return { orgId, conversationId, query };
    }

    if (!res.ok || !res.body) {
      dispatch(streamFailed({ conversationId }));
      return rejectWithValue({ orgId, conversationId, query, message: 'Failed to get a reply from the assistant.' });
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let doneEvent = null;
    let errorEvent = null;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let sepIndex;
      while ((sepIndex = buffer.indexOf('\n\n')) !== -1) {
        const rawFrame = buffer.slice(0, sepIndex);
        buffer = buffer.slice(sepIndex + 2);
        const payload = parseSseFrame(rawFrame);
        if (!payload) continue;

        if (payload.type === 'chunk') {
          dispatch(streamChunkReceived({ conversationId, delta: payload.text }));
        } else if (payload.type === 'done') {
          doneEvent = payload;
        } else if (payload.type === 'error') {
          errorEvent = payload;
        }
      }
    }

    if (errorEvent) {
      dispatch(streamFailed({ conversationId }));
      return rejectWithValue({
        orgId,
        conversationId,
        query,
        message: errorEvent.detail || errorEvent.error || 'Failed to get a reply from the assistant.',
      });
    }

    if (!doneEvent) {
      dispatch(streamFailed({ conversationId }));
      return rejectWithValue({ orgId, conversationId, query, message: 'The response ended unexpectedly.' });
    }

    dispatch(finalizeStreamedMessage({
      orgId,
      conversationId,
      query,
      text: null, // keep the text already accumulated via streamChunkReceived
      meta: { sources: doneEvent.sources ?? [], route: doneEvent.route ?? null },
    }));
    return { orgId, conversationId, query };
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

const findStreamingMessage = (state, conversationId) => {
  if (String(state.activeConversation.id) !== String(conversationId) || !state.activeConversation.data) {
    return null;
  }
  return state.activeConversation.data.messages.find((m) => m.id === 'temp-streaming') || null;
};

const bumpConversationInList = (state, orgId, conversationId, query, previewText) => {
  const bucket = ensureOrgBucket(state, orgId);
  const item = bucket.items.find((c) => String(c.id) === String(conversationId));
  if (item) {
    if (!item.title) item.title = query.trim().slice(0, 80);
    item.last_message_preview = { sender: 'assistant', text: (previewText || '').slice(0, 140) };
    item.updated_at = new Date().toISOString();
    bucket.items = [item, ...bucket.items.filter((c) => String(c.id) !== String(conversationId))];
  }
};

const aiChatSlice = createSlice({
  name: 'aiChat',
  initialState,
  reducers: {
    resetActiveConversation: (state) => {
      state.activeConversation = { ...initialActiveConversation };
    },
    // A text delta arrived over SSE for the in-flight assistant reply.
    streamChunkReceived: (state, action) => {
      const { conversationId, delta } = action.payload;
      const msg = findStreamingMessage(state, conversationId);
      if (msg) {
        msg.text += delta;
        msg.typing = false; // first byte arrived — stop showing the dots
      }
    },
    // The assistant reply is complete — either streamed (text stays as
    // already-accumulated, pass text: null) or delivered as one JSON body
    // (pass the full text).
    finalizeStreamedMessage: (state, action) => {
      const { orgId, conversationId, query, text, meta } = action.payload;
      const msg = findStreamingMessage(state, conversationId);
      if (msg) {
        if (text !== null && text !== undefined) msg.text = text;
        msg.id = `assistant-${Date.now()}`;
        msg.typing = false;
        msg.streaming = false;
        msg.meta = meta;
        msg.created_at = new Date().toISOString();
      }
      if (state.activeConversation.data && !state.activeConversation.data.title) {
        state.activeConversation.data.title = query.trim().slice(0, 80);
      }
      bumpConversationInList(state, orgId, conversationId, query, msg?.text);
    },
    // Embeddings/memory still processing (202) — show the server's friendly
    // notice as a transient assistant message; doesn't count as a real
    // answer, so it doesn't touch the title or the sidebar preview.
    showTransientNotice: (state, action) => {
      const { conversationId, text } = action.payload;
      const msg = findStreamingMessage(state, conversationId);
      if (msg) {
        msg.text = text || 'Still processing — please try again shortly.';
        msg.id = `notice-${Date.now()}`;
        msg.typing = false;
        msg.streaming = false;
        msg.created_at = new Date().toISOString();
      }
    },
    // Generation failed or the connection dropped mid-stream — drop the
    // in-progress placeholder rather than leaving a stuck typing indicator.
    streamFailed: (state, action) => {
      const { conversationId } = action.payload;
      if (String(state.activeConversation.id) !== String(conversationId) || !state.activeConversation.data) return;
      state.activeConversation.data.messages = state.activeConversation.data.messages.filter(
        (m) => m.id !== 'temp-streaming'
      );
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

      // Send query — message-array mutations happen via the streamChunkReceived/
      // finalizeStreamedMessage/showTransientNotice/streamFailed reducers above,
      // dispatched from inside the thunk as the stream progresses. These
      // extraReducers only own the pending/sending/error bookkeeping.
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
            id: 'temp-streaming',
            sender: 'assistant',
            text: '',
            typing: true,
            streaming: true,
          });
        }
        state.activeConversation.sending = true;
        state.activeConversation.error = null;
      })
      .addCase(sendQuery.fulfilled, (state) => {
        state.activeConversation.sending = false;
      })
      .addCase(sendQuery.rejected, (state, action) => {
        state.activeConversation.sending = false;
        state.activeConversation.error = action.payload?.message || 'Failed to get a reply from the assistant.';
      });
  },
});

export const {
  resetActiveConversation,
  streamChunkReceived,
  finalizeStreamedMessage,
  showTransientNotice,
  streamFailed,
} = aiChatSlice.actions;

export const selectConversations = (state, orgId) => state.aiChat.conversationsByOrg[orgId]?.items || [];
export const selectConversationsStatus = (state, orgId) => state.aiChat.conversationsByOrg[orgId]?.status || 'idle';
export const selectActiveConversation = (state) => state.aiChat.activeConversation;

export default aiChatSlice.reducer;
