import { createSlice, Dispatch } from "@reduxjs/toolkit";
import { RootState } from "../store";
import apiClient from "../api";

// Subscription interface based on the provided subscription Mongoose schema
export type SubscriptionType = 'Alternate' | 'Daily' | 'Weekly';
export type SubscriptionStatus = 'Active' | 'Expired' | 'Cancelled';
export type DeliveryDay =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";
export type PaymentMode = "Wallet" | "Razorpay";

export interface PaymentDetails {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

export interface Subscription {
  _id?: string;
  user: string; // User ObjectId
  subscriptionType: SubscriptionType;
  deliveryDays: DeliveryDay | null; // if not used, can be null
  productId: string; // Product ObjectId
  address: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  renewalDate: string; // ISO date
  status: SubscriptionStatus;
  numberPacket: number;
  skippedDates: string[]; // array of ISO date strings
  createdAt?: string; // ISO date
  total: number;
  paymentDetails?: PaymentDetails;
  paymentMode?: PaymentMode;
  paymentVerified?: boolean;
  deliveryFee?: number;
  gst?: number;
  discount?: number;
  deliveryBoy?: string; // User ObjectId
}

interface SubscriptionState {
  data: Subscription[];
  loading: boolean;
  error: string | null;
  selectedSubscription: Subscription | null;
}

const initialState: SubscriptionState = {
  data: [],
  loading: false,
  error: null,
  selectedSubscription: null,
};

const subscriptionSlice = createSlice({
  name: "subscriptions",
  initialState,
  reducers: {
    setSubscriptions: (state, action) => {
      // Support for response shape: {subscriptions: []}
      if (
        action.payload &&
        typeof action.payload === "object" &&
        Array.isArray(action.payload.subscriptions)
      ) {
        state.data = action.payload.subscriptions;
      } else {
        state.data = action.payload;
      }
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
    setSelectedSubscription: (state, action) => {
      state.selectedSubscription = action.payload;
    },
    clearSelectedSubscription: (state) => {
      state.selectedSubscription = null;
    },
  },
});

export const {
  setSubscriptions,
  setLoading,
  setError,
  setSelectedSubscription,
  clearSelectedSubscription,
} = subscriptionSlice.actions;

// Fetch all Subscriptions
export const fetchSubscriptions = () => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await apiClient.get("/subscriptions/all");
    if (response.status === 200) {
      // Support for {subscriptions: []} and for {data:...} or for just array.
      if (
        response.data &&
        typeof response.data === "object" &&
        Array.isArray(response.data.subscriptions)
      ) {
        dispatch(setSubscriptions(response.data));
      } else if (
        response.data &&
        typeof response.data === "object" &&
        Array.isArray(response.data.data)
      ) {
        dispatch(setSubscriptions(response.data.data));
      } else if (Array.isArray(response.data)) {
        dispatch(setSubscriptions(response.data));
      } else {
        dispatch(setError("Invalid subscriptions response format"));
      }
    } else {
      dispatch(setError(response.data.message || "Failed to fetch subscriptions"));
    }
  } catch (error: unknown) {
    const message =
      typeof error === "object" && error && "message" in error
        ? (error as { message?: string }).message
        : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

// Fetch a Subscription by id
export const fetchSubscriptionById = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await apiClient.get(`/subscriptions/${id}`);
    let data: Subscription | undefined;
    if (
      response.data &&
      typeof response.data === "object" &&
      response.data.subscription
    ) {
      data = response.data.subscription;
    } else if (
      response.data &&
      typeof response.data === "object" &&
      response.data.data
    ) {
      data = response.data.data;
    } else {
      data = response.data;
    }
    if (response.status === 200) {
      dispatch(setSelectedSubscription(data));
    } else {
      dispatch(setError(response.data.message || "Failed to fetch subscription"));
    }
  } catch (error: unknown) {
    const message =
      typeof error === "object" && error && "message" in error
        ? (error as { message?: string }).message
        : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

// Add a new Subscription
export const addSubscription = (subscription: Partial<Subscription>) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await apiClient.post("/subscriptions", subscription);
    if (response.status === 201 || response.status === 200) {
      // Optionally refetch subscriptions
      return response.data;
    } else {
      dispatch(setError(response.data.message || "Failed to add subscription"));
    }
  } catch (error: unknown) {
    const message =
      typeof error === "object" && error && "message" in error
        ? (error as { message?: string }).message
        : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

// Update a Subscription by id
export const updateSubscription = (id: string, subscriptionData: Partial<Subscription>) => async (
  dispatch: Dispatch
) => {
  dispatch(setLoading(true));
  try {
    const response = await apiClient.put(`/subscriptions/assign-delivery-boy/${id}`, subscriptionData);
    dispatch(setLoading(false));
    if (response.status === 200) {
      return response.data;
    } else {
      dispatch(setError(response.data.message || "Failed to update subscription"));
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

// Delete a Subscription by id
export const deleteSubscription = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await apiClient.delete(`/subscriptions/${id}`);
    if (response.status === 200) {
      return response.data;
    } else {
      dispatch(setError(response.data.message || "Failed to delete subscription"));
    }
  } catch (error: unknown) {
    const message =
      typeof error === "object" && error && "message" in error
        ? (error as { message?: string }).message
        : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

// Selectors
export const selectSubscriptions = (state: RootState) => state.subscriptions.data;
export const selectSubscriptionById = (state: RootState) => state.subscriptions.selectedSubscription;
export const selectSubscriptionsLoading = (state: RootState) => state.subscriptions.loading;
export const selectSubscriptionsError = (state: RootState) => state.subscriptions.error;

export default subscriptionSlice.reducer;