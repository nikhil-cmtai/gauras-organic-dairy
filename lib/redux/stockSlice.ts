import { createSlice, Dispatch } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";

export interface Stock {
  _id?: string;
  categoryId: string;
  productId: string;
  productCode: string;
  stock: number;
  company: string;
  name: string;
  distributorId: string;

}

interface StockState {
  data: Stock[];
  loading: boolean;
  error: string | null;
  selectedStock: Stock | null;
}

const initialState: StockState = {
  data: [],
  loading: false,
  error: null,
  selectedStock: null,
};  

  const stockSlice = createSlice({
  name: "stocks",
  initialState,
  reducers: {
    setStocks: (state, action) => {
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
    setSelectedStock: (state, action) => {
      state.selectedStock = action.payload;
    },
    clearSelectedStock: (state) => {
      state.selectedStock = null;
    },
  },
}); 

export const { setStocks, setLoading, setError, setSelectedStock, clearSelectedStock } = stockSlice.actions;

export const fetchStocks = () => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
     const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/stocks`);
    
    if (response.status === 200) {
      dispatch(setStocks(response.data.data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const fetchStockById = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/stocks/${id}`);
    const data: Stock = response.data;
    if (response.status === 200) {
      dispatch(setSelectedStock(data));    
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const addStock = (formData: FormData) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/stocks`, formData);
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

export const updateStock = (id: string, formData: FormData) => async (dispatch: Dispatch) => {
  // The service only needs the fields to update, not the whole object
  dispatch(setLoading(true));
  try {
    const response = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/stocks/${id}`, formData);
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

export const deleteStock = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/stocks/${id}`);
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

export const selectStocks = (state: RootState) => state.stocks.data;
export const selectStockById = (state: RootState) => state.stocks.selectedStock;
export const selectLoading = (state: RootState) => state.stocks.loading;
export const selectError = (state: RootState) => state.stocks.error;

export default stockSlice.reducer;