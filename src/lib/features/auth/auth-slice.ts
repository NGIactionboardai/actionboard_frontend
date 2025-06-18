import { createSlice } from '@reduxjs/toolkit'
import { signUpUser, loginUser, verifyOtpUser } from './auth-thunks'
import { User } from './auth-types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  registrationData: {
    userId?: string
    email?: string
    otpSent?: boolean
    otpExpiresAt?: string
  } | null
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
  registrationData: null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.registrationData = null
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
    },
  },
  extraReducers: (builder) => {
    // Signup
    builder
      .addCase(signUpUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.registrationData = action.payload
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload?.message || 'Registration failed'
      })

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        localStorage.setItem('token', action.payload.token)
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload?.message || 'Login failed'
      })
  },
})

export const { clearError, logout } = authSlice.actions
export default authSlice.reducer