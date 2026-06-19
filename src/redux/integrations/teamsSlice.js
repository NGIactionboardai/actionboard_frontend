import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getAuthHeaders = (getState) => {
  const token = getState().auth.token;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const extractErrorMessage = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error) return error.response.data.error;
  if (error.response?.data?.detail) return error.response.data.detail;
  if (error.message) return error.message;
  return 'Something went wrong';
};


// =====================================================
// Thunks
// =====================================================

export const startTeamsOAuth = createAsyncThunk(
  'teams/startOAuth',
  async (_, { rejectWithValue, getState }) => {
    try {
      const headers = getAuthHeaders(getState);
      const res = await axios.get(
        `${API_BASE_URL}/integrations/teams/oauth/start/`,
        { headers }
      );
      return res.data; // { auth_url }
    } catch (error) {
      return rejectWithValue({
        message: extractErrorMessage(error),
        code: error.response?.status,
      });
    }
  }
);

export const fetchTeamsStatus = createAsyncThunk(
  'teams/fetchStatus',
  async (_, { rejectWithValue, getState }) => {
    try {
      const headers = getAuthHeaders(getState);
      const res = await axios.get(
        `${API_BASE_URL}/integrations/teams/status/`,
        { headers }
      );
      return res.data;
    } catch (error) {
      return rejectWithValue({
        message: extractErrorMessage(error),
        code: error.response?.status,
      });
    }
  }
);

export const disconnectTeams = createAsyncThunk(
  'teams/disconnect',
  async (_, { rejectWithValue, getState }) => {
    try {
      const headers = getAuthHeaders(getState);
      const res = await axios.delete(
        `${API_BASE_URL}/integrations/teams/disconnect/`,
        { headers }
      );
      return res.data;
    } catch (error) {
      return rejectWithValue({
        message: extractErrorMessage(error),
        code: error.response?.status,
      });
    }
  }
);


// =====================================================
// Slice
// =====================================================

const initialState = {
  connected: false,
  email: null,
  name: null,
  lastSyncedAt: null,

  loading: false,
  error: null,
  successMessage: null,
};

const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    clearTeamsMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    resetTeamsState: () => initialState,
  },
  extraReducers: (builder) => {

    // Start OAuth
    builder
      .addCase(startTeamsOAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startTeamsOAuth.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = 'Redirecting to Microsoft...';
      })
      .addCase(startTeamsOAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to start Teams OAuth';
      });

    // Fetch Status
    builder
      .addCase(fetchTeamsStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeamsStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.connected = action.payload.connected;
        if (action.payload.connected) {
          state.email = action.payload.email;
          state.name = action.payload.name;
          state.lastSyncedAt = action.payload.last_synced_at;
        } else {
          state.email = null;
          state.name = null;
          state.lastSyncedAt = null;
        }
      })
      .addCase(fetchTeamsStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch Teams status';
      });

    // Disconnect
    builder
      .addCase(disconnectTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(disconnectTeams.fulfilled, (state) => {
        state.loading = false;
        state.connected = false;
        state.email = null;
        state.name = null;
        state.lastSyncedAt = null;
        state.successMessage = 'Microsoft Teams disconnected successfully';
      })
      .addCase(disconnectTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to disconnect Teams';
      });
  },
});


// =====================================================
// Exports
// =====================================================

export const { clearTeamsMessages, resetTeamsState } = teamsSlice.actions;

export const selectTeamsIsConnected = (state) => state.teams.connected;
export const selectTeamsEmail = (state) => state.teams.email;
export const selectTeamsName = (state) => state.teams.name;
export const selectTeamsLoading = (state) => state.teams.loading;
export const selectTeamsError = (state) => state.teams.error;
export const selectTeamsSuccessMessage = (state) => state.teams.successMessage;

export default teamsSlice.reducer;
