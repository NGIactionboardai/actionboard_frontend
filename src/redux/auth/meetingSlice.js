import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Constants
const MEETING_STORAGE_KEYS = {
  USER_MEETINGS: 'meetingsummarizer_user_meetings',
  ORG_MEETINGS: 'meetingsummarizer_org_meetings'
};

const API_ENDPOINTS = {
  CREATE_MEETING: 'https://actionboard-backend-cdqe.onrender.com/api/meetings/create/',
  GET_USER_MEETINGS: 'https://actionboard-backend-cdqe.onrender.com/api/meetings/my-meetings/',
  GET_ORG_MEETINGS: 'https://actionboard-backend-cdqe.onrender.com/api/meetings/organization/',
  GET_MEETING_DETAILS: 'https://actionboard-backend-cdqe.onrender.com/api/meetings/',
  UPDATE_MEETING: 'https://actionboard-backend-cdqe.onrender.com/api/meetings/',
  DELETE_MEETING: 'https://actionboard-backend-cdqe.onrender.com/api/meetings/',
  UPLOAD_MEETING_FILE: 'https://actionboard-backend-cdqe.onrender.com/api/meetings/upload/',
  SUMMARIZE_MEETING: 'https://actionboard-backend-cdqe.onrender.com/api/meetings/summarize/'
};

// Safe localStorage utilities for SSR compatibility
const storage = {
  get: (key) => {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error parsing localStorage item ${key}:`, error);
      localStorage.removeItem(key);
      return null;
    }
  },
  
  set: (key, value) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage item ${key}:`, error);
    }
  },
  
  remove: (key) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage item ${key}:`, error);
    }
  },
  
  clear: () => {
    if (typeof window === 'undefined') return;
    try {
      Object.values(MEETING_STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing meeting storage:', error);
    }
  }
};

// Helper function to extract error message
const extractErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Helper function to get auth headers
const getAuthHeaders = (getState) => {
  const authState = getState()?.auth;
  const token = authState?.token || storage.get('meetingsummarizer_token');
  
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Async thunk for creating meeting
export const createMeeting = createAsyncThunk(
  'meeting/createMeeting',
  async (meetingData, { rejectWithValue, getState }) => {
    try {
      // Validate required fields
      if (!meetingData.title?.trim()) {
        throw new Error('Meeting title is required');
      }
      if (!meetingData.organizationId) {
        throw new Error('Organization ID is required');
      }

      const headers = getAuthHeaders(getState);
      const config = { headers };

      console.log("Creating meeting:", meetingData.title);

      const response = await axios.post(API_ENDPOINTS.CREATE_MEETING, {
        title: meetingData.title.trim(),
        date: meetingData.date,
        duration: meetingData.duration,
        participants: meetingData.participants || 0,
        source: meetingData.source || 'Manual',
        organization_id: meetingData.organizationId,
        description: meetingData.description || '',
        status: meetingData.status || 'not summarized'
      }, config);

      const meeting = response.data;

      return {
        meeting,
        message: response.data.message || 'Meeting created successfully'
      };
    } catch (error) {
      console.log("Create meeting error:", error);
      const message = extractErrorMessage(error);
      return rejectWithValue({ message, code: error.response?.status });
    }
  }
);

// Async thunk for getting user meetings
export const getUserMeetings = createAsyncThunk(
  'meeting/getUserMeetings',
  async (_, { rejectWithValue, getState }) => {
    try {
      const headers = getAuthHeaders(getState);
      const config = { headers };

      const response = await axios.get(API_ENDPOINTS.GET_USER_MEETINGS, config);
      const meetings = response.data || [];
      
      // Store user meetings
      storage.set(MEETING_STORAGE_KEYS.USER_MEETINGS, meetings);

      return {
        meetings,
        message: 'Meetings loaded successfully'
      };
    } catch (error) {
      const message = extractErrorMessage(error);
      return rejectWithValue({ message, code: error.response?.status });
    }
  }
);

// Async thunk for getting organization meetings
export const getOrganizationMeetings = createAsyncThunk(
  'meeting/getOrganizationMeetings',
  async (orgId, { rejectWithValue, getState }) => {
    try {
      if (!orgId) {
        throw new Error('Organization ID is required');
      }

      const headers = getAuthHeaders(getState);
      const config = { headers };

      const response = await axios.get(`${API_ENDPOINTS.GET_ORG_MEETINGS}${orgId}/`, config);
      const meetings = response.data || [];
      
      // Store organization meetings
      storage.set(`${MEETING_STORAGE_KEYS.ORG_MEETINGS}_${orgId}`, meetings);

      return {
        meetings,
        orgId,
        message: 'Organization meetings loaded successfully'
      };
    } catch (error) {
      const message = extractErrorMessage(error);
      return rejectWithValue({ message, code: error.response?.status });
    }
  }
);

// Async thunk for getting meeting details
export const getMeetingDetails = createAsyncThunk(
  'meeting/getMeetingDetails',
  async (meetingId, { rejectWithValue, getState }) => {
    try {
      if (!meetingId) {
        throw new Error('Meeting ID is required');
      }

      const headers = getAuthHeaders(getState);
      const config = { headers };

      const response = await axios.get(`${API_ENDPOINTS.GET_MEETING_DETAILS}${meetingId}/`, config);
      const meeting = response.data;

      return {
        meeting,
        message: 'Meeting details loaded successfully'
      };
    } catch (error) {
      const message = extractErrorMessage(error);
      return rejectWithValue({ message, code: error.response?.status });
    }
  }
);

// Async thunk for updating meeting
export const updateMeeting = createAsyncThunk(
  'meeting/updateMeeting',
  async ({ meetingId, updateData }, { rejectWithValue, getState }) => {
    try {
      if (!meetingId) {
        throw new Error('Meeting ID is required');
      }

      const headers = getAuthHeaders(getState);
      const config = { headers };

      const response = await axios.put(`${API_ENDPOINTS.UPDATE_MEETING}${meetingId}/`, updateData, config);
      const meeting = response.data;

      return {
        meeting,
        message: response.data.message || 'Meeting updated successfully'
      };
    } catch (error) {
      const message = extractErrorMessage(error);
      return rejectWithValue({ message, code: error.response?.status });
    }
  }
);

// Async thunk for deleting meeting
export const deleteMeeting = createAsyncThunk(
  'meeting/deleteMeeting',
  async (meetingId, { rejectWithValue, getState }) => {
    try {
      if (!meetingId) {
        throw new Error('Meeting ID is required');
      }

      const headers = getAuthHeaders(getState);
      const config = { headers };

      await axios.delete(`${API_ENDPOINTS.DELETE_MEETING}${meetingId}/`, config);

      return {
        meetingId,
        message: 'Meeting deleted successfully'
      };
    } catch (error) {
      const message = extractErrorMessage(error);
      return rejectWithValue({ message, code: error.response?.status });
    }
  }
);

// Async thunk for uploading meeting file
export const uploadMeetingFile = createAsyncThunk(
  'meeting/uploadMeetingFile',
  async ({ file, meetingData }, { rejectWithValue, getState }) => {
    try {
      if (!file) {
        throw new Error('File is required');
      }

      const headers = getAuthHeaders(getState);
      const formData = new FormData();
      formData.append('file', file);
      
      // Add meeting metadata if provided
      if (meetingData) {
        Object.keys(meetingData).forEach(key => {
          if (meetingData[key] !== undefined && meetingData[key] !== null) {
            formData.append(key, meetingData[key]);
          }
        });
      }

      const config = {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data'
        }
      };

      const response = await axios.post(API_ENDPOINTS.UPLOAD_MEETING_FILE, formData, config);
      const meeting = response.data;

      return {
        meeting,
        message: response.data.message || 'Meeting file uploaded successfully'
      };
    } catch (error) {
      const message = extractErrorMessage(error);
      return rejectWithValue({ message, code: error.response?.status });
    }
  }
);

// Async thunk for summarizing meeting
export const summarizeMeeting = createAsyncThunk(
  'meeting/summarizeMeeting',
  async (meetingId, { rejectWithValue, getState }) => {
    try {
      if (!meetingId) {
        throw new Error('Meeting ID is required');
      }

      const headers = getAuthHeaders(getState);
      const config = { headers };

      const response = await axios.post(`${API_ENDPOINTS.SUMMARIZE_MEETING}${meetingId}/`, {}, config);
      const meeting = response.data;

      return {
        meeting,
        message: response.data.message || 'Meeting summarized successfully'
      };
    } catch (error) {
      const message = extractErrorMessage(error);
      return rejectWithValue({ message, code: error.response?.status });
    }
  }
);

// Initial state
const initialState = {
  // User's meetings
  userMeetings: storage.get(MEETING_STORAGE_KEYS.USER_MEETINGS) || [],
  
  // Organization meetings (keyed by org ID)
  organizationMeetings: {},
  
  // Current meeting details
  currentMeeting: null,
  
  // Loading states
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  uploading: false,
  summarizing: false,
  fetchingUserMeetings: false,
  fetchingOrgMeetings: false,
  fetchingMeetingDetails: false,
  
  // Messages
  error: null,
  successMessage: null,
  
  // UI state
  selectedMeetingId: null,
  filters: {
    searchTerm: '',
    sourceFilter: 'All Sources',
    statusFilter: 'All',
    dateFilter: {
      startDate: '',
      endDate: ''
    }
  }
};

const meetingSlice = createSlice({
  name: 'meeting',
  initialState,
  reducers: {
    // Clear error messages
    clearError: (state) => {
      state.error = null;
    },
    
    // Clear success messages
    clearSuccess: (state) => {
      state.successMessage = null;
    },
    
    // Clear all messages
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    
    // Set selected meeting ID
    setSelectedMeetingId: (state, action) => {
      state.selectedMeetingId = action.payload;
    },
    
    // Update filters
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        searchTerm: '',
        sourceFilter: 'All Sources',
        statusFilter: 'All',
        dateFilter: {
          startDate: '',
          endDate: ''
        }
      };
    },
    
    // Set current meeting
    setCurrentMeeting: (state, action) => {
      state.currentMeeting = action.payload;
    },
    
    // Clear current meeting
    clearCurrentMeeting: (state) => {
      state.currentMeeting = null;
    },
    
    // Hydrate meeting state from localStorage
    hydrateMeetings: (state) => {
      const storedUserMeetings = storage.get(MEETING_STORAGE_KEYS.USER_MEETINGS);
      
      if (storedUserMeetings) {
        state.userMeetings = storedUserMeetings;
      }
    },
    
    // Clear all meeting data
    clearMeetingData: (state) => {
      state.userMeetings = [];
      state.organizationMeetings = {};
      state.currentMeeting = null;
      state.error = null;
      state.successMessage = null;
      state.selectedMeetingId = null;
      state.filters = initialState.filters;
      
      storage.clear();
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Create Meeting
      .addCase(createMeeting.pending, (state) => {
        state.creating = true;
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createMeeting.fulfilled, (state, action) => {
        state.creating = false;
        state.loading = false;
        
        const newMeeting = action.payload.meeting;
        state.userMeetings.unshift(newMeeting);
        
        // Add to organization meetings if they exist
        if (newMeeting.organization_id && state.organizationMeetings[newMeeting.organization_id]) {
          state.organizationMeetings[newMeeting.organization_id].unshift(newMeeting);
        }
        
        state.successMessage = action.payload.message;
        state.error = null;
      })
      .addCase(createMeeting.rejected, (state, action) => {
        state.creating = false;
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create meeting';
        state.successMessage = null;
      })
      
      // Get User Meetings
      .addCase(getUserMeetings.pending, (state) => {
        state.fetchingUserMeetings = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserMeetings.fulfilled, (state, action) => {
        state.fetchingUserMeetings = false;
        state.loading = false;
        state.userMeetings = action.payload.meetings;
        state.error = null;
      })
      .addCase(getUserMeetings.rejected, (state, action) => {
        state.fetchingUserMeetings = false;
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load meetings';
      })
      
      // Get Organization Meetings
      .addCase(getOrganizationMeetings.pending, (state) => {
        state.fetchingOrgMeetings = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrganizationMeetings.fulfilled, (state, action) => {
        state.fetchingOrgMeetings = false;
        state.loading = false;
        state.organizationMeetings[action.payload.orgId] = action.payload.meetings;
        state.error = null;
      })
      .addCase(getOrganizationMeetings.rejected, (state, action) => {
        state.fetchingOrgMeetings = false;
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load organization meetings';
      })
      
      // Get Meeting Details
      .addCase(getMeetingDetails.pending, (state) => {
        state.fetchingMeetingDetails = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(getMeetingDetails.fulfilled, (state, action) => {
        state.fetchingMeetingDetails = false;
        state.loading = false;
        state.currentMeeting = action.payload.meeting;
        state.error = null;
      })
      .addCase(getMeetingDetails.rejected, (state, action) => {
        state.fetchingMeetingDetails = false;
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load meeting details';
      })
      
      // Update Meeting
      .addCase(updateMeeting.pending, (state) => {
        state.updating = true;
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateMeeting.fulfilled, (state, action) => {
        state.updating = false;
        state.loading = false;
        
        const updatedMeeting = action.payload.meeting;
        
        // Update in userMeetings array
        const userMeetingIndex = state.userMeetings.findIndex(meeting => 
          meeting.id === updatedMeeting.id
        );
        if (userMeetingIndex !== -1) {
          state.userMeetings[userMeetingIndex] = updatedMeeting;
        }
        
        // Update in organizationMeetings if they exist
        if (updatedMeeting.organization_id && state.organizationMeetings[updatedMeeting.organization_id]) {
          const orgMeetingIndex = state.organizationMeetings[updatedMeeting.organization_id].findIndex(meeting => 
            meeting.id === updatedMeeting.id
          );
          if (orgMeetingIndex !== -1) {
            state.organizationMeetings[updatedMeeting.organization_id][orgMeetingIndex] = updatedMeeting;
          }
        }
        
        // Update current meeting if it's the same one
        if (state.currentMeeting && state.currentMeeting.id === updatedMeeting.id) {
          state.currentMeeting = updatedMeeting;
        }
        
        state.successMessage = action.payload.message;
        state.error = null;
      })
      .addCase(updateMeeting.rejected, (state, action) => {
        state.updating = false;
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update meeting';
        state.successMessage = null;
      })
      
      // Delete Meeting
      .addCase(deleteMeeting.pending, (state) => {
        state.deleting = true;
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteMeeting.fulfilled, (state, action) => {
        state.deleting = false;
        state.loading = false;
        
        const deletedMeetingId = action.payload.meetingId;
        
        // Remove from userMeetings array
        state.userMeetings = state.userMeetings.filter(meeting => 
          meeting.id !== deletedMeetingId
        );
        
        // Remove from organizationMeetings
        Object.keys(state.organizationMeetings).forEach(orgId => {
          state.organizationMeetings[orgId] = state.organizationMeetings[orgId].filter(meeting => 
            meeting.id !== deletedMeetingId
          );
        });
        
        // Clear current meeting if it's the deleted one
        if (state.currentMeeting && state.currentMeeting.id === deletedMeetingId) {
          state.currentMeeting = null;
        }
        
        state.successMessage = action.payload.message;
        state.error = null;
      })
      .addCase(deleteMeeting.rejected, (state, action) => {
        state.deleting = false;
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete meeting';
        state.successMessage = null;
      })
      
      // Upload Meeting File
      .addCase(uploadMeetingFile.pending, (state) => {
        state.uploading = true;
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(uploadMeetingFile.fulfilled, (state, action) => {
        state.uploading = false;
        state.loading = false;
        
        const newMeeting = action.payload.meeting;
        state.userMeetings.unshift(newMeeting);
        
        // Add to organization meetings if they exist
        if (newMeeting.organization_id && state.organizationMeetings[newMeeting.organization_id]) {
          state.organizationMeetings[newMeeting.organization_id].unshift(newMeeting);
        }
        
        state.successMessage = action.payload.message;
        state.error = null;
      })
      .addCase(uploadMeetingFile.rejected, (state, action) => {
        state.uploading = false;
        state.loading = false;
        state.error = action.payload?.message || 'Failed to upload meeting file';
        state.successMessage = null;
      })
      
      // Summarize Meeting
      .addCase(summarizeMeeting.pending, (state) => {
        state.summarizing = true;
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(summarizeMeeting.fulfilled, (state, action) => {
        state.summarizing = false;
        state.loading = false;
        
        const updatedMeeting = action.payload.meeting;
        
        // Update in userMeetings array
        const userMeetingIndex = state.userMeetings.findIndex(meeting => 
          meeting.id === updatedMeeting.id
        );
        if (userMeetingIndex !== -1) {
          state.userMeetings[userMeetingIndex] = updatedMeeting;
        }
        
        // Update in organizationMeetings if they exist
        if (updatedMeeting.organization_id && state.organizationMeetings[updatedMeeting.organization_id]) {
          const orgMeetingIndex = state.organizationMeetings[updatedMeeting.organization_id].findIndex(meeting => 
            meeting.id === updatedMeeting.id
          );
          if (orgMeetingIndex !== -1) {
            state.organizationMeetings[updatedMeeting.organization_id][orgMeetingIndex] = updatedMeeting;
          }
        }
        
        // Update current meeting if it's the same one
        if (state.currentMeeting && state.currentMeeting.id === updatedMeeting.id) {
          state.currentMeeting = updatedMeeting;
        }
        
        state.successMessage = action.payload.message;
        state.error = null;
      })
      .addCase(summarizeMeeting.rejected, (state, action) => {
        state.summarizing = false;
        state.loading = false;
        state.error = action.payload?.message || 'Failed to summarize meeting';
        state.successMessage = null;
      });
  }
});

// Export actions
export const {
  clearError,
  clearSuccess,
  clearMessages,
  setSelectedMeetingId,
  updateFilters,
  clearFilters,
  setCurrentMeeting,
  clearCurrentMeeting,
  hydrateMeetings,
  clearMeetingData
} = meetingSlice.actions;

// Selectors
export const selectMeeting = (state) => state.meeting || {};
export const selectUserMeetings = (state) => state.meeting?.userMeetings || [];
export const selectOrganizationMeetings = (orgId) => (state) => 
  state.meeting?.organizationMeetings?.[orgId] || [];
export const selectCurrentMeeting = (state) => state.meeting?.currentMeeting || null;
export const selectMeetingLoading = (state) => state.meeting?.loading || false;
export const selectMeetingError = (state) => state.meeting?.error || null;
export const selectMeetingSuccessMessage = (state) => state.meeting?.successMessage || null;
export const selectSelectedMeetingId = (state) => state.meeting?.selectedMeetingId || null;
export const selectMeetingFilters = (state) => state.meeting?.filters || initialState.filters;
export const selectMeetingLoadingStates = (state) => ({
  creating: state.meeting?.creating || false,
  updating: state.meeting?.updating || false,
  deleting: state.meeting?.deleting || false,
  uploading: state.meeting?.uploading || false,
  summarizing: state.meeting?.summarizing || false,
  fetchingUserMeetings: state.meeting?.fetchingUserMeetings || false,
  fetchingOrgMeetings: state.meeting?.fetchingOrgMeetings || false,
  fetchingMeetingDetails: state.meeting?.fetchingMeetingDetails || false
});

export default meetingSlice.reducer;