import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ======================
// THUNKS
// ======================

export const fetchSlackStatus = createAsyncThunk(
  'slack/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/integrations/slack/status/`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data || 'Error fetching Slack status'
      );
    }
  }
);

export const fetchSlackWorkspaces = createAsyncThunk(
  'slack/fetchWorkspaces',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/integrations/slack/workspaces/`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data || 'Error fetching Slack workspaces'
      );
    }
  }
);

export const fetchSlackMappings = createAsyncThunk(
  'slack/fetchMappings',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/integrations/slack/mappings/`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data || 'Error fetching Slack mappings'
      );
    }
  }
);

export const startSlackOAuth = createAsyncThunk(
  'slack/startOAuth',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/integrations/slack/oauth/start/`);
      if (res.data?.auth_url) {
        window.location.href = res.data.auth_url;
      }
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data || 'Error starting Slack OAuth'
      );
    }
  }
);

export const disconnectSlackWorkspace = createAsyncThunk(
  'slack/disconnectWorkspace',
  async (workspaceId, { rejectWithValue }) => {
    try {
      const res = await axios.delete(
        `${API_BASE_URL}/integrations/slack/workspaces/${workspaceId}/disconnect/`
      );
      return { ...res.data, workspaceId };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data || 'Error disconnecting Slack workspace'
      );
    }
  }
);

export const createSlackMapping = createAsyncThunk(
  'slack/createMapping',
  async ({ org_id, workspace_id }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/integrations/slack/mappings/create/`, {
        org_id,
        workspace_id,
      });
      return res.data;
    } catch (err) {
      const status = err.response?.status;
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        'Error creating Slack mapping';
      return rejectWithValue({ message, status });
    }
  }
);

export const removeSlackMapping = createAsyncThunk(
  'slack/removeMapping',
  async (mappingId, { rejectWithValue }) => {
    try {
      const res = await axios.delete(
        `${API_BASE_URL}/integrations/slack/mappings/${mappingId}/delete/`
      );
      return { ...res.data, mappingId };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data || 'Error removing Slack mapping'
      );
    }
  }
);

export const updateSlackChannel = createAsyncThunk(
  'slack/updateChannel',
  async ({ mappingId, channel_id, channel_name }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/integrations/slack/mappings/${mappingId}/channel/`,
        { channel_id, channel_name }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data || 'Error updating Slack channel'
      );
    }
  }
);

// ======================
// INITIAL STATE
// ======================

const initialState = {
  connected: false,
  workspaceCount: 0,
  mappedOrgCount: 0,

  workspaces: [],
  mappings: [],

  statusLoading: false,
  workspacesLoading: false,
  mappingsLoading: false,
  actionLoading: false,

  error: null,
  successMessage: null,
};

// ======================
// SLICE
// ======================

const slackSlice = createSlice({
  name: 'slack',
  initialState,
  reducers: {
    clearSlackMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // STATUS
      .addCase(fetchSlackStatus.pending, (state) => {
        state.statusLoading = true;
      })
      .addCase(fetchSlackStatus.fulfilled, (state, action) => {
        state.statusLoading = false;
        state.connected = !!action.payload.connected;
        state.workspaceCount = action.payload.workspace_count || 0;
        state.mappedOrgCount = action.payload.mapped_org_count || 0;
      })
      .addCase(fetchSlackStatus.rejected, (state) => {
        state.statusLoading = false;
      })

      // WORKSPACES
      .addCase(fetchSlackWorkspaces.pending, (state) => {
        state.workspacesLoading = true;
      })
      .addCase(fetchSlackWorkspaces.fulfilled, (state, action) => {
        state.workspacesLoading = false;
        state.workspaces = action.payload;
        state.workspaceCount = action.payload.length;
        state.connected = action.payload.length > 0;
      })
      .addCase(fetchSlackWorkspaces.rejected, (state) => {
        state.workspacesLoading = false;
      })

      // MAPPINGS
      .addCase(fetchSlackMappings.pending, (state) => {
        state.mappingsLoading = true;
      })
      .addCase(fetchSlackMappings.fulfilled, (state, action) => {
        state.mappingsLoading = false;
        state.mappings = action.payload;
        state.mappedOrgCount = action.payload.length;
      })
      .addCase(fetchSlackMappings.rejected, (state) => {
        state.mappingsLoading = false;
      })

      // OAUTH
      .addCase(startSlackOAuth.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(startSlackOAuth.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(startSlackOAuth.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // DISCONNECT WORKSPACE
      .addCase(disconnectSlackWorkspace.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(disconnectSlackWorkspace.fulfilled, (state, action) => {
        state.actionLoading = false;
        const id = action.payload.workspaceId;
        const workspace = state.workspaces.find((ws) => ws.id === id);
        const teamId = workspace?.team_id;
        state.workspaces = state.workspaces.filter((ws) => ws.id !== id);
        if (teamId) {
          state.mappings = state.mappings.filter((m) => m.workspace_team_id !== teamId);
        }
        state.workspaceCount = state.workspaces.length;
        state.connected = state.workspaces.length > 0;
        state.mappedOrgCount = state.mappings.length;
        state.successMessage = action.payload.message || 'Slack workspace disconnected.';
      })
      .addCase(disconnectSlackWorkspace.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // CREATE MAPPING
      .addCase(createSlackMapping.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createSlackMapping.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.mappings = [...state.mappings, action.payload];
        state.mappedOrgCount = state.mappings.length;
        // Increment mapped_org_count on the relevant workspace
        const teamId = action.payload.workspace_team_id;
        state.workspaces = state.workspaces.map((ws) =>
          ws.team_id === teamId
            ? { ...ws, mapped_org_count: (ws.mapped_org_count || 0) + 1 }
            : ws
        );
      })
      .addCase(createSlackMapping.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload?.message || 'Error creating Slack mapping';
      })

      // REMOVE MAPPING
      .addCase(removeSlackMapping.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(removeSlackMapping.fulfilled, (state, action) => {
        state.actionLoading = false;
        const removed = state.mappings.find((m) => m.id === action.payload.mappingId);
        state.mappings = state.mappings.filter((m) => m.id !== action.payload.mappingId);
        state.mappedOrgCount = state.mappings.length;
        if (removed) {
          state.workspaces = state.workspaces.map((ws) =>
            ws.team_id === removed.workspace_team_id
              ? { ...ws, mapped_org_count: Math.max(0, (ws.mapped_org_count || 1) - 1) }
              : ws
          );
        }
        state.successMessage = action.payload.message || 'Slack org mapping removed.';
      })
      .addCase(removeSlackMapping.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // UPDATE CHANNEL
      .addCase(updateSlackChannel.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(updateSlackChannel.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updated = action.payload;
        state.mappings = state.mappings.map((m) => (m.id === updated.id ? updated : m));
        state.successMessage = 'Default channel updated.';
      })
      .addCase(updateSlackChannel.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

// ======================
// EXPORTS
// ======================

export const { clearSlackMessages } = slackSlice.actions;

export const selectSlackConnected = (state) => state.slack.connected;
export const selectSlackWorkspaceCount = (state) => state.slack.workspaceCount;
export const selectSlackMappedOrgCount = (state) => state.slack.mappedOrgCount;
export const selectSlackWorkspaces = (state) => state.slack.workspaces;
export const selectSlackMappings = (state) => state.slack.mappings;
export const selectSlackStatusLoading = (state) => state.slack.statusLoading;
export const selectSlackWorkspacesLoading = (state) => state.slack.workspacesLoading;
export const selectSlackMappingsLoading = (state) => state.slack.mappingsLoading;
export const selectSlackActionLoading = (state) => state.slack.actionLoading;
export const selectSlackError = (state) => state.slack.error;
export const selectSlackSuccessMessage = (state) => state.slack.successMessage;

export default slackSlice.reducer;
