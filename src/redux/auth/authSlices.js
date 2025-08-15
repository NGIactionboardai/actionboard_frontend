import { refreshAxios } from '@/app/utils/refreshAxios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Constants
const AUTH_STORAGE_KEYS = {
  TOKEN: 'meetingsummarizer_token',
  USER: 'meetingsummarizer_user',
  REFRESH_TOKEN: 'meetingsummarizer_refresh_token'
};

const API_ENDPOINTS = {
  REGISTER: 'https://actionboard-ai-backend.onrender.com/api/auth/register/',
  VERIFY_OTP: 'https://actionboard-ai-backend.onrender.com/api/auth/verify-otp/',
  RESEND_OTP: '/api/auth/resend-otp',
  LOGIN: 'https://actionboard-ai-backend.onrender.com/api/auth/signin/',
  USER_INFO: 'https://actionboard-ai-backend.onrender.com/api/auth/me/',
  EDIT_USER_INFO: 'https://actionboard-ai-backend.onrender.com/api/auth/edit-user-info/',
  CHANGE_PASSWORD: 'https://actionboard-ai-backend.onrender.com/api/auth/change-password/',
  ADD_PASSWORD: 'https://actionboard-ai-backend.onrender.com/api/auth/add-password/',
  REFRESH: 'https://actionboard-ai-backend.onrender.com/api/auth/token/refresh/',
  LOGOUT: '/api/auth/logout'
};

// Safe localStorage utilities for SSR compatibility
export const storage = {
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
      Object.values(AUTH_STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing auth storage:', error);
    }
  }
};

// Axios interceptor for adding auth token
const setupAxiosInterceptors = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Helper function to extract error message
export function extractErrorMessage(error) {
  if (!error) return 'An unknown error occurred';

  // 1. Axios response data exists
  if (error.response?.data) {
    const data = error.response.data;

    // If it's a string
    if (typeof data === 'string') return data;

    // DRF's common "detail" field
    if (data.detail) return data.detail;

    // Non-field errors array
    if (Array.isArray(data.non_field_errors)) {
      return data.non_field_errors.join(', ');
    }

    // Field-specific errors { email: ["..."], password: ["..."] }
    if (typeof data === 'object') {
      return Object.values(data).flat().join(', ');
    }
  }

  // 2. Fall back to JS error.message
  if (error.message) return error.message;

  return 'An unknown error occurred';
}

export const fetchUserInfo = async () => {
  const token = storage.get(AUTH_STORAGE_KEYS.TOKEN);

  if (!token) {
    throw new Error('No access token found');
  }

  const response = await axios.get(API_ENDPOINTS.USER_INFO, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // const response = await axios.get(API_ENDPOINTS.USER_INFO);

  // console.log("User Data: ", response.data);
  return response.data;
};


// Async thunk for user registration
export const userRegister = createAsyncThunk(
  'auth/userRegister',
  async (userData, { rejectWithValue }) => {
    try {
      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'email', 'password'];
      const missingFields = requiredFields.filter(field => !userData[field]?.trim());
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error('Please enter a valid email address');
      }
      
      console.log("Starting registration process");

      const response = await axios.post(API_ENDPOINTS.REGISTER, {
        email: userData.email.trim().toLowerCase(),
        first_name: userData.firstName.trim(),
        last_name: userData.lastName.trim(),
        country: 'US',
        date_of_birth: userData.dateOfBirth,
        password: userData.password,
      });

      return {
        userId: response.data.userId,
        email: userData.email.trim().toLowerCase(),
        otpSent: response.data.otpSent || true,
        otpExpiresAt: response.data.otpExpiresAt,
        message: response.data.message || 'Verification code sent to your email'
      };
    } catch (error) {
      console.log("Registration error: ", error);
      const message = extractErrorMessage(error);
      return rejectWithValue({ message, code: error.response?.status });
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ email, otp }, { rejectWithValue }) => {
    console.log("Verifying OTP for:", email, otp);
    
    try {
      if (!email || !otp) {
        throw new Error('User ID and OTP are required');
      }

      if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
        throw new Error('OTP must be a 6-digit number');
      }

      const response = await axios.post(API_ENDPOINTS.VERIFY_OTP, { 
        email, 
        otp: otp.toString() 
      });

      const { token, refreshToken, user } = response.data;
      console.log("OTP verification successful:", { token: token ? "present" : "missing", user });

      // Store authentication data
      storage.set(AUTH_STORAGE_KEYS.TOKEN, token);
      storage.set(AUTH_STORAGE_KEYS.USER, user);
      if (refreshToken) {
        storage.set(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }

      // Setup axios headers
      setupAxiosInterceptors(token);

      return {
        token,
        refreshToken,
        user,
        message: response.data.message || 'Account verified successfully'
      };
    } catch (error) {
      const message = extractErrorMessage(error);
      return rejectWithValue({ message, code: error.response?.status });
    }
  }
);

// Async thunk for resending OTP
export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async ({ userId, email }, { rejectWithValue }) => {
    try {
      if (!userId && !email) {
        throw new Error('Either User ID or email is required');
      }

      const response = await axios.post(API_ENDPOINTS.RESEND_OTP, { 
        userId, 
        email: email?.toLowerCase() 
      });

      return {
        otpExpiresAt: response.data.otpExpiresAt,
        message: response.data.message || 'New verification code sent'
      };
    } catch (error) {
      const message = extractErrorMessage(error);
      return rejectWithValue({ message, code: error.response?.status });
    }
  }
);

// Async thunk for user login
export const userLogin = createAsyncThunk(
  'auth/userLogin',
  async (loginData, { rejectWithValue }) => {
    try {
      const { email, password, rememberMe = false } = loginData;

      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      const response = await axios.post(API_ENDPOINTS.LOGIN, {
        email: email.trim().toLowerCase(),
        password,
        rememberMe
      });

      const { token, refreshToken, user } = response.data;

      // Store authentication data
      storage.set(AUTH_STORAGE_KEYS.TOKEN, token);
      storage.set(AUTH_STORAGE_KEYS.USER, user);
      if (refreshToken) {
        storage.set(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }

      // Setup axios headers
      setupAxiosInterceptors(token);

      return {
        token,
        refreshToken,
        user,
        message: response.data.message || 'Login successful'
      };
    } catch (error) {
      let message = 'Login failed';
      
      if (error.response?.data) {
        // If backend sends { detail: "..." } or { error: "..." }
        if (typeof error.response.data === 'string') {
          message = error.response.data;
        } else if (error.response.data.detail) {
          message = error.response.data.detail;
        } else if (Array.isArray(error.response.data.non_field_errors)) {
          message = error.response.data.non_field_errors.join(', ');
        } else if (typeof error.response.data === 'object') {
          // serializer errors or custom keys
          message = Object.values(error.response.data).flat().join(', ');
        }
      } else if (error.message) {
        message = error.message;
      }

      return rejectWithValue({ message, code: error.response?.status });
    }
  }
);

// Async thunk for token refresh
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const storedRefreshToken = storage.get(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
      
      if (!storedRefreshToken) {
        throw new Error('No refresh token available');
      }

      // Backend expects the refresh token in the "refresh" field
      const response = await refreshAxios.post(API_ENDPOINTS.REFRESH, { refresh: storedRefreshToken });
      
      const newAccessToken = response.data.access;
      const newRefreshToken = response.data.refresh;

      if (!newAccessToken) {
        throw new Error('No access token returned from server');
      }

      // Save new tokens
      storage.set(AUTH_STORAGE_KEYS.TOKEN, newAccessToken);
      if (newRefreshToken) {
        storage.set(AUTH_STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
      }

      // Update axios default Authorization header
      setupAxiosInterceptors(newAccessToken);

      console.log("Token refresh success")

      return {
        token: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      // On failure, clear all tokens and logout
      storage.clear();
      setupAxiosInterceptors(null);
      const message = extractErrorMessage(error);
      return rejectWithValue({ message, code: error.response?.status });
    }
  }
);

// Async thunk for logout
export const userLogout = createAsyncThunk(
  'auth/userLogout',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      
      if (token) {
        // Optional: Call logout endpoint to invalidate token on server
        try {
          await axios.post(API_ENDPOINTS.LOGOUT);
        } catch (error) {
          // Continue with local logout even if server logout fails
          console.warn('Server logout failed:', error);
        }
      }

      // Clear local storage and axios headers
      storage.clear();
      setupAxiosInterceptors(null);

      return { message: 'Logged out successfully' };
    } catch (error) {
      // Still clear local data even if server call fails
      storage.clear();
      setupAxiosInterceptors(null);
      const message = extractErrorMessage(error);
      return rejectWithValue({ message, code: error.response?.status });
    }
  }
);

export const changePassword = (data) => {
  return axios.post(API_ENDPOINTS.CHANGE_PASSWORD, data);
};

export const addPassword = (data) => {
  return axios.post(API_ENDPOINTS.ADD_PASSWORD, data);
};

export const editUserInfo = (data) => {
  return axios.patch(API_ENDPOINTS.EDIT_USER_INFO, data);
};


const initialState = {
  // Authentication state - start with null/false for SSR compatibility
  isAuthenticated: false,
  user: null,
  token: null,
  refreshToken: null,
  
  // Add hydration flag to track when we've loaded from localStorage
  isHydrated: false,
  
  // Registration flow state
  registrationEmail: null,
  otpExpiresAt: null,
  
  // Loading states
  loading: false,
  registering: false,
  verifying: false,
  loggingIn: false,
  refreshing: false,
  loggingOut: false,
  
  // Messages
  error: null,
  successMessage: null,
  
  // UI state
  lastActivity: null,
  sessionExpired: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {

    googleLoginSuccess: (state, action) => {
      const { token, refreshToken, user } = action.payload;

      // Save to localStorage using your storage utility
      storage.set(AUTH_STORAGE_KEYS.TOKEN, token);
      storage.set(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      storage.set(AUTH_STORAGE_KEYS.USER, user);

      // Set Axios default headers
      setupAxiosInterceptors(token);
      
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.error = null;
      state.successMessage = 'Login successful';
    },

    updateUserPasswordStatus: (state, action) => {
      // const updatedUser = {
      //   ...state.user,
      //   has_password: action.payload.has_password,
      // };

      const { user} = action.payload
    
      // Save updated user to localStorage
      storage.set(AUTH_STORAGE_KEYS.USER, user);
    
      // Update Redux state
      state.user = user;
      state.successMessage = 'Password set successfully';
      state.error = null;
    },

    updateUserInfo: (state, action) => {
      const { user } = action.payload;
    
      storage.set(AUTH_STORAGE_KEYS.USER, user);
      state.user = user;
      state.successMessage = 'User information updated successfully';
      state.error = null;
    },

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
    
    // Update last activity timestamp
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
    },
    
    // Set session expired
    setSessionExpired: (state, action) => {
      state.sessionExpired = action.payload;
    },
    
    // Reset registration flow
    resetRegistration: (state) => {
      state.registrationEmail = null;
      state.error = null;
      state.successMessage = null;
    },
    
    // FIXED: Hydrate auth state from localStorage (call this on client-side only)
    hydrateAuth: (state) => {
      if (state.isHydrated) return; // Prevent double hydration
      
      const storedUser = storage.get(AUTH_STORAGE_KEYS.USER);
      const storedToken = storage.get(AUTH_STORAGE_KEYS.TOKEN);
      const storedRefreshToken = storage.get(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
      
      if (storedToken && storedUser) {
        state.user = storedUser;
        state.token = storedToken;
        state.refreshToken = storedRefreshToken;
        state.isAuthenticated = true;
        setupAxiosInterceptors(storedToken);
      } else {
        // Clear inconsistent state
        storage.clear();
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
      }
      
      state.isHydrated = true;
    },
    
    // Manual logout (for immediate logout without API call)
    logoutImmediate: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.registrationEmail = null;
      state.error = null;
      state.successMessage = null;
      state.sessionExpired = false;
      
      storage.clear();
      setupAxiosInterceptors(null);
    }
  },
  
  extraReducers: (builder) => {
    builder
      // User Registration
      .addCase(userRegister.pending, (state) => {
        state.registering = true;
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(userRegister.fulfilled, (state, action) => {
        state.registering = false;
        state.loading = false;
        state.registrationEmail = action.payload.email; 
        state.successMessage = action.payload.message;
        state.error = null;
      })
      .addCase(userRegister.rejected, (state, action) => {
        state.registering = false;
        state.loading = false;
        state.error = action.payload?.message || 'Registration failed';
        state.successMessage = null;
      })
      
      // OTP Verification
      .addCase(verifyOtp.pending, (state) => {
        state.verifying = true;
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.verifying = false;
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.successMessage = action.payload.message;
        state.error = null;
        
        // Clear registration flow state
        state.registrationEmail = null;
        state.userId = null;
        state.otpSent = false;
        state.otpExpiresAt = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.verifying = false;
        state.loading = false;
        state.error = action.payload?.message || 'OTP verification failed';
        state.successMessage = null;
      })
      
      // Resend OTP
      .addCase(resendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(resendOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.otpExpiresAt = action.payload.otpExpiresAt;
        state.successMessage = action.payload.message;
        state.error = null;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to resend verification code';
        state.successMessage = null;
      })
      
      // User Login
      .addCase(userLogin.pending, (state) => {
        state.loggingIn = true;
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(userLogin.fulfilled, (state, action) => {
        state.loggingIn = false;
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.successMessage = action.payload.message;
        state.error = null;
        state.sessionExpired = false;
      })
      .addCase(userLogin.rejected, (state, action) => {
        state.loggingIn = false;
        state.loading = false;
        console.log('Login fail Message: ', action.payload)
        state.error = action.payload?.message || 'Login failed';
        state.successMessage = null;
      })
      
      // Token Refresh
      .addCase(refreshToken.pending, (state) => {
        state.refreshing = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        if (action.payload.refreshToken) {
          state.refreshToken = action.payload.refreshToken;
        }
        state.refreshing = false;
        state.sessionExpired = false;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.refreshing = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.sessionExpired = true;
        state.error = action.payload?.message || 'Session expired';
      })
      
      // User Logout
      .addCase(userLogout.pending, (state) => {
        state.loggingOut = true;
      })
      .addCase(userLogout.fulfilled, (state, action) => {
        state.loggingOut = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.registrationEmail = null;
        state.userId = null;
        state.otpSent = false;
        state.otpExpiresAt = null;
        state.error = null;
        state.successMessage = action.payload.message;
        state.sessionExpired = false;
      })
      .addCase(userLogout.rejected, (state, action) => {
        state.loggingOut = false;
        // Still clear auth state even if logout API fails
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.registrationEmail = null;
        state.userId = null;
        state.otpSent = false;
        state.otpExpiresAt = null;
        state.error = action.payload?.message || 'Logout failed';
      });
  }
});

// Export actions
export const {
  googleLoginSuccess,
  updateUserPasswordStatus,
  updateUserInfo,
  clearError,
  clearSuccess,
  clearMessages,
  updateLastActivity,
  setSessionExpired,
  resetRegistration,
  hydrateAuth,
  logoutImmediate
} = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectSuccessMessage = (state) => state.auth.successMessage;
export const selectIsHydrated = (state) => state.auth.isHydrated;
export const selectRegistrationFlow = (state) => ({
  email: state.auth.registrationEmail,
});

export default authSlice.reducer;