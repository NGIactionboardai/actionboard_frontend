import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Base URL for your backend
const API_BASE_URL = 'https://actionboard-backend-1.onrender.com/api';
const API_BASE_URL2 = 'https://actionboard-backend-1.onrender.com/api';

// Helper function to get auth headers from Redux state
const getAuthHeaders = (getState) => {
  const token = getState().auth.token;
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Helper function to extract error message
const extractErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Async thunks for Zoom integration with organization support
export const initiateZoomAuth = createAsyncThunk(
  'zoom/initiateAuth',
  async (organizationId, { rejectWithValue, getState }) => {
    try {
      const headers = getAuthHeaders(getState);
      
      if (!organizationId) {
        return rejectWithValue({ message: 'Organization ID is required' });
      }
      
      const response = await axios.get(`${API_BASE_URL}/integrations/zoom/oauth/start/`, {
        headers,
        params: {
          org_id: organizationId
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Zoom auth initiation error:', error);
      const message = extractErrorMessage(error);
      return rejectWithValue({ message, code: error.response?.status });
    }
  }
);

export const handleZoomCallback = createAsyncThunk(
  'zoom/handleCallback',
  async ({ code, state, organizationId }, { rejectWithValue, getState }) => {
    try {
      // Since your Django view handles this via URL params and redirects,
      // we'll just make a request to check the status after callback
      // The actual OAuth flow is handled by the redirect in your Django view
      
      // Wait a moment for the backend to process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check connection status to see if the OAuth was successful
      const headers = getAuthHeaders(getState);
      const statusResponse = await axios.get(`${API_BASE_URL}/integrations/zoom/status/`, {
        headers,
        params: {
          org_id: organizationId
        }
      });
      
      if (statusResponse.data.is_connected) {
        return {
          success: true,
          user_info: statusResponse.data.user_info,
          token_expiry: statusResponse.data.token_expiry,
          message: 'Successfully connected to Zoom!'
        };
      } else {
        throw new Error('OAuth callback completed but connection was not established');
      }
    } catch (error) {
      console.error('Zoom callback handling error:', error);
      const message = extractErrorMessage(error);
      return rejectWithValue({ message, code: error.response?.status });
    }
  }
);

export const getZoomConnectionStatus = createAsyncThunk(
  'zoom/getConnectionStatus',
  async (organizationId, { rejectWithValue, getState }) => {
    try {
      const headers = getAuthHeaders(getState);
      
      if (!organizationId) {
        return rejectWithValue({ message: 'Organization ID is required' });
      }
      
      const response = await axios.get(`${API_BASE_URL}/integrations/zoom/status/`, {
        headers,
        params: {
          org_id: organizationId
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Zoom connection status error:', error);
      
      // If the endpoint doesn't exist (404), return disconnected status
      if (error.response?.status === 404) {
        return {
          is_connected: false,
          user_info: null,
          token_expiry: null,
          is_token_expired: false,
        };
      }
      
      const message = extractErrorMessage(error);
      return rejectWithValue({ message, code: error.response?.status });
    }
  }
);

export const disconnectZoom = createAsyncThunk(
  'zoom/disconnect',
  async (organizationId, { rejectWithValue, getState }) => {
    try {
      const headers = getAuthHeaders(getState);
      
      if (!organizationId) {
        return rejectWithValue({ message: 'Organization ID is required' });
      }
      
      const response = await axios.post(`${API_BASE_URL}/integrations/zoom/disconnect/`, {
        org_id: organizationId
      }, {
        headers,
      });
      
      return response.data;
    } catch (error) {
      console.error('Zoom disconnect error:', error);
      const message = extractErrorMessage(error);
      return rejectWithValue({ message, code: error.response?.status });
    }
  }
);

export const refreshZoomToken = createAsyncThunk(
  'zoom/refreshToken',
  async (organizationId, { rejectWithValue, getState }) => {
    try {
      const headers = getAuthHeaders(getState);
      
      if (!organizationId) {
        return rejectWithValue({ message: 'Organization ID is required' });
      }
      
      const response = await axios.post(`${API_BASE_URL}/integrations/zoom/refresh-token/`, {
        org_id: organizationId
      }, {
        headers,
      });
      
      return response.data;
    } catch (error) {
      console.error('Zoom token refresh error:', error);
      const message = extractErrorMessage(error);
      return rejectWithValue({ message, code: error.response?.status });
    }
  }
);

// Updated createZoomMeeting action to match your backend API
export const createZoomMeeting = createAsyncThunk(
  'zoom/createMeeting',
  async ({ meetingData, organizationId }, { rejectWithValue, getState }) => {
    try {
      const headers = getAuthHeaders(getState);
      
      if (!organizationId) {
        return rejectWithValue({ message: 'Organization ID is required' });
      }
      
      // Use the correct API endpoint that matches your backend
      const response = await axios.post(
        `${API_BASE_URL2}/meetings/zoom/create-meetings/${organizationId}/`,
        meetingData,
        { headers }
      );
      
      return response.data;
    } catch (error) {
      console.error('Zoom meeting creation error:', error);
      const message = extractErrorMessage(error);
      return rejectWithValue({ message, code: error.response?.status });
    }
  }
);

// In your zoomSlice.js, update the getZoomMeetings thunk:
export const getZoomMeetings = createAsyncThunk(
  'zoom/getMeetings',
  async (organizationId, { rejectWithValue, getState }) => {
    try {
      const headers = getAuthHeaders(getState);
      
      if (!organizationId) {
        return rejectWithValue({ message: 'Organization ID is required' });
      }
      
      // Use organization ID in the URL
      const response = await axios.get(`${API_BASE_URL2}/meetings/zoom/list-meetings/${organizationId}/`, {
        headers,
      });
      
      return response.data;
    } catch (error) {
      console.error('Zoom meetings fetch error:', error);
      const message = extractErrorMessage(error);
      return rejectWithValue({ message, code: error.response?.status });
    }
  }
);

export const updateZoomMeeting = createAsyncThunk(
  'zoom/updateMeeting',
  async ({ meetingId, updateData, organizationId }, { rejectWithValue, getState }) => {
    try {
      const headers = getAuthHeaders(getState);
      
      if (!organizationId) {
        return rejectWithValue({ message: 'Organization ID is required' });
      }
      
      const response = await axios.patch(`${API_BASE_URL}/integrations/zoom/meetings/${meetingId}/`, {
        ...updateData,
        org_id: organizationId
      }, {
        headers,
      });
      
      return response.data;
    } catch (error) {
      console.error('Zoom meeting update error:', error);
      const message = extractErrorMessage(error);
      return rejectWithValue({ message, code: error.response?.status });
    }
  }
);

export const deleteZoomMeeting = createAsyncThunk(
  'zoom/deleteMeeting',
  async ({ meetingId, organizationId }, { rejectWithValue, getState }) => {
    try {
      const headers = getAuthHeaders(getState);
      
      if (!organizationId) {
        return rejectWithValue({ message: 'Organization ID is required' });
      }
      
      await axios.delete(`${API_BASE_URL}/integrations/zoom/meetings/${meetingId}/`, {
        headers,
        data: {
          org_id: organizationId
        }
      });
      
      return { meetingId };
    } catch (error) {
      console.error('Zoom meeting deletion error:', error);
      const message = extractErrorMessage(error);
      return rejectWithValue({ message, code: error.response?.status });
    }
  }
);

export const getMeetingDetails = createAsyncThunk(
  'zoom/getMeetingDetails',
  async ({ meetingId, organizationId }, { rejectWithValue, getState }) => {
    try {
      const headers = getAuthHeaders(getState);
      
      if (!organizationId) {
        return rejectWithValue({ message: 'Organization ID is required' });
      }
      
      // Use the correct API endpoint that matches your backend
      const response = await axios.get(
        `${API_BASE_URL2}/meetings/zoom/meeting-details/${meetingId}/`,
        { 
          headers,
          params: {
            org_id: organizationId
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Meeting details fetch error:', error);
      const message = extractErrorMessage(error);
      return rejectWithValue({ message, code: error.response?.status });
    }
  }
);

const initialState = {
  // Connection status
  isConnected: false,
  connectionStatus: 'disconnected', // 'disconnected', 'connecting', 'connected', 'error'
  
  // User info
  userInfo: null,
  
  // Auth data
  authUrl: null,
  accessToken: null,
  refreshToken: null,
  tokenExpiry: null,
  
  // Organization context
  currentOrganizationId: null,
  
  // Integrations
  integrations: [],
  
  // Meetings
  meetings: [],
  currentMeeting: null,
  
  // UI state
  loading: false,
  error: null,
  successMessage: null,
  
  // Modal state
  showConnectionModal: false,
  showDisconnectModal: false,
};

const zoomSlice = createSlice({
  name: 'zoom',
  initialState,
  reducers: {
    // UI actions
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    setShowConnectionModal: (state, action) => {
      state.showConnectionModal = action.payload;
    },
    setShowDisconnectModal: (state, action) => {
      state.showDisconnectModal = action.payload;
    },
    resetZoomState: (state) => {
      return { ...initialState };
    },
    
    // Connection management
    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload;
    },
    
    // Organization management
    setCurrentOrganization: (state, action) => {
      state.currentOrganizationId = action.payload;
    },
    
    // Meeting management
    setCurrentMeeting: (state, action) => {
      state.currentMeeting = action.payload;
    },
    addMeeting: (state, action) => {
      state.meetings.push(action.payload);
    },
    updateMeetingInState: (state, action) => {
      const index = state.meetings.findIndex(meeting => meeting.id === action.payload.id);
      if (index !== -1) {
        state.meetings[index] = { ...state.meetings[index], ...action.payload };
      }
    },
    removeMeetingFromState: (state, action) => {
      state.meetings = state.meetings.filter(meeting => meeting.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Initiate Zoom Auth
    builder
      .addCase(initiateZoomAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.connectionStatus = 'connecting';
      })
      .addCase(initiateZoomAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.authUrl = action.payload.authorize_url;
        state.successMessage = 'Redirecting to Zoom for authentication...';
      })
      .addCase(initiateZoomAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to initiate Zoom authentication';
        state.connectionStatus = 'error';
      });

    // Handle Zoom Callback
    builder
      .addCase(handleZoomCallback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(handleZoomCallback.fulfilled, (state, action) => {
        state.loading = false;
        state.isConnected = true;
        state.connectionStatus = 'connected';
        state.userInfo = action.payload.user_info;
        state.tokenExpiry = action.payload.token_expiry;
        state.successMessage = action.payload.message;
        state.showConnectionModal = false;
      })
      .addCase(handleZoomCallback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to complete Zoom authentication';
        state.connectionStatus = 'error';
      });

    // Get Connection Status
    builder
      .addCase(getZoomConnectionStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getZoomConnectionStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isConnected = action.payload.is_connected;
        state.connectionStatus = action.payload.is_connected ? 'connected' : 'disconnected';
        if (action.payload.is_connected) {
          state.userInfo = action.payload.user_info;
          state.tokenExpiry = action.payload.token_expiry;
        } else {
          state.userInfo = null;
          state.tokenExpiry = null;
        }
      })
      .addCase(getZoomConnectionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to get connection status';
        state.connectionStatus = 'error';
      });

    // Disconnect Zoom
    builder
      .addCase(disconnectZoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(disconnectZoom.fulfilled, (state, action) => {
        state.loading = false;
        state.isConnected = false;
        state.connectionStatus = 'disconnected';
        state.accessToken = null;
        state.refreshToken = null;
        state.tokenExpiry = null;
        state.userInfo = null;
        state.integrations = [];
        state.meetings = [];
        state.currentMeeting = null;
        state.successMessage = action.payload.message || 'Successfully disconnected from Zoom';
        state.showDisconnectModal = false;
      })
      .addCase(disconnectZoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to disconnect from Zoom';
      });

    // Refresh Token
    builder
      .addCase(refreshZoomToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshZoomToken.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.access_token;
        state.tokenExpiry = action.payload.token_expiry;
        state.successMessage = action.payload.message || 'Token refreshed successfully';
      })
      .addCase(refreshZoomToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to refresh token';
        // If refresh fails, user might need to reconnect
        if (action.payload?.message?.includes('invalid') || action.payload?.message?.includes('expired')) {
          state.isConnected = false;
          state.connectionStatus = 'disconnected';
          state.accessToken = null;
          state.refreshToken = null;
          state.userInfo = null;
        }
      });

      // Get Meeting Details
    builder
    .addCase(getMeetingDetails.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(getMeetingDetails.fulfilled, (state, action) => {
      state.loading = false;
      state.currentMeeting = action.payload;
    })
    .addCase(getMeetingDetails.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to get meeting details';
    });

    // Create Meeting
    builder
      .addCase(createZoomMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createZoomMeeting.fulfilled, (state, action) => {
        state.loading = false;
        const meeting = action.payload.meeting || action.payload;
        state.meetings.push(meeting);
        state.currentMeeting = meeting;
        state.successMessage = 'Zoom meeting created successfully!';
      })
      .addCase(createZoomMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create Zoom meeting';
      });

    // Get Meetings
    builder
      .addCase(getZoomMeetings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getZoomMeetings.fulfilled, (state, action) => {
        state.loading = false;
        state.meetings = action.payload.meetings || action.payload;
      })
      .addCase(getZoomMeetings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to get Zoom meetings';
      });

    // Update Meeting
    builder
      .addCase(updateZoomMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateZoomMeeting.fulfilled, (state, action) => {
        state.loading = false;
        const updatedMeeting = action.payload.meeting || action.payload;
        const index = state.meetings.findIndex(meeting => meeting.id === updatedMeeting.id);
        if (index !== -1) {
          state.meetings[index] = updatedMeeting;
        }
        state.successMessage = 'Meeting updated successfully!';
      })
      .addCase(updateZoomMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update meeting';
      });

    // Delete Meeting
    builder
      .addCase(deleteZoomMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteZoomMeeting.fulfilled, (state, action) => {
        state.loading = false;
        state.meetings = state.meetings.filter(meeting => meeting.id !== action.payload.meetingId);
        if (state.currentMeeting && state.currentMeeting.id === action.payload.meetingId) {
          state.currentMeeting = null;
        }
        state.successMessage = 'Meeting deleted successfully!';
      })
      .addCase(deleteZoomMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete meeting';
      });
  },
});

// Export actions
export const {
  clearMessages,
  setShowConnectionModal,
  setShowDisconnectModal,
  resetZoomState,
  setConnectionStatus,
  setCurrentOrganization,
  setCurrentMeeting,
  addMeeting,
  updateMeetingInState,
  removeMeetingFromState,
} = zoomSlice.actions;

// Selectors
export const selectZoomIsConnected = (state) => state.zoom.isConnected;
export const selectZoomConnectionStatus = (state) => state.zoom.connectionStatus;
export const selectZoomUserInfo = (state) => state.zoom.userInfo;
export const selectZoomAuthUrl = (state) => state.zoom.authUrl;
export const selectZoomIntegrations = (state) => state.zoom.integrations;
export const selectZoomMeetings = (state) => state.zoom.meetings;
export const selectZoomCurrentMeeting = (state) => state.zoom.currentMeeting;
export const selectZoomLoading = (state) => state.zoom.loading;
export const selectZoomError = (state) => state.zoom.error;
export const selectZoomSuccessMessage = (state) => state.zoom.successMessage;
export const selectZoomShowConnectionModal = (state) => state.zoom.showConnectionModal;
export const selectZoomShowDisconnectModal = (state) => state.zoom.showDisconnectModal;
export const selectZoomTokenExpiry = (state) => state.zoom.tokenExpiry;
export const selectCurrentMeetingDetails = (state) => state.zoom.currentMeeting;
export const selectZoomCurrentOrganization = (state) => state.zoom.currentOrganizationId;

// Helper selectors
export const selectIsZoomTokenExpired = (state) => {
  const expiry = state.zoom.tokenExpiry;
  if (!expiry) return false;
  return new Date(expiry) <= new Date();
};

export const selectZoomConnectionDisplay = (state) => {
  const status = state.zoom.connectionStatus;
  const userInfo = state.zoom.userInfo;
  
  switch (status) {
    case 'connected':
      return {
        status: 'Connected',
        message: userInfo ? `Connected as ${userInfo.email || userInfo.first_name}` : 'Connected to Zoom',
        color: 'green',
      };
    case 'connecting':
      return {
        status: 'Connecting',
        message: 'Connecting to Zoom...',
        color: 'yellow',
      };
    case 'error':
      return {
        status: 'Error',
        message: 'Connection failed',
        color: 'red',
      };
    default:
      return {
        status: 'Disconnected',
        message: 'Not connected to Zoom',
        color: 'gray',
      };
  }
};

export default zoomSlice.reducer;