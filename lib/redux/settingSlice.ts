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
// If settings don't exist, creates default settings
export const fetchSettings = () => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await apiClient.get("/settings");
    // Assume API returns either { data } or [{...}]
    if (response.status === 200) {
      const result = Array.isArray(response.data.data)
        ? response.data.data[0]
        : response.data.data ?? response.data;
      
      // If no settings exist, create default settings
      if (!result || (Array.isArray(result) && result.length === 0)) {
        const defaultSettings: Partial<Settings> = {
          gst: 0,
          deliveryCharge: 0,
          extraCharge: 0,
          coupons: [],
          loginImageUrls: [],
        };
        
        // Create settings
        const createResponse = await apiClient.post(`/settings/`, defaultSettings);
        if (createResponse.status === 200 || createResponse.status === 201) {
          const createdSettings = createResponse.data.data ?? createResponse.data;
          dispatch(setSettings(createdSettings));
        } else {
          dispatch(setError("Failed to create default settings"));
        }
      } else {
        dispatch(setSettings(result));
      }
    } else {
      dispatch(setError(response.data.message || "Failed to fetch settings"));
    }
  } catch (error: unknown) {
    // If 404 or settings not found, create default settings
    const errorObj = error as { response?: { status?: number } };
    if (errorObj.response?.status === 404 || errorObj.response?.status === 400) {
      try {
        const defaultSettings: Partial<Settings> = {
          gst: 0,
          deliveryCharge: 0,
          extraCharge: 0,
          coupons: [],
          loginImageUrls: [],
        };
        
        const createResponse = await apiClient.post(`/settings/`, defaultSettings);
        if (createResponse.status === 200 || createResponse.status === 201) {
          const createdSettings = createResponse.data.data ?? createResponse.data;
          dispatch(setSettings(createdSettings));
        } else {
          dispatch(setError("Failed to create default settings"));
        }
      } catch (createError) {
        const message =
          typeof createError === "object" && createError && "message" in createError
            ? (createError as { message?: string }).message
            : String(createError);
        dispatch(setError(message || "Failed to create settings"));
      }
    } else {
      const message =
        typeof error === "object" && error && "message" in error
          ? (error as { message?: string }).message
          : String(error);
      dispatch(setError(message || "Unknown error"));
    }
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

// Add banner/login image (separate API endpoint)
// Accepts either File (for upload) or string (for URL)
export const addBannerImage = (
  image: File | string
) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    let response;
    
    if (image instanceof File) {
      // File upload - use FormData
      const formData = new FormData();
      formData.append("image", image);
      
      response = await apiClient.post(`/settings/banner`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    } else {
      // URL string - send as JSON
      const payload = { imageUrl: image };
      response = await apiClient.post(`/settings/banner`, payload);
    }
    
    dispatch(setLoading(false));
    if (response.status === 200) {
      dispatch(setSettings(response.data.data ?? response.data));
      return response.data;
    } else {
      dispatch(setError(response.data.message || "Failed to add banner image"));
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

// Remove banner/login image by index (index sent in URL params)
export const removeBannerImage = (
  index: number
) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await apiClient.delete(`/settings/banner/${index}`);
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