import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Constants
const ORG_STORAGE_KEYS = {
  CURRENT_ORG: 'meetingsummarizer_current_org',
  USER_ORGS: 'meetingsummarizer_user_orgs'
};

const API_ENDPOINTS = {
  CREATE_ORG: 'https://actionboard-backend-1.onrender.com/api/organisations/create-organization/',
  GET_USER_ORGS: 'https://actionboard-backend-1.onrender.com/api/organisations/my-organisations/',
  GET_ALL_ORGS: 'https://actionboard-backend-1.onrender.com/api/organizations/',
  GET_ORG_DETAILS: 'https://actionboard-backend-1.onrender.com/api/my-organisations/',
  UPDATE_ORG: 'https://actionboard-backend-1.onrender.com/api/organizations/',
  DELETE_ORG: 'https://actionboard-backend-1.onrender.com/api/organizations/delete/'
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
      Object.values(ORG_STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing organization storage:', error);
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

// Async thunk for creating organization
export const createOrganization = createAsyncThunk(
  'organization/createOrganization',
  async (orgData, { rejectWithValue, getState }) => {
    try {
      // Validate required fields
      if (!orgData.name?.trim()) {
        throw new Error('Organization name is required');
      }

      // Get auth token
      const authState = getState()?.auth;
      const token = authState?.token || storage.get('meetingsummarizer_token');
      
      const config = {};
      if (token) {
        config.headers = {
          'Authorization': `Bearer ${token}`
        };
      }

      console.log("Creating organization:", orgData.name);

      const response = await axios.post(API_ENDPOINTS.CREATE_ORG, {
        name: orgData.name.trim()
      }, config);

      const organization = response.data;
      
      // Store as current organization
      storage.set(ORG_STORAGE_KEYS.CURRENT_ORG, organization);

      return {
        organization,
        message: response.data.message || 'Organization created successfully'
      };
    } catch (error) {
      console.log("Create organization error:", error);
      const message = extractErrorMessage(error);
      return rejectWithValue({ message, code: error.response?.status });
    }
  }
);

// Async thunk for getting user organizations
export const getUserOrganizations = createAsyncThunk(
  'organization/getUserOrganizations',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Get auth token from Redux state or localStorage
      const authState = getState()?.auth;
      const token = authState?.token || storage.get('meetingsummarizer_token');
      
      // Ensure the request includes the auth token
      const config = {};
      if (token) {
        config.headers = {
          'Authorization': `Bearer ${token}`
        };
      }

      const response = await axios.get(API_ENDPOINTS.GET_USER_ORGS, config);
      const organizations = response.data || []; // Based on your backend, it returns the array directly
      console.log(organizations)
      
      // Store user organizations
      storage.set(ORG_STORAGE_KEYS.USER_ORGS, organizations);

      return {
        organizations,
        message: 'Organizations loaded successfully'
      };
    } catch (error) {
      const message = extractErrorMessage(error);
      return rejectWithValue({ message, code: error.response?.status });
    }
  }
);

// Async thunk for getting all organizations
export const getAllOrganizations = createAsyncThunk(
  'organization/getAllOrganizations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_ENDPOINTS.GET_ALL_ORGS);
      const organizations = response.data.organizations || response.data || [];

      return {
        organizations,
        message: 'All organizations loaded successfully'
      };
    } catch (error) {
      const message = extractErrorMessage(error);
      return rejectWithValue({ message, code: error.response?.status });
    }
  }
);

// Async thunk for getting organization details
export const getOrganizationDetails = createAsyncThunk(
  'organization/getOrganizationDetails',
  async (orgId, { rejectWithValue }) => {
    try {
      if (!orgId) {
        throw new Error('Organization ID is required');
      }

      const response = await axios.get(`${API_ENDPOINTS.GET_ORG_DETAILS}${orgId}/`);
      const organization = response.data;

      return {
        organization,
        message: 'Organization details loaded successfully'
      };
    } catch (error) {
      const message = extractErrorMessage(error);
      return rejectWithValue({ message, code: error.response?.status });
    }
  }
);

// Async thunk for updating organization
export const updateOrganization = createAsyncThunk(
  'organization/updateOrganization',
  async ({ orgId, updateData }, { rejectWithValue, getState }) => {
    try {
      if (!orgId) {
        throw new Error('Organization ID is required');
      }

      if (!updateData.name?.trim()) {
        throw new Error('Organization name is required');
      }

      // Get auth token
      const authState = getState()?.auth;
      const token = authState?.token || storage.get('meetingsummarizer_token');
      
      const config = {};
      if (token) {
        config.headers = {
          'Authorization': `Bearer ${token}`
        };
      }

      const response = await axios.put(`${API_ENDPOINTS.UPDATE_ORG}${orgId}/`, {
        name: updateData.name.trim()
      }, config);

      const organization = response.data;
      
      // Update current organization if it's the same one
      const currentOrg = storage.get(ORG_STORAGE_KEYS.CURRENT_ORG);
      if (currentOrg && currentOrg.org_id === orgId) {
        storage.set(ORG_STORAGE_KEYS.CURRENT_ORG, organization);
      }

      return {
        organization,
        message: response.data.message || 'Organization updated successfully'
      };
    } catch (error) {
      const message = extractErrorMessage(error);
      return rejectWithValue({ message, code: error.response?.status });
    }
  }
);

// Async thunk for deleting organization
export const deleteOrganization = createAsyncThunk(
  'organization/deleteOrganization',
  async (orgId, { rejectWithValue, getState }) => {
    try {
      if (!orgId) {
        throw new Error('Organization ID is required');
      }

      // Get auth token
      const authState = getState()?.auth;
      const token = authState?.token || storage.get('meetingsummarizer_token');
      
      const config = {};
      if (token) {
        config.headers = {
          'Authorization': `Bearer ${token}`
        };
      }

      await axios.delete(`${API_ENDPOINTS.DELETE_ORG}${orgId}/`, config);

      // Clear from storage if it's the current organization
      const currentOrg = storage.get(ORG_STORAGE_KEYS.CURRENT_ORG);
      if (currentOrg && currentOrg.org_id === orgId) {
        storage.remove(ORG_STORAGE_KEYS.CURRENT_ORG);
      }

      return {
        orgId,
        message: 'Organization deleted successfully'
      };
    } catch (error) {
      const message = extractErrorMessage(error);
      return rejectWithValue({ message, code: error.response?.status });
    }
  }
);

// Initial state
const initialState = {
  // Current organization
  currentOrganization: storage.get(ORG_STORAGE_KEYS.CURRENT_ORG),
  
  // User's organizations
  userOrganizations: storage.get(ORG_STORAGE_KEYS.USER_ORGS) || [],
  
  // All organizations (for browsing)
  allOrganizations: [],
  
  // Organization details
  organizationDetails: null,
  
  // Loading states
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  fetchingDetails: false,
  fetchingUserOrgs: false,
  fetchingAllOrgs: false,
  
  // Messages
  error: null,
  successMessage: null,
  
  // UI state
  selectedOrgId: null
};

const organizationSlice = createSlice({
  name: 'organization',
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
    
    // Set current organization
    setCurrentOrganization: (state, action) => {
      state.currentOrganization = action.payload;
      storage.set(ORG_STORAGE_KEYS.CURRENT_ORG, action.payload);
    },
    
    // Clear current organization
    clearCurrentOrganization: (state) => {
      state.currentOrganization = null;
      storage.remove(ORG_STORAGE_KEYS.CURRENT_ORG);
    },
    
    // Set selected organization ID
    setSelectedOrgId: (state, action) => {
      state.selectedOrgId = action.payload;
    },
    
    // Hydrate organization state from localStorage
    hydrateOrganization: (state) => {
      const storedCurrentOrg = storage.get(ORG_STORAGE_KEYS.CURRENT_ORG);
      const storedUserOrgs = storage.get(ORG_STORAGE_KEYS.USER_ORGS);
      
      if (storedCurrentOrg) {
        state.currentOrganization = storedCurrentOrg;
      }
      
      if (storedUserOrgs) {
        state.userOrganizations = storedUserOrgs;
      }
    },
    
    // Clear all organization data
    clearOrganizationData: (state) => {
      state.currentOrganization = null;
      state.userOrganizations = [];
      state.allOrganizations = [];
      state.organizationDetails = null;
      state.error = null;
      state.successMessage = null;
      state.selectedOrgId = null;
      
      storage.clear();
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Create Organization
      .addCase(createOrganization.pending, (state) => {
        state.creating = true;
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.creating = false;
        state.loading = false;
        state.currentOrganization = action.payload.organization;
        state.userOrganizations.push(action.payload.organization);
        state.successMessage = action.payload.message;
        state.error = null;
      })
      .addCase(createOrganization.rejected, (state, action) => {
        state.creating = false;
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create organization';
        state.successMessage = null;
      })
      
      // Get User Organizations
      .addCase(getUserOrganizations.pending, (state) => {
        state.fetchingUserOrgs = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserOrganizations.fulfilled, (state, action) => {
        state.fetchingUserOrgs = false;
        state.loading = false;
        state.userOrganizations = action.payload.organizations;
        state.error = null;
      })
      .addCase(getUserOrganizations.rejected, (state, action) => {
        state.fetchingUserOrgs = false;
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load organizations';
      })
      
      // Get All Organizations
      .addCase(getAllOrganizations.pending, (state) => {
        state.fetchingAllOrgs = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOrganizations.fulfilled, (state, action) => {
        state.fetchingAllOrgs = false;
        state.loading = false;
        state.allOrganizations = action.payload.organizations;
        state.error = null;
      })
      .addCase(getAllOrganizations.rejected, (state, action) => {
        state.fetchingAllOrgs = false;
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load all organizations';
      })
      
      // Get Organization Details
      .addCase(getOrganizationDetails.pending, (state) => {
        state.fetchingDetails = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrganizationDetails.fulfilled, (state, action) => {
        state.fetchingDetails = false;
        state.loading = false;
        state.organizationDetails = action.payload.organization;
        state.error = null;
      })
      .addCase(getOrganizationDetails.rejected, (state, action) => {
        state.fetchingDetails = false;
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load organization details';
      })
      
      // Update Organization
      .addCase(updateOrganization.pending, (state) => {
        state.updating = true;
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateOrganization.fulfilled, (state, action) => {
        state.updating = false;
        state.loading = false;
        
        const updatedOrg = action.payload.organization;
        
        // Update in userOrganizations array
        const orgIndex = state.userOrganizations.findIndex(org => 
          org.org_id === updatedOrg.org_id || org.id === updatedOrg.id
        );
        if (orgIndex !== -1) {
          state.userOrganizations[orgIndex] = updatedOrg;
        }
        
        // Update current organization if it's the same one
        if (state.currentOrganization && 
            (state.currentOrganization.org_id === updatedOrg.org_id || 
             state.currentOrganization.id === updatedOrg.id)) {
          state.currentOrganization = updatedOrg;
        }
        
        // Update organization details if it's the same one
        if (state.organizationDetails && 
            (state.organizationDetails.org_id === updatedOrg.org_id || 
             state.organizationDetails.id === updatedOrg.id)) {
          state.organizationDetails = updatedOrg;
        }
        
        state.successMessage = action.payload.message;
        state.error = null;
      })
      .addCase(updateOrganization.rejected, (state, action) => {
        state.updating = false;
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update organization';
        state.successMessage = null;
      })
      
      // Delete Organization
      .addCase(deleteOrganization.pending, (state) => {
        state.deleting = true;
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteOrganization.fulfilled, (state, action) => {
        state.deleting = false;
        state.loading = false;
        
        const deletedOrgId = action.payload.orgId;
        
        // Remove from userOrganizations array
        state.userOrganizations = state.userOrganizations.filter(org => 
          org.org_id !== deletedOrgId && org.id !== deletedOrgId
        );
        
        // Clear current organization if it's the deleted one
        if (state.currentOrganization && 
            (state.currentOrganization.org_id === deletedOrgId || 
             state.currentOrganization.id === deletedOrgId)) {
          state.currentOrganization = null;
        }
        
        // Clear organization details if it's the deleted one
        if (state.organizationDetails && 
            (state.organizationDetails.org_id === deletedOrgId || 
             state.organizationDetails.id === deletedOrgId)) {
          state.organizationDetails = null;
        }
        
        state.successMessage = action.payload.message;
        state.error = null;
      })
      .addCase(deleteOrganization.rejected, (state, action) => {
        state.deleting = false;
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete organization';
        state.successMessage = null;
      });
  }
});

// Export actions
export const {
  clearError,
  clearSuccess,
  clearMessages,
  setCurrentOrganization,
  clearCurrentOrganization,
  setSelectedOrgId,
  hydrateOrganization,
  clearOrganizationData
} = organizationSlice.actions;

// Selectors
export const selectOrganization = (state) => state.organization || {};
export const selectCurrentOrganization = (state) => state.organization?.currentOrganization || null;
export const selectUserOrganizations = (state) => state.organization?.userOrganizations || [];
export const selectAllOrganizations = (state) => state.organization?.allOrganizations || [];
export const selectOrganizationDetails = (state) => state.organization?.organizationDetails || null;
export const selectOrganizationLoading = (state) => state.organization?.loading || false;
export const selectOrganizationError = (state) => state.organization?.error || null;
export const selectOrganizationSuccessMessage = (state) => state.organization?.successMessage || null;
export const selectSelectedOrgId = (state) => state.organization?.selectedOrgId || null;

export default organizationSlice.reducer;