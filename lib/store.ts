import { configureStore } from '@reduxjs/toolkit';
import distributorReducer from './redux/distributorSlice';
import contactReducer from './redux/categorySlice';
import authReducer from './redux/authSlice';
import categoryReducer from './redux/categorySlice';
import orderReducer from './redux/orderSlice';
import productReducer from './redux/productSlice';
import homeReducer from './redux/homeSlice';
import countReducer from './redux/countSlice';
import stockReducer from './redux/stockSlice';

export const store = configureStore({
  reducer: {
    distributors: distributorReducer,
    contacts: contactReducer,
    auth: authReducer,
    categories: categoryReducer,
    orders: orderReducer,
    products: productReducer,
    stocks: stockReducer,
    homes: homeReducer,
    count: countReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;