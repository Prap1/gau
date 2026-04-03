import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from './api';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone_number?: string;
  profile_image?: string;
  is_verified: boolean;
  date_joined: string;
  joining_date?: string;
  gender?: string;
  dob?: string;
  specialization?: string;
  qualification?: string;
  experience?: string;
  address?: string;
}

export interface DoctorDashboardStats {
  total_deaths: number;
  total_cows: number;
  total_medicines_stock: number;
}

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.patch('auth/profile/update/', profileData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Profile update failed');
    }
  }
);

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  message: string | null;
  isSidebarOpen: boolean;
  pendingApproval: boolean;
  doctorStats: DoctorDashboardStats | null;
  isLoggingOut: boolean;
  isAuthActionLoading: boolean;
  authActionMessage: string | null;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  loading: false,
  error: null,
  message: null,
  isSidebarOpen: false,
  pendingApproval: false,
  doctorStats: null,
  isLoggingOut: false,
  isAuthActionLoading: false,
  authActionMessage: null,
};

export const register = createAsyncThunk(
  'auth/register',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await api.post('auth/register/', userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Registration failed');
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (otpData: { email: string; code: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('auth/verify-otp/', otpData);
      // If tokens exist, it's a Doctor/Admin — log them in
      if (response.data.tokens) {
        localStorage.setItem('access_token', response.data.tokens.access);
        localStorage.setItem('refresh_token', response.data.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'OTP verification failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (loginData: any, { rejectWithValue }) => {
    try {
      const response = await api.post('auth/login/', loginData);
      localStorage.setItem('access_token', response.data.tokens.access);
      localStorage.setItem('refresh_token', response.data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error: any) {
      const payload = error.response?.data;
      let errMsg = 'Login failed';
      if (typeof payload === 'string') errMsg = payload;
      else if (payload?.error) errMsg = payload.error;
      else if (payload?.detail) errMsg = payload.detail;
      else if (payload && typeof payload === 'object') {
        const firstValue = Object.values(payload)[0];
        if (Array.isArray(firstValue)) errMsg = firstValue[0];
        else if (typeof firstValue === 'string') errMsg = firstValue;
      }
      return rejectWithValue(errMsg);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (emailData: { email: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('auth/forgot-password/', emailData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to send reset link');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (resetData: any, { rejectWithValue }) => {
    try {
      const response = await api.post('auth/reset-password/', resetData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Password reset failed');
    }
  }
);

export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async (emailData: { email: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('auth/resend-otp/', emailData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to resend OTP');
    }
  }
);

export const fetchDoctorDashboard = createAsyncThunk(
  'auth/fetchDoctorDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('auth/dashboard/doctor/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch doctor dashboard');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      await api.post('auth/logout/', { refresh });
    } catch (error: any) {
      // Even if API fails, we clear local storage
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
    return null;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isAuthActionLoading = true;
        state.authActionMessage = "Creating your account...";
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthActionLoading = false;
        state.authActionMessage = null;
        state.message = action.payload.message;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.isAuthActionLoading = false;
        state.authActionMessage = null;
        state.error = (action.payload as any)?.error || 'Registration failed';
      })
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isAuthActionLoading = true;
        state.authActionMessage = "Verifying code...";
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthActionLoading = false;
        state.authActionMessage = null;
        if (action.payload.pending_approval) {
          // Member awaiting Admin approval — do NOT log them in
          state.pendingApproval = true;
          state.message = action.payload.message;
        } else {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.tokens.access;
          state.message = action.payload.message;
        }
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.isAuthActionLoading = false;
        state.authActionMessage = null;
        state.error = (action.payload as any)?.error || 'OTP verification failed';
      })
      // Resend OTP
      .addCase(resendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isAuthActionLoading = true;
        state.authActionMessage = "Resending OTP...";
      })
      .addCase(resendOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthActionLoading = false;
        state.authActionMessage = null;
        state.message = action.payload.message || 'OTP resent successfully';
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.loading = false;
        state.isAuthActionLoading = false;
        state.authActionMessage = null;
        state.error = (action.payload as any)?.error || 'Failed to resend OTP';
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isAuthActionLoading = true;
        state.authActionMessage = "Signing you in...";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthActionLoading = false;
        state.authActionMessage = null;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.tokens.access;
        state.message = action.payload.message;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthActionLoading = false;
        state.authActionMessage = null;
        state.error = typeof action.payload === 'string' ? action.payload : ((action.payload as any)?.error || 'Login failed');
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoggingOut = true;
        state.authActionMessage = "Signing you out safely...";
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.message = 'Logged out successfully';
        state.isLoggingOut = false;
        state.authActionMessage = null;
      })
      .addCase(logout.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoggingOut = false;
        state.authActionMessage = null;
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isAuthActionLoading = true;
        state.authActionMessage = "Sending reset link...";
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthActionLoading = false;
        state.authActionMessage = null;
        state.message = action.payload.message;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.isAuthActionLoading = false;
        state.authActionMessage = null;
        state.error = (action.payload as any)?.error || 'Failed to send reset link';
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isAuthActionLoading = true;
        state.authActionMessage = "Updating your password...";
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthActionLoading = false;
        state.authActionMessage = null;
        state.message = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.isAuthActionLoading = false;
        state.authActionMessage = null;
        state.error = (action.payload as any)?.error || 'Password reset failed';
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.message = action.payload.message;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.error || 'Profile update failed';
      })
      // Doctor Dashboard
      .addCase(fetchDoctorDashboard.fulfilled, (state, action) => {
        state.doctorStats = action.payload.stats;
      });
  },
});

export const { clearError, clearMessage, toggleSidebar, setSidebarOpen } = authSlice.actions;
export default authSlice.reducer;
