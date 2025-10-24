import { createSlice, Dispatch } from "@reduxjs/toolkit";
import { RootState } from "../store";
import axios from "axios";
import { setError } from "./authSlice";

const countSlice = createSlice({
  name: "count",
  initialState: 0,
  reducers: {
        setCount: (state, action) => {
            return action.payload;
        }
  },
});

export const { setCount } = countSlice.actions;

export const fetchCountdata = () => async (dispatch: Dispatch) => {
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/counts`);
        if (response.status === 200) {
            dispatch(setCount(response.data.data));
        } else {
            dispatch(setError(response.data.message));
        }
    } catch (error: unknown) {
        dispatch(setError(error && typeof error === 'object' && 'message' in error ? (error as { message?: string }).message : (error as string) || 'Unknown error'));
    }
}

export const selectCount = (state: RootState) => state.count;

export default countSlice.reducer;