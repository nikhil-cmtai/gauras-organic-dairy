import { createSlice, Dispatch } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";

export interface Home {
  _id?: string;
  logo: string;
  banners: string[];
  company: string;
}

interface HomeState {
  data: Home[];
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
    setSelectedHome: (state, action) => {
      state.selectedHome = action.payload;
    },
    clearSelectedHome: (state) => {
      state.selectedHome = null;
    },
  },
}); 

export const { setHomes, setLoading, setError, setSelectedHome, clearSelectedHome } = homeSlice.actions;

export const fetchHomes = () => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/home`);
    
    if (response.status === 200) {
      dispatch(setHomes(response.data.data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const fetchHomeById = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/home/${id}`);
    const data: Home = response.data;
    if (response.status === 200) {
      dispatch(setSelectedHome(data));    
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const addHome = (home: FormData) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const formData = home;
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/home`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response.status === 201) {
      return response.data;
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const updateHome = (id: string, homeData: FormData) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const formData = homeData;
    const response = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/home/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    dispatch(setLoading(false));
    if (response.status === 200) {
      return response.data;
    } else {
      dispatch(setError(response.data.message));
      return null;
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
    dispatch(setLoading(false));
    return null;
  }
};

export const deleteHome = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/home/${id}`);
    if (response.status === 200) {
      return response.data;   
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const selectHomes = (state: RootState) => state.homes.data;
export const selectHomeById = (state: RootState) => state.homes.selectedHome;
export const selectLoading = (state: RootState) => state.homes.loading;
export const selectError = (state: RootState) => state.homes.error;

export default homeSlice.reducer;