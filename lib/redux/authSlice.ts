// authSlice.ts

import { createSlice, Dispatch } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";
import { setUserData, clearUserData, refreshUserData } from '../auth';
import apiClient from '../api';

// Use the User type and correct schema from userSlice
export interface AuthUser {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  isEmailVerified?: boolean;
  subscription?: string;
  wallet?: {
    balance: number;
    transactions: Array<Record<string, unknown>>;
  };
  role?: string;
  createdAt?: string;
  referCode?: string;
  referredBy?: string | null;
  fcmToken?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  users: AuthUser[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token?: string | null;
}

const initialState: AuthState = {
  user: null,
  users: [],
  isAuthenticated: false,
  isLoading: false,
  error: null,
  token: null,
};

// Initialize state from localStorage if available
const loadUserFromLocalStorage = () => {
  if (typeof window !== 'undefined') {
    try {
      const userData = localStorage.getItem('admin_user');
      if (userData) {
        const user: AuthUser = JSON.parse(userData);
        initialState.user = user;
        initialState.isAuthenticated = true;
        initialState.token = user._id ?? null;
      }
    } catch (error) {
      console.error('Failed to load user data from localStorage:', error);
    }
  }
};

loadUserFromLocalStorage();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setUsers: (state, action) => {
      state.users = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.token = null;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
  },
});

export const { setUser, setUsers, setIsLoading, setError, logoutUser, setToken } = authSlice.actions;

// Send OTP to user's email/phone
export const sendOTP = (emailOrPhone: string) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  dispatch(setError(null));
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/send-otp`,
      {
        email: emailOrPhone
      }
    );
    if (response.status === 200) {
      dispatch(setIsLoading(false));
      return { success: true, message: response.data?.message || "OTP sent successfully" };
    } else {
      const errorMessage = response.data?.errorMessage || response.data?.message || "Failed to send OTP.";
      dispatch(setError(errorMessage));
      return { success: false };
    }
  } catch (error: unknown) {
    let message = "An unknown error occurred.";
    if (axios.isAxiosError(error) && error.response) {
      message = error.response.data?.errorMessage || error.response.data?.message || error.message || "Failed to send OTP.";
    } else if (error instanceof Error) {
      message = error.message;
    }
    dispatch(setError(message));
    return { success: false };
  }
};

// Verify OTP and complete login
export const verifyOTPAndLogin = ({
  emailOrPhone,
  otp
}: { emailOrPhone: string; otp: string }) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  dispatch(setError(null));
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/verify-otp`,
      {
        email: emailOrPhone,
        otp: otp
      }
    );
    if (response.status === 200 && response.data?.user && response.data?.token) {
      const user: AuthUser = response.data.user;
      const token: string = response.data.token;
      
      dispatch(setUser(user));
      dispatch(setToken(token));
      setUserData(user, token);
      return { user, token };
    } else {
      const errorMessage = response.data?.errorMessage || response.data?.message || "OTP verification failed.";
      dispatch(setError(errorMessage));
      return null;
    }
  } catch (error: unknown) {
    let message = "An unknown error occurred.";
    if (axios.isAxiosError(error) && error.response) {
      message = error.response.data?.errorMessage || error.response.data?.message || error.message || "OTP verification failed.";
    } else if (error instanceof Error) {
      message = error.message;
    }
    dispatch(setError(message));
    return null;
  }
};

// Legacy login function (kept for backward compatibility if needed)
export const login = ({
  phone,
  password
}: { phone: string; password: string }) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  dispatch(setError(null));
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/send-otp`,
      {
        email: phone,
        password
      }
    );
    if (response.status === 200 && response.data?.data) {
      const user: AuthUser = response.data.data;
      dispatch(setUser(user));
      dispatch(setToken(user._id ?? null));
      setUserData(user);
      return { user };
    } else {
      const errorMessage = response.data?.errorMessage || "Login failed: Invalid response from server.";
      dispatch(setError(errorMessage));
      return null;
    }
  } catch (error: unknown) {
    let message = "An unknown error occurred.";
    if (axios.isAxiosError(error) && error.response) {
      message = error.response.data?.errorMessage || error.message || "Login failed.";
    } else if (error instanceof Error) {
      message = error.message;
    }
    dispatch(setError(message));
    return null;
  }
};

// Fetch admin by id from backend and set user
export const fetchAdminById = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await apiClient.get(`/admin-single/${id}`);
    if (response.status === 200 && response.data?.data) {
      const user: AuthUser = response.data.data;
      dispatch(setUser(user));
      refreshUserData(user);
    } else {
      dispatch(setError(response.data?.errorMessage || 'Failed to fetch admin details.'));
    }
  } catch (error: unknown) {
    const message = error instanceof Error
      ? error.message
      : (axios.isAxiosError(error) && error.response?.data?.errorMessage) ||
        "Failed to fetch admin details.";
    dispatch(setError(message));
  } finally {
    dispatch(setIsLoading(false));
  }
};

export const logout = () => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    clearUserData();
    dispatch(logoutUser());
  } catch (error: unknown) {
    const message =
      error && typeof error === "object" && "message" in error
        ? (error as { message?: string }).message
        : (error as string);
    dispatch(setError(message || "Logout failed"));
  } finally {
    dispatch(setIsLoading(false));
  }
};

export const fetchCurrentUser = () => async (dispatch: Dispatch, getState: () => RootState) => {
  dispatch(setIsLoading(true));
  const token = getState().auth.token;
  if (!token) {
    dispatch(setError("Authentication token not found. Please log in."));
    return;
  }
  try {
    const response = await apiClient.get('/users/me', {
      withCredentials: true,
    });
    const user: AuthUser = response.data.data;
    dispatch(setUser(user));
    refreshUserData(user);
  } catch (error: unknown) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || "Could not fetch user details."
      : error instanceof Error
      ? error.message
      : "Could not fetch user details.";
    dispatch(setError(message));
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      dispatch(logoutUser());
      clearUserData();
    }
  } finally {
    dispatch(setIsLoading(false));
  }
};

export const updateUserProfile = (formData: FormData | Partial<AuthUser>, id: string) => async (dispatch: Dispatch) => {
  try {
    const response = await apiClient.put(
      `/admin/${id}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    dispatch(setUser(response.data.data));
    return response.data;
  } catch (error: unknown) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || "Failed to update profile."
      : error instanceof Error
      ? error.message
      : "Failed to update profile.";
    dispatch(setError(message));
    return null;
  }
};

export const updateBankDetails = (bankData: Partial<AuthUser>, id: string) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await apiClient.put(
      `/admin-update/${id}`,
      bankData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    dispatch(setUser(response.data.data));
    return response.data;
  } catch (error: unknown) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || "Failed to update bank details."
      : error instanceof Error
      ? error.message
      : "Failed to update bank details.";
    dispatch(setError(message));
    return null;
  }
};

// Selectors
export const selectUser = (state: RootState) => state.auth.user;
export const selectUsers = (state: RootState) => state.auth.users;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectError = (state: RootState) => state.auth.error;
export const selectToken = (state: RootState) => state.auth.token;

export default authSlice.reducer;