import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// ✅ Base URL
const API_BASE_URL = 'https://actionboard-ai-backend.onrender.com/api';

// ✅ Helper: Auth headers
const getAuthHeaders = (getState) => {
  const token = getState().auth.token;

  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// ✅ Helper: Error extraction (reuse pattern)
const extractErrorMessage = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error) return error.response.data.error;
  if (error.response?.data?.detail) return error.response.data.detail;
  if (error.message) return error.message;
  return 'Something went wrong';
};


// =====================================================
// 🚀 Thunks
// =====================================================

// 1. Start OAuth
export const startGoogleOAuth = createAsyncThunk(
  'googleCalendar/startOAuth',
  async (_, { rejectWithValue, getState }) => {
    try {
      const headers = getAuthHeaders(getState);

      const res = await axios.get(
        `${API_BASE_URL}/integrations/google/calendar/oauth/start/`,
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


// 2. Get Status
export const fetchGoogleStatus = createAsyncThunk(
  'googleCalendar/fetchStatus',
  async (_, { rejectWithValue, getState }) => {
    try {
      const headers = getAuthHeaders(getState);

      const res = await axios.get(
        `${API_BASE_URL}/integrations/google/calendar/status/`,
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


// 3. Disconnect
export const disconnectGoogle = createAsyncThunk(
  'googleCalendar/disconnect',
  async (_, { rejectWithValue, getState }) => {
    try {
      const headers = getAuthHeaders(getState);

      const res = await axios.delete(
        `${API_BASE_URL}/integrations/google/calendar/disconnect/`,
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
// 🧠 Slice
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

const googleCalendarSlice = createSlice({
  name: 'googleCalendar',
  initialState,
  reducers: {
    clearGoogleMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    resetGoogleState: () => initialState,
  },
  extraReducers: (builder) => {

    // =========================
    // Start OAuth
    // =========================
    builder
      .addCase(startGoogleOAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startGoogleOAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Redirecting to Google...';
      })
      .addCase(startGoogleOAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to start Google OAuth';
      });


    // =========================
    // Fetch Status
    // =========================
    builder
      .addCase(fetchGoogleStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoogleStatus.fulfilled, (state, action) => {
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
      .addCase(fetchGoogleStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch Google status';
      });


    // =========================
    // Disconnect
    // =========================
    builder
      .addCase(disconnectGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(disconnectGoogle.fulfilled, (state) => {
        state.loading = false;

        state.connected = false;
        state.email = null;
        state.name = null;
        state.lastSyncedAt = null;

        state.successMessage = 'Google disconnected successfully';
      })
      .addCase(disconnectGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to disconnect Google';
      });
  },
});


// =====================================================
// 📦 Exports
// =====================================================

export const {
  clearGoogleMessages,
  resetGoogleState,
} = googleCalendarSlice.actions;


// Selectors
export const selectGoogleIsConnected = (state) => state.googleCalendar.connected;
export const selectGoogleEmail = (state) => state.googleCalendar.email;
export const selectGoogleName = (state) => state.googleCalendar.name;
export const selectGoogleLoading = (state) => state.googleCalendar.loading;
export const selectGoogleError = (state) => state.googleCalendar.error;
export const selectGoogleSuccessMessage = (state) => state.googleCalendar.successMessage;

export default googleCalendarSlice.reducer;