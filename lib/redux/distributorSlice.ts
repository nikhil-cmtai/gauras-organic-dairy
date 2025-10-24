import { createSlice, Dispatch } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";

export interface Distributor {
  _id?: string;
  name: string;
  password?: string;
  phone: string;
  address: string;
  pincode: string;
}

export interface DistributorState {
  data: Distributor[];
  loading: boolean;
  error: string | null;
  selectedDistributor: Distributor | null;
}

const initialState: DistributorState = {
  data: [],
  loading: false,
  error: null,
  selectedDistributor: null,
};

const distributorSlice = createSlice({
  name: "distributors",
  initialState,
  reducers: {
    setDistributors: (state, action) => {
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
    setSelectedDistributor: (state, action) => {
      state.selectedDistributor = action.payload;
    },
    clearSelectedDistributor: (state) => {
      state.selectedDistributor = null;
    },
  },
});

export const { setDistributors, setLoading, setError, setSelectedDistributor, clearSelectedDistributor } = distributorSlice.actions;

export const fetchDistributors = () => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/distributor`);
    if (response.status === 200) {
      dispatch(setDistributors(response.data.data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const fetchDistributorById = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/distributor-single/${id}`);
    const data: Distributor = response.data;
    if (response.status === 200) {
      dispatch(setSelectedDistributor(data));
      dispatch(setLoading(false));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const addDistributor = (distributor: Partial<Distributor>) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/distributor`, distributor);
    if (response.status === 201) {
      dispatch(setLoading(false));
      return response.data;
    } else {
      dispatch(setError(response.data.message));
      return null;
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const updateDistributor = (id: string, distributor: Partial<Distributor>) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/distributor/${id}`, distributor);
    if (response.status === 200) {
      dispatch(setLoading(false));
      return response.data;
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const deleteDistributor = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/distributor/${id}`);
    if (response.status === 200) {
      dispatch(setLoading(false));
      return response.data;
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const selectDistributors = (state: RootState) => state.distributors.data;
export const selectDistributorById = (state: RootState) => state.distributors.selectedDistributor;
export const selectLoading = (state: RootState) => state.distributors.loading;
export const selectError = (state: RootState) => state.distributors.error;

export default distributorSlice.reducer;