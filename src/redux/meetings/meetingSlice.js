import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'https://actionboard-ai-backend.onrender.com/api';

// helper
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
  return error.message || 'Something went wrong';
};



// ======================================
// 🚀 CREATE MEETING (Unified)
// ======================================
export const createMeeting = createAsyncThunk(
  'meeting/createMeeting',
  async ({ organizationId, data }, { rejectWithValue, getState }) => {
    try {
      const headers = getAuthHeaders(getState);

      const res = await axios.post(
        `${API_BASE_URL}/meetings/create-meetings/${organizationId}/`,
        data,
        { headers }
      );

      return res.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);


export const getMeetings = createAsyncThunk(
  'meeting/getMeetings',
  async (organizationId, { rejectWithValue, getState }) => {
    try {
      const headers = getAuthHeaders(getState);

      if (!organizationId) {
        return rejectWithValue('Organization ID is required');
      }

      const res = await axios.get(
        `${API_BASE_URL}/meetings/zoom/list-meetings/${organizationId}/`,
        { headers }
      );

      return res.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);



export const updateMeeting = createAsyncThunk(
  'meeting/updateMeeting',
  async ({ organizationId, meetingId, data }, { rejectWithValue, getState }) => {
    try {
      const headers = getAuthHeaders(getState);

      const res = await axios.patch(
        `${API_BASE_URL}/meetings/meeting/${organizationId}/${meetingId}/update/`,
        data,
        { headers }
      );

      return {
        meetingId,
        data,
        response: res.data
      };
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);



export const deleteMeeting = createAsyncThunk(
  'meeting/deleteMeeting',
  async ({ meetingId }, { rejectWithValue, getState }) => {
    try {
      const headers = getAuthHeaders(getState);

      await axios.delete(
        `${API_BASE_URL}/meetings/meeting/${meetingId}/delete/`,
        { headers }
      );

      return meetingId;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);



// ======================================
// 🧠 SLICE
// ======================================
const meetingSlice = createSlice({
  name: 'meeting',
  initialState: {
    meetings: [],
    currentMeeting: null,

    loading: false,
    error: null,
    successMessage: null,
  },

  reducers: {
    clearMeetingMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },

  extraReducers: (builder) => {

    // CREATE
    builder
      .addCase(createMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMeeting.fulfilled, (state, action) => {
        state.loading = false;

        const meeting = action.payload.meeting;
        state.meetings.push(meeting);
        state.currentMeeting = meeting;

        state.successMessage = "Meeting created successfully";
      })
      .addCase(createMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create meeting";
      });


      builder
      .addCase(getMeetings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMeetings.fulfilled, (state, action) => {
        state.loading = false;
        state.meetings = action.payload.meetings || [];
      })
      .addCase(getMeetings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch meetings';
      });


      builder
      .addCase(updateMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMeeting.fulfilled, (state, action) => {
        state.loading = false;

        const { meetingId, data } = action.payload;

        const index = state.meetings.findIndex(m => m.id === meetingId);

        if (index !== -1) {
          state.meetings[index] = {
            ...state.meetings[index],
            ...data,
          };
        }

        state.successMessage = "Meeting updated successfully";
      })
      .addCase(updateMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update meeting";
      });


      builder
      .addCase(deleteMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMeeting.fulfilled, (state, action) => {
        state.loading = false;

        state.meetings = state.meetings.filter(
          (m) => m.id !== action.payload
        );

        state.successMessage = "Meeting deleted successfully";
      })
      .addCase(deleteMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete meeting";
      });

  },
});

export const { clearMeetingMessages } = meetingSlice.actions;

export const selectMeetings = (state) => state.meeting.meetings;
export const selectMeetingLoading = (state) => state.meeting.loading;
export const selectMeetingError = (state) => state.meeting.error;

export default meetingSlice.reducer;