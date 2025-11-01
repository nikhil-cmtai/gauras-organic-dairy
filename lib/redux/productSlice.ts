import { createSlice, Dispatch } from "@reduxjs/toolkit";
import { RootState } from "../store";
import apiClient from "../api";

// Adapting Redux Product interface to match the provided Mongoose product schema
export interface Product {
  _id?: string;
  name: string;
  category: "Milk" | "Butter" | "Cheese" | "Yogurt" | "Ghee";
  price: number[];
  dailyPrice?: number[];
  alternatePrice?: number[];
  weeklyPrice?: number[];
  description?: string[];
  stock?: number;
  imageUrl?: string;
  quantity?: string[];
  createdAt?: string;
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
      // Support for response shape: {products: []}
      if (
        action.payload &&
        typeof action.payload === "object" &&
        Array.isArray(action.payload.products)
      ) {
        state.data = action.payload.products;
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
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
  },
});

export const {
  setProducts,
  setLoading,
  setError,
  setSelectedProduct,
  clearSelectedProduct,
} = productSlice.actions;

// Fetch all products
export const fetchProducts = () => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await apiClient.get("/products");
    if (response.status === 200) {
      // Support for {products: []} and for {data:...} or for just array.
      if (
        response.data &&
        typeof response.data === "object" &&
        Array.isArray(response.data.products)
      ) {
        dispatch(setProducts(response.data.products));
      } else if (
        response.data &&
        typeof response.data === "object" &&
        Array.isArray(response.data.data)
      ) {
        dispatch(setProducts(response.data.data));
      } else if (Array.isArray(response.data)) {
        dispatch(setProducts(response.data));
      } else {
        dispatch(setError("Invalid products response format"));
      }
    } else {
      dispatch(setError(response.data.message || "Failed to fetch products"));
    }
  } catch (error: unknown) {
    const message =
      typeof error === "object" && error && "message" in error
        ? (error as { message?: string }).message
        : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

// Fetch product by ID
export const fetchProductById = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await apiClient.get(`/products/${id}`);
    let data: Product | undefined;
    if (
      response.data &&
      typeof response.data === "object" &&
      response.data.product
    ) {
      data = response.data.product;
    } else if (
      response.data &&
      typeof response.data === "object" &&
      response.data.data
    ) {
      data = response.data.data;
    } else {
      data = response.data;
    }
    if (response.status === 200 && data) {
      dispatch(setSelectedProduct(data));
    } else {
      dispatch(setError(response.data.message || "Failed to fetch product"));
    }
  } catch (error: unknown) {
    const message =
      typeof error === "object" && error && "message" in error
        ? (error as { message?: string }).message
        : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

// Insert product (expects FormData for uploading, or a plain object as per API needs)
// Returns new product data or null on error
export const addProduct = (data: FormData | Partial<Product>) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const config = data instanceof FormData
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : {};
    const response = await apiClient.post("/products", data, config);
    if (response.status === 201 || response.status === 200) {
      return response.data;
    } else {
      dispatch(setError(response.data.message || "Failed to add product"));
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

// Update product by ID (expects FormData or object with keys to update)
export const updateProduct = (
  id: string,
  updates: FormData | Partial<Product>
) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const config = updates instanceof FormData
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : {};
    const response = await apiClient.put(`/products/${id}`, updates, config);
    dispatch(setLoading(false));
    if (response.status === 200) {
      return response.data;
    } else {
      dispatch(setError(response.data.message || "Failed to update product"));
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

// Delete product by ID
export const deleteProduct = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await apiClient.delete(`/products/${id}`);
    if (response.status === 200) {
      return response.data;
    } else {
      dispatch(setError(response.data.message || "Failed to delete product"));
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
export const selectProducts = (state: RootState) => state.products.data;
export const selectProductById = (state: RootState) => state.products.selectedProduct;
export const selectLoading = (state: RootState) => state.products.loading;
export const selectError = (state: RootState) => state.products.error;

export default productSlice.reducer;