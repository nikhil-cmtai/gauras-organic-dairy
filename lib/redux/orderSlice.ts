import { createSlice, Dispatch } from "@reduxjs/toolkit";
import { RootState } from "../store";
import apiClient from "../api";

// Payment details for order
export interface PaymentDetails {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

// Order product item
export interface OrderProduct {
  productId: string;
  productName: string;
  quantityPacket: number;
  quantity: string;
}

// Order status options
export type OrderStatus = "Pending" | "Delivered" | "Cancelled" | "Accepted";
export type PaymentMode = "Wallet" | "Razorpay";
export type RefundStatus = "Not Initiated" | "Processing" | "Refunded" | "Failed";

export interface Order {
  _id?: string;
  user: string; // user id
  products: OrderProduct[];
  totalAmount: number;
  deliveryAddress: string;
  status: OrderStatus;
  createdAt?: string;
  paymentMode?: PaymentMode;
  paymentDetails?: PaymentDetails;
  paymentVerified?: boolean;
  deliveryFee?: number;
  gst?: number;
  discount?: number;
  refundStatus?: RefundStatus;
  refundMessage?: string;
  deliveryBoy?: string;
}

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  selectedOrder: Order | null;
}

const initialState: OrderState = {
  orders: [],
  loading: false,
  error: null,
  selectedOrder: null,
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setOrders: (state, action) => {
      state.orders = action.payload;
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
    setSelectedOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
  },
});

export const { setOrders, setLoading, setError, setSelectedOrder } = orderSlice.actions;

// Fetch all orders
export const fetchOrders = () => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await apiClient.get('/orders');
    if (response.status === 200 && response.data) {
      dispatch(setOrders(response.data.data || response.data));
    } else {
      dispatch(setError(response.data?.message || "Failed to fetch orders"));
    }
  } catch (error: unknown) {
    const message =
      typeof error === "object" && error && "message" in error
        ? (error as { message?: string }).message
        : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

// Fetch single order by id
export const fetchOrderById = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await apiClient.get(`/orders/${id}`);
    const data: Order = response.data?.data || response.data;
    if (response.status === 200 && data) {
      dispatch(setSelectedOrder(data));
    } else {
      dispatch(setError(response.data?.message || "Failed to fetch order"));
    }
  } catch (error: unknown) {
    const message =
      typeof error === "object" && error && "message" in error
        ? (error as { message?: string }).message
        : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

// Add a new order
export const addOrder = (order: Order) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await apiClient.post('/orders', order);
    if (response.status === 201 || response.status === 200) {
      return response.data;
    } else {
      dispatch(setError(response.data?.message || "Failed to add order"));
    }
  } catch (error: unknown) {
    const message =
      typeof error === "object" && error && "message" in error
        ? (error as { message?: string }).message
        : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

// Update an order by id
export const updateOrder = (
  id: string,
  orderData: Record<string, unknown>
) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await apiClient.put(`/orders/${id}`, orderData);
    dispatch(setLoading(false));
    if (response.status === 200) {
      return response.data;
    } else {
      dispatch(setError(response.data?.message || "Failed to update order"));
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

// Delete an order by id
export const deleteOrder = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await apiClient.delete(`/orders/${id}`);
    if (response.status === 200) {
      return response.data;
    } else {
      dispatch(setError(response.data?.message || "Failed to delete order"));
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
export const selectOrders = (state: RootState) => state.orders.orders;
export const selectOrderById = (state: RootState) => state.orders.selectedOrder;
export const selectOrderLoading = (state: RootState) => state.orders.loading;
export const selectOrderError = (state: RootState) => state.orders.error;

export default orderSlice.reducer;