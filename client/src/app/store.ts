import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import authReducer from '../features/auth/authSlice';
import devicesReducer from '../features/devices/devicesSlice';
import rulesReducer from '../features/rules/rulesSlice';
import telemetryReducer from '../features/telemetry/telemetrySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    devices: devicesReducer,
    rules: rulesReducer,
    telemetry: telemetryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
