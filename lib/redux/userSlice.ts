import { createSlice, Dispatch } from "@reduxjs/toolkit";
import { RootState } from "../store";
import apiClient from "../api";

// Transaction, Wallet, and User interfaces according to the provided Mongoose schemas

export interface Transaction {
  type: "Credit" | "Debit";
  amount: number;
  description?: string;
  source?: string;
  date?: string;
  orderId?: string;
  paymentDetails?: {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  };
  paymentMode?: "Wallet" | "Razorpay";
  paymentVerified?: boolean;
}

export interface Wallet {
  balance: number;
  transactions: Transaction[];
}

export interface User {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  isEmailVerified?: boolean;
  subscription?: string; // Subscription Id
  wallet: Wallet;
  role?: string;
  createdAt?: string;
  referCode: string;
  referredBy?: string | null;
  fcmToken?: string | null;
}

interface UserState {
  data: User[];
  loading: boolean;
  error: string | null;
  selectedUser: User | null;
}

const initialState: UserState = {
  data: [],
  loading: false,
  error: null,
  selectedUser: null,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
});

export const {
  setUsers,
  setLoading,
  setError,
  setSelectedUser,
  clearSelectedUser,
} = userSlice.actions;

// Async actions

export const fetchUsers = () => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await apiClient.get("/users");
    if (response.status === 200) {
      dispatch(setUsers(response.data.data ?? response.data));
    } else {
      dispatch(setError(response.data.message || "Failed to fetch users"));
    }
  } catch (error: unknown) {
    const message =
      typeof error === "object" && error && "message" in error
        ? (error as { message?: string }).message
        : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const fetchUserById = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await apiClient.get(`/users/${id}`);
    if (response.status === 200) {
      dispatch(setSelectedUser(response.data.data ?? response.data));
    } else {
      dispatch(setError(response.data.message || "Failed to fetch user"));
    }
  } catch (error: unknown) {
    const message =
      typeof error === "object" && error && "message" in error
        ? (error as { message?: string }).message
        : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const addUser = (data: Partial<User>) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await apiClient.post("/users", data);
    if (response.status === 201 || response.status === 200) {
      return response.data;
    } else {
      dispatch(setError(response.data.message || "Failed to add user"));
      return null;
    }
  } catch (error: unknown) {
    const message =
      typeof error === "object" && error && "message" in error
        ? (error as { message?: string }).message
        : String(error);
    dispatch(setError(message || "Unknown error"));
    return null;
  }
};

export const updateUser = (
  id: string,
  updates: Partial<User>
) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await apiClient.put(`/users/profile/${id}`, updates);
    dispatch(setLoading(false));
    if (response.status === 200) {
      return response.data;
    } else {
      dispatch(setError(response.data.message || "Failed to update user"));
      return null;
    }
  } catch (error: unknown) {
    const message =
      typeof error === "object" && error && "message" in error
        ? (error as { message?: string }).message
        : String(error);
    dispatch(setError(message || "Unknown error"));
    dispatch(setLoading(false));
    return null;
  }
};

export const deleteUser = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await apiClient.delete(`/users/${id}`);
    if (response.status === 200) {
      return response.data;
    } else {
      dispatch(setError(response.data.message || "Failed to delete user"));
      return null;
    }
  } catch (error: unknown) {
    const message =
      typeof error === "object" && error && "message" in error
        ? (error as { message?: string }).message
        : String(error);
    dispatch(setError(message || "Unknown error"));
    return null;
  }
};

// Selectors
export const selectUsers = (state: RootState) => state.users.data;
export const selectUserById = (state: RootState) => state.users.selectedUser;
export const selectLoading = (state: RootState) => state.users.loading;
export const selectError = (state: RootState) => state.users.error;

export default userSlice.reducer;