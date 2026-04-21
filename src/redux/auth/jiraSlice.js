import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '@/utils/axios'; // IMPORTANT: use global axios

// ======================
// THUNKS
// ======================

// 1. Check connection status
export const getJiraConnectionStatus = createAsyncThunk(
  'jira/getStatus',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/integrations/jira/status/');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Error fetching Jira status');
    }
  }
);

// 2. Start OAuth
export const startJiraOAuth = createAsyncThunk(
  'jira/startOAuth',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/integrations/jira/oauth/start/');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Error starting OAuth');
    }
  }
);

// 3. Get workspace mappings + projects
export const getJiraWorkspaceMappings = createAsyncThunk(
  'jira/getMappings',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/integrations/jira/workspace-mappings/');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Error fetching mappings');
    }
  }
);

// 4. Save mappings
export const saveJiraWorkspaceMappings = createAsyncThunk(
  'jira/saveMappings',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/integrations/jira/map-workspaces/', payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Error saving mappings');
    }
  }
);

// 5. Manual sync
export const syncJiraMeeting = createAsyncThunk(
  'jira/syncMeeting',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/integrations/jira/sync-meeting/', payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Error syncing meeting');
    }
  }
);

// 6. Disconnect
export const disconnectJira = createAsyncThunk(
  'jira/disconnect',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/integrations/jira/disconnect/');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Error disconnecting Jira');
    }
  }
);

// ======================
// INITIAL STATE
// ======================

const initialState = {
  isConnected: false,
  siteName: null,
  siteUrl: null,

  workspaces: [],
  jiraProjects: [],

  loading: false,
  error: null,
  successMessage: null,

  showConnectionModal: false,
  showDisconnectModal: false,
};

// ======================
// SLICE
// ======================

const jiraSlice = createSlice({
  name: 'jira',
  initialState,
  reducers: {
    setShowJiraConnectionModal: (state, action) => {
      state.showConnectionModal = action.payload;
    },
    setShowJiraDisconnectModal: (state, action) => {
      state.showDisconnectModal = action.payload;
    },
    clearJiraMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // STATUS
      .addCase(getJiraConnectionStatus.fulfilled, (state, action) => {
        state.isConnected = action.payload.connected;

        if (action.payload.connected) {
          state.siteName = action.payload.site_name;
          state.siteUrl = action.payload.site_url;
        }
      })

      // OAUTH
      .addCase(startJiraOAuth.fulfilled, (_, action) => {
        window.location.href = action.payload.auth_url;
      })

      // MAPPINGS
      .addCase(getJiraWorkspaceMappings.fulfilled, (state, action) => {
        state.workspaces = action.payload.workspaces || [];
        state.jiraProjects = action.payload.jira_projects || [];
      })

      // SAVE MAPPINGS
      .addCase(saveJiraWorkspaceMappings.fulfilled, (state) => {
        state.successMessage = 'Mappings saved successfully';
      })

      // SYNC
      .addCase(syncJiraMeeting.fulfilled, (state) => {
        state.successMessage = 'Sync triggered';
      })

      // DISCONNECT
      .addCase(disconnectJira.fulfilled, (state) => {
        state.isConnected = false;
        state.siteName = null;
        state.siteUrl = null;
        state.workspaces = [];
        state.jiraProjects = [];
        state.successMessage = 'Jira disconnected';
      })

      // COMMON
      .addMatcher(
        (action) => action.type.startsWith('jira/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('jira/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || 'Something went wrong';
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('jira/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        }
      );
  },
});

// ======================
// EXPORTS
// ======================

export const {
  setShowJiraConnectionModal,
  setShowJiraDisconnectModal,
  clearJiraMessages,
} = jiraSlice.actions;

// SELECTORS
export const selectJiraIsConnected = (state) => state.jira.isConnected;
export const selectJiraProjects = (state) => state.jira.jiraProjects;
export const selectJiraWorkspaces = (state) => state.jira.workspaces;
export const selectJiraLoading = (state) => state.jira.loading;
export const selectJiraError = (state) => state.jira.error;
export const selectJiraSuccessMessage = (state) => state.jira.successMessage;
export const selectJiraSiteName = (state) => state.jira.siteName;
export const selectJiraSiteUrl = (state) => state.jira.siteUrl;
export default jiraSlice.reducer;
