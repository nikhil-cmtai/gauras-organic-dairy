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

// Update basic settings and coupons (one API endpoint)
export const updateBasicSettings = (
  updates: Partial<Settings>
) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await apiClient.post(`/settings/`, updates);
    dispatch(setLoading(false));
    if (response.status === 200) {
      dispatch(setSettings(response.data.data ?? response.data));
      return response.data;
    } else {
      dispatch(setError(response.data.message || "Failed to update basic settings"));
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

// Update banner/login images (separate API endpoint with index values)
// Accepts either File (for upload) or string (for URL), and optional index
export const updateBannerImage = (
  image: File | string,
  index?: number
) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    let response;
    
    if (image instanceof File) {
      // File upload - use FormData
      const formData = new FormData();
      formData.append("image", image);
      if (index !== undefined) {
        formData.append("index", index.toString());
      }
      
      response = await apiClient.post(`/settings/banner`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    } else {
      // URL string - send as JSON
      const payload = index !== undefined 
        ? { imageUrl: image, index }
        : { imageUrl: image };
      response = await apiClient.post(`/settings/banner`, payload);
    }
    
    dispatch(setLoading(false));
    if (response.status === 200) {
      dispatch(setSettings(response.data.data ?? response.data));
      return response.data;
    } else {
      dispatch(setError(response.data.message || "Failed to update banner image"));
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

// Remove banner/login image by index
export const removeBannerImage = (
  index: number
) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await apiClient.post(`/settings/banner`, { index, action: "remove" });
    dispatch(setLoading(false));
    if (response.status === 200) {
      dispatch(setSettings(response.data.data ?? response.data));
      return response.data;
    } else {
      dispatch(setError(response.data.message || "Failed to remove banner image"));
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