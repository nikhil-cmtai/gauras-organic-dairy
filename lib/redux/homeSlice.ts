import { createSlice, Dispatch } from "@reduxjs/toolkit";
import { RootState } from "../store";
import apiClient from "../api";

// Banner, FeaturedCategory, Home interfaces
export interface Banner {
  _id?: string;
  imageUrl: string;
  title: string;
  description: string;
}

export interface FeaturedCategory {
  _id?: string;
  title: string;
  products: string[];
}

export interface Home {
  _id?: string;
  banners: Banner[];
  featuredSections: FeaturedCategory[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown; // allow extra fields (like __v)
}

interface HomeState {
  data: Home[]; // We store it as an array for consistency
  loading: boolean;
  error: string | null;
  selectedHome: Home | null;
}

const initialState: HomeState = {
  data: [],
  loading: false,
  error: null,
  selectedHome: null,
};

const homeSlice = createSlice({
  name: "homes",
  initialState,
  reducers: {
    setHomes: (state, action) => {
      // Normalize: Handle when data is a single object (as in the sample response)
      const _data = action.payload;
      if (Array.isArray(_data)) {
        state.data = _data;
      } else if (_data && typeof _data === "object") {
        state.data = [_data];
      } else {
        state.data = [];
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
    setSelectedHome: (state, action) => {
      state.selectedHome = action.payload;
    },
    clearSelectedHome: (state) => {
      state.selectedHome = null;
    },
  },
});

export const {
  setHomes,
  setLoading,
  setError,
  setSelectedHome,
  clearSelectedHome,
} = homeSlice.actions;

// Fetch all Home documents
export const fetchHomes = () => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await apiClient.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/home`
    );
    if (response.status === 200) {
      // Accept both { ...object } and { data: [...] }
      const apiData = response.data;
      if ("data" in apiData && Array.isArray(apiData.data)) {
        dispatch(setHomes(apiData.data));
      } else if (typeof apiData === "object" && apiData !== null) {
        // Accept single-object response (per sample)
        dispatch(setHomes(apiData));
      } else {
        dispatch(setHomes([]));
      }
    } else {
      dispatch(setError(response.data.message || "Failed to fetch Home data."));
    }
  } catch (error: unknown) {
    const message =
      typeof error === "object" && error && "message" in error
        ? (error as { message?: string }).message
        : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

// Fetch a Home by id
export const fetchHomeById = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await apiClient.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/home/${id}`
    );
    // The API returns the Home doc directly
    const data: Home = response.data;
    if (response.status === 200) {
      dispatch(setSelectedHome(data));
    } else {
      dispatch(setError(response.data.message || "Failed to fetch Home by ID."));
    }
  } catch (error: unknown) {
    const message =
      typeof error === "object" && error && "message" in error
        ? (error as { message?: string }).message
        : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const addHome = (home: Partial<Home> | FormData) => async (
  dispatch: Dispatch
) => {
  dispatch(setLoading(true));
  try {
    let config = {};
    const payload = home;
    if (typeof FormData !== "undefined" && home instanceof FormData) {
      config = { headers: { "Content-Type": "multipart/form-data" } };
    } else {
      config = { headers: { "Content-Type": "application/json" } };
    }
    const response = await apiClient.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/home`,
      payload,
      config
    );
    if (response.status === 201 || response.status === 200) {
      return response.data;
    } else {
      dispatch(setError(response.data.message || "Failed to add Home document."));
    }
  } catch (error: unknown) {
    const message =
      typeof error === "object" && error && "message" in error
        ? (error as { message?: string }).message
        : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const updateHome = (id: string, homeData: Partial<Home> | FormData) => async (
  dispatch: Dispatch
) => {
  dispatch(setLoading(true));
  try {
    let config = {};
    const payload = homeData;
    if (typeof FormData !== "undefined" && homeData instanceof FormData) {
      config = { headers: { "Content-Type": "multipart/form-data" } };
    } else {
      config = { headers: { "Content-Type": "application/json" } };
    }
    const response = await apiClient.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/home/${id}`,
      payload,
      config
    );
    dispatch(setLoading(false));
    if (response.status === 200) {
      return response.data;
    } else {
      dispatch(setError(response.data.message || "Failed to update Home document."));
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

export const deleteHome = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await apiClient.delete(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/home/${id}`
    );
    if (response.status === 200) {
      return response.data;
    } else {
      dispatch(setError(response.data.message || "Failed to delete Home document."));
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
export const selectHomes = (state: RootState) => state.homes.data;
export const selectHomeById = (state: RootState) => state.homes.selectedHome;
export const selectLoading = (state: RootState) => state.homes.loading;
export const selectError = (state: RootState) => state.homes.error;

export default homeSlice.reducer;
