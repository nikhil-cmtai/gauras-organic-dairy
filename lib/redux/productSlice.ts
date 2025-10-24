import { createSlice, Dispatch } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";

export interface Product {
  _id?: string;
  name: string;
  price: number;
  image: string[];
  categoryId: string;
  description: string;
  company: string;
  productCode: string;
}

interface ProductState {
  data: Product[];
  loading: boolean;
  error: string | null;
  selectedProduct: Product | null;
}

const initialState: ProductState = {
  data: [],
  loading: false,
  error: null,
  selectedProduct: null,
};  

  const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProducts: (state, action) => {
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
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
  },
}); 

export const { setProducts, setLoading, setError, setSelectedProduct, clearSelectedProduct } = productSlice.actions;

export const fetchProducts = () => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
     const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products`);
    
    if (response.status === 200) {
      dispatch(setProducts(response.data.data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const fetchProductById = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${id}`);
    const data: Product = response.data;
    if (response.status === 200) {
      dispatch(setSelectedProduct(data));    
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const addProduct = (formData: FormData) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products`, formData);
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

export const updateProduct = (id: string, formData: FormData) => async (dispatch: Dispatch) => {
  // The service only needs the fields to update, not the whole object
  dispatch(setLoading(true));
  try {
    const response = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${id}`, formData);
    dispatch(setLoading(false)); // Turn off loading after call
    if (response.status === 200) {
      return response.data; // Return data on success
    } else {
      dispatch(setError(response.data.message));
      return null; // Return null on failure
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
    dispatch(setLoading(false));
    return null; // Return null on error
  }
};

export const deleteProduct = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${id}`);
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

export const selectProducts = (state: RootState) => state.products.data;
export const selectProductById = (state: RootState) => state.products.selectedProduct;
export const selectLoading = (state: RootState) => state.products.loading;
export const selectError = (state: RootState) => state.products.error;

export default productSlice.reducer;