export interface User {
    id: string
    email: string
    first_name: string
    last_name: string
    country: string
    date_of_birth: string
    avatar?: string
    is_verified: boolean
    created_at: string
    updated_at: string
  }
  
  export interface LoginRequest {
    email: string
    password: string
  }
  
  export interface SignupRequest {
    email: string
    firstName: string
    lastName: string
    dateOfBirth: string
    password: string
    confirmPassword: string
  }
  
  export interface LoginResponse {
    user: User
    token: string
    refreshToken: string
  }
  
  export interface SignupResponse {
    user: User
    token: string
    refreshToken: string
    message: string
  }
  
  export interface ApiResponse<T> {
    success: boolean
    data: T
    message?: string
  }