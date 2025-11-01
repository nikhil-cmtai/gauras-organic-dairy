import { configureStore } from '@reduxjs/toolkit';
import authReducer from './redux/authSlice';
import orderReducer from './redux/orderSlice';
import productReducer from './redux/productSlice';
import homeReducer from './redux/homeSlice';
import countReducer from './redux/countSlice';
import subscriptionReducer from './redux/subscriptionSlice';
import userReducer from './redux/userSlice';
import settingReducer from './redux/settingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    orders: orderReducer,
    products: productReducer,
    homes: homeReducer,
    count: countReducer,
    subscriptions: subscriptionReducer,
    users: userReducer,
    settings: settingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;