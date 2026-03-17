import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import devicesReducer from '../features/devices/devicesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    devices: devicesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
