import axios from 'axios'
import { SignupRequest, LoginRequest } from './auth-types'

const BASE_URL = "https://actionboard-backend-1.onrender.com/api"

// Create axios instance with base config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  signup: async (userData: SignupRequest) => {
    const response = await api.post('/auth/register/', {
      email: userData.email.trim().toLowerCase(),
      first_name: userData.firstName.trim(),
      last_name: userData.lastName.trim(),
      country: 'US',
      date_of_birth: userData.dateOfBirth,
      password: userData.password,
    });
    return response.data;
  },

  login: async (credentials: LoginRequest) => {
    const response = await api.post('/auth/login/', {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    });
    return response.data;
  },

  verifyOtp: async (userId: string, otp: string) => {
    const response = await api.post('/auth/verify-otp/', {
      userId,
      otp,
    });
    return response.data;
  },

  resendOtp: async (userId: string) => {
    const response = await api.post('/auth/resend-otp/', {
      userId,
    });
    return response.data;
  },
};