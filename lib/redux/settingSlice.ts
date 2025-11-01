import { createSlice, Dispatch } from "@reduxjs/toolkit";
import { RootState } from "../store";
import apiClient from "../api";

// Coupon definition mimicking couponSchema from Mongoose
export interface Coupon {
  name: string;
  discountTitle: string;
  discountAmount: number;
  discountType: "percentage" | "fixed";
}

// Settings definition mimicking settingsSchema from Mongoose
export interface Settings {
  _id?: string;
  gst: number;
  deliveryCharge: number;
  extraCharge: number;
  coupons: Coupon[];
  loginImageUrls: string[];
}

interface SettingsState {
  data: Settings | null;
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  data: null,
  loading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setSettings: (state, action) => {
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
    clearSettings: (state) => {
      state.data = null;
    },
  },
});

export const { setSettings, setLoading, setError, clearSettings } = settingsSlice.actions;

// Fetch settings (assumes a single settings document)
export const fetchSettings = () => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await apiClient.get("/settings");
    // Assume API returns either { data } or [{...}]
    if (response.status === 200) {
      const result = Array.isArray(response.data.data)
        ? response.data.data[0]
        : response.data.data ?? response.data;
      dispatch(setSettings(result));
    } else {
      dispatch(setError(response.data.message || "Failed to fetch settings"));
    }
  } catch (error: unknown) {
    const message =
      typeof error === "object" && error && "message" in error
        ? (error as { message?: string }).message
        : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

// Update settings (expects updates object, PUT to /settings/:id)
export const updateSettings = (
  id: string,
  updates: Partial<Settings>
) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await apiClient.put(`/settings/${id}`, updates);
    dispatch(setLoading(false));
    if (response.status === 200) {
      dispatch(setSettings(response.data.data ?? response.data));
      return response.data;
    } else {
      dispatch(setError(response.data.message || "Failed to update settings"));
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

// Add a coupon (PATCH to /settings/:id/coupons or PUT whole doc, as per your API)
export const addCoupon = (
  settingsId: string,
  coupon: Coupon
) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    // Here we assume you PATCH coupons array, adjust as per your API
    const response = await apiClient.patch(`/settings/${settingsId}/coupons`, { coupon });
    dispatch(setLoading(false));
    if (response.status === 200 || response.status === 201) {
      dispatch(setSettings(response.data.data ?? response.data));
      return response.data;
    } else {
      dispatch(setError(response.data.message || "Failed to add coupon"));
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

export const selectSettings = (state: RootState) => state.settings.data;
export const selectSettingsLoading = (state: RootState) => state.settings.loading;
export const selectSettingsError = (state: RootState) => state.settings.error;

export default settingsSlice.reducer;