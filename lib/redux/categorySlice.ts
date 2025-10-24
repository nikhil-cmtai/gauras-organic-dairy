import { createSlice, Dispatch } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";

export interface Category {
  _id?: string;
  name: string;
  categoryCode: string;
  image: string;
}

interface CategoryState {
  data: Category[];
  loading: boolean;
  error: string | null;
  selectedCategory: Category | null;
}

const initialState: CategoryState = {
  data: [],
  loading: false,
  error: null,
  selectedCategory: null,
  };  

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setCategories: (state, action) => {
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
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
  },
}); 

export const { setCategories, setLoading, setError, setSelectedCategory } = categorySlice.actions;

export const fetchCategories = () => async (dispatch: Dispatch) => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories`);
    if (response.status === 200) {
      dispatch(setCategories(response.data.data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const fetchCategoryById = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories/${id}`);
    const data: Category = response.data;
    if (response.status === 200) {
      dispatch(setSelectedCategory(data));    
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const addCategory = (category: FormData) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const formData = category;
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories`, formData, {
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

export const updateCategory = (id: string, categoryData: FormData) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const formData = categoryData;
    const response = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories/${id}`, formData, {
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

export const deleteCategory = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories/${id}`);
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

export const selectCategory = (state: RootState) => state.categories.data;
export const selectCategoryById = (state: RootState) => state.categories.selectedCategory;
export const selectLoading = (state: RootState) => state.categories.loading;
export const selectError = (state: RootState) => state.categories.error;

export default categorySlice.reducer;