import { createSlice } from "@reduxjs/toolkit";
import { RootState, AppDispatch } from "../store";
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
  products: string[] | Array<{
    _id: string;
    name: string;
    category?: string;
    price?: number[];
    imageUrl?: string;
    [key: string]: unknown;
  }>;
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
export const fetchHomes = () => async (dispatch: AppDispatch) => {
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
export const fetchHomeById = (id: string) => async (dispatch: AppDispatch) => {
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
  dispatch: AppDispatch
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

export const updateHome = ( homeData: Partial<Home> | FormData) => async (
  dispatch: AppDispatch
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
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/home`,
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

export const deleteHome = (id: string) => async (dispatch: AppDispatch) => {
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

// Banner CRUD operations using home/banner endpoint
export const addBanner = (banner: Partial<Banner> | FormData) => async (
  dispatch: AppDispatch
) => {
  dispatch(setLoading(true));
  try {
    let config = {};
    if (typeof FormData !== "undefined" && banner instanceof FormData) {
      config = { headers: { "Content-Type": "multipart/form-data" } };
    }
    const response = await apiClient.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/home/banner`,
      banner,
      config
    );
    dispatch(setLoading(false));
    if (response.status === 201 || response.status === 200) {
      // Refresh home data
      await dispatch(fetchHomes());
      return response.data;
    } else {
      dispatch(setError(response.data.message || "Failed to add Banner document."));
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

export const updateBanner = (id: string, banner: Partial<Banner> | FormData) => async (
  dispatch: AppDispatch
) => {
  dispatch(setLoading(true));
  try {
    let config = {};
    if (typeof FormData !== "undefined" && banner instanceof FormData) {
      config = { headers: { "Content-Type": "multipart/form-data" } };
      // Add ID to FormData if it's FormData
      if (banner instanceof FormData) {
        banner.append("_id", id);
      }
    } else {
      // Add ID to payload
      const payload = { ...banner, _id: id };
      banner = payload;
    }
    const response = await apiClient.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/home/banner`,
      banner,
      config
    );
    dispatch(setLoading(false));
    if (response.status === 201 || response.status === 200) {
      // Refresh home data
      await dispatch(fetchHomes());
      return response.data;
    } else {
      dispatch(setError(response.data.message || "Failed to update Banner document."));
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

export const deleteBanner = (id: string) => async (dispatch: AppDispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await apiClient.delete(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/home/banner/${id}`
    );
    dispatch(setLoading(false));
    if (response.status === 200) {
      // Refresh home data
      await dispatch(fetchHomes());
      return response.data;
    } else {
      dispatch(setError(response.data.message || "Failed to delete Banner document."));
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

// Section CRUD operations using home/section endpoint
export const addSection = (section: Partial<FeaturedCategory>) => async (
  dispatch: AppDispatch
) => {
  dispatch(setLoading(true));
  try {
    // Always send as JSON, not FormData
    const config = { headers: { "Content-Type": "application/json" } };
    const response = await apiClient.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/home/section`,
      section,
      config
    );
    dispatch(setLoading(false));
    if (response.status === 201 || response.status === 200) {
      // Refresh home data
      await dispatch(fetchHomes());
      return response.data;
    } else {
      dispatch(setError(response.data.message || "Failed to add Section document."));
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

export const updateSection = (id: string, section: Partial<FeaturedCategory>) => async (
  dispatch: AppDispatch
) => {
  dispatch(setLoading(true));
  try {
    // Always send as JSON, not FormData
    const config = { headers: { "Content-Type": "application/json" } };
    // Add ID to payload
    const payload = { ...section, _id: id };
    const response = await apiClient.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/home/section`,
      payload,
      config
    );
    dispatch(setLoading(false));
    if (response.status === 201 || response.status === 200) {
      // Refresh home data
      await dispatch(fetchHomes());
      return response.data;
    } else {
      dispatch(setError(response.data.message || "Failed to update Section document."));
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

export const deleteSection = (id: string) => async (dispatch: AppDispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await apiClient.delete(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/home/section/${id}`
    );
    dispatch(setLoading(false));
    if (response.status === 200) {
      // Refresh home data
      await dispatch(fetchHomes());
      return response.data;
    } else {
      dispatch(setError(response.data.message || "Failed to delete Section document."));
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

// Selectors
export const selectHomes = (state: RootState) => state.homes.data;
export const selectBanners = (state: RootState): Banner[] => {
  // Extract all banners from all home entries
  const homes = state.homes.data;
  const allBanners: Banner[] = [];
  homes.forEach((home) => {
    if (Array.isArray(home.banners)) {
      allBanners.push(...home.banners);
    }
  });
  return allBanners;
};
export const selectSections = (state: RootState): FeaturedCategory[] => {
  // Extract all sections from all home entries
  const homes = state.homes.data;
  const allSections: FeaturedCategory[] = [];
  homes.forEach((home) => {
    if (Array.isArray(home.featuredSections)) {
      allSections.push(...home.featuredSections);
    }
  });
  return allSections;
};
export const selectHomeById = (state: RootState) => state.homes.selectedHome;
export const selectLoading = (state: RootState) => state.homes.loading;
export const selectError = (state: RootState) => state.homes.error;

export default homeSlice.reducer;
