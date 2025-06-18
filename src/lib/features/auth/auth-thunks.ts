import { createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from './auth-api'
import { SignupRequest, LoginRequest } from './auth-types'

export const signUpUser = createAsyncThunk(
  'auth/userRegister',
  async (userData: SignupRequest, { rejectWithValue }) => {
    try {
      const response = await authAPI.signup(userData);
      
      return {
        userId: response.userId,
        email: userData.email.trim().toLowerCase(),
        otpSent: response.otpSent || true,
        otpExpiresAt: response.otpExpiresAt,
        message: response.message || 'Verification code sent to your email'
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      return rejectWithValue({ 
        message, 
        code: error.response?.status || 500 
      });
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/userLogin',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      
      return {
        user: response.user,
        token: response.token,
        refreshToken: response.refreshToken,
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      return rejectWithValue({ 
        message, 
        code: error.response?.status || 500 
      });
    }
  }
);

export const verifyOtpUser = createAsyncThunk(
  'auth/verifyOtp',
  async ({ userId, otp }: { userId: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyOtp(userId, otp);
      
      return {
        user: response.user,
        token: response.token,
        refreshToken: response.refreshToken,
        message: response.message || 'Account verified successfully'
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'OTP verification failed';
      return rejectWithValue({ 
        message, 
        code: error.response?.status || 500 
      });
    }
  }
);