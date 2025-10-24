// authSlice.ts

import { createSlice, Dispatch } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";
import { setUserData, clearUserData, refreshUserData } from '../auth';

export interface AddressDetails {
  address: string;
  state: string;
  city: string;
  pin: string;
}

export interface User {
  _id: string;
  phone: string;
  password: string;
  address: string;
  __v: number;
  name?: string;
  email?: string;
  pincode?: string;
  state?: string;
  signature?: string;
  gstNumber?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankAddress?: string;
  bankName?: string;
  accountHolderName?: string;
}

interface AuthState {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token?: string | null; // Add token to state
}

const initialState: AuthState = {
  user: null,
  users: [],
  isAuthenticated: false,
  isLoading: false,
  error: null,
  token: null, // Add token to initial state
};

// Initialize state from localStorage if available
const loadUserFromLocalStorage = () => {
  if (typeof window !== 'undefined') {
    try {
      const userData = localStorage.getItem('admin_user');
      if (userData) {
        const user = JSON.parse(userData);
        initialState.user = user;
        initialState.isAuthenticated = true;
        initialState.token = user._id;
      }
    } catch (error) {
      console.error('Failed to load user data from localStorage:', error);
    }
  }
};

// Call this function to initialize state
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

export const login = ({ phone, password }: { phone: string; password: string }) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  dispatch(setError(null));

  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-login`, {
      phone,
      password
    });
    if (response.status === 200 && response.data?.data) {
      const user = response.data.data;
      dispatch(setUser(user));
      dispatch(setToken(user._id));
      
      // Use utility function to store user data
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
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-single/${id}`);
    if (response.status === 200 && response.data?.data) {
      const user = response.data.data;
      dispatch(setUser(user));
      
      // Use utility function to refresh user data
      refreshUserData(user);
    } else {
      dispatch(setError(response.data?.errorMessage || 'Failed to fetch admin details.'));
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 
                   (axios.isAxiosError(error) && error.response?.data?.errorMessage) || 
                   'Failed to fetch admin details.';
    dispatch(setError(message));
  } finally {
    dispatch(setIsLoading(false));
  }
};


export const logout = () => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    // Use utility function to clear user data
    clearUserData();
    
    dispatch(logoutUser());
  } catch (error: unknown) {
    const message = (error && typeof error === 'object' && 'message' in error) ? (error as { message?: string }).message : (error as string);
    dispatch(setError(message || "Logout failed"));
  } finally {
    dispatch(setIsLoading(false));
  }
};

// --- NEW THUNKS FOR PROFILE SETTINGS ---
// Use token from Redux state, not cookies
export const fetchCurrentUser = () => async (dispatch: Dispatch, getState: () => RootState) => {
  dispatch(setIsLoading(true));
  const token = getState().auth.token;
  if (!token) {
    dispatch(setError("Authentication token not found. Please log in."));
    return;
  }
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
      withCredentials: true,
    });
    const user = response.data.data;
    dispatch(setUser(user));
    
    // Use utility function to refresh user data
    refreshUserData(user);
  } catch (error: unknown) {
    const message = axios.isAxiosError(error) ? error.response?.data?.message || "Could not fetch user details." : 
                   (error instanceof Error ? error.message : "Could not fetch user details.");
    dispatch(setError(message));
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      dispatch(logoutUser());
      // Use utility function to clear user data on authentication failure
      clearUserData();
    }
  } finally {
    dispatch(setIsLoading(false));
  }
};

export const updateUserProfile = (formData: FormData | Partial<User>, id: string) => async (dispatch: Dispatch) => {
  try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    dispatch(setUser(response.data.data));
    return response.data;
  } catch (error: unknown) {
    const message = axios.isAxiosError(error) ? error.response?.data?.message || "Failed to update profile." : 
                   (error instanceof Error ? error.message : "Failed to update profile.");
    dispatch(setError(message));
    return null;
  }
};

export const updateBankDetails = (bankData: Partial<User>, id: string) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-update/${id}`, bankData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    dispatch(setUser(response.data.data));
    return response.data;
  } catch (error: unknown) {
    const message = axios.isAxiosError(error) ? error.response?.data?.message || "Failed to update bank details." : 
                   (error instanceof Error ? error.message : "Failed to update bank details.");
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