import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface TelemetryData {
  _id: string;
  deviceId: string;
  timestamp: string;
  metrics: Record<string, any>;
}

interface TelemetryState {
  items: TelemetryData[];
  loading: boolean;
  error: string | null;
  dateRange: '24h' | '7d' | '30d';
  selectedDeviceId: string | null;
}

const initialState: TelemetryState = {
  items: [],
  loading: false,
  error: null,
  dateRange: '24h',
  selectedDeviceId: null,
};

// Async Thunks
export const fetchTelemetry = createAsyncThunk(
  'telemetry/fetchTelemetry',
  async ({ deviceId, range }: { deviceId: string, range: '24h' | '7d' | '30d' }) => {
    
    const endDate = new Date();
    const startDate = new Date();
    
    if (range === '24h') startDate.setHours(startDate.getHours() - 24);
    if (range === '7d') startDate.setDate(startDate.getDate() - 7);
    if (range === '30d') startDate.setDate(startDate.getDate() - 30);

    const response = await api.get(`/telemetry/${deviceId}`, {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 5000 // reasonable limit for browser rendering
      }
    });
    return response.data;
  }
);

const telemetrySlice = createSlice({
  name: 'telemetry',
  initialState,
  reducers: {
    setDateRange: (state, action: PayloadAction<'24h' | '7d' | '30d'>) => {
      state.dateRange = action.payload;
    },
    setSelectedDevice: (state, action: PayloadAction<string>) => {
      state.selectedDeviceId = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTelemetry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTelemetry.fulfilled, (state, action: PayloadAction<TelemetryData[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTelemetry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch telemetry';
      });
  },
});

export const { setDateRange, setSelectedDevice } = telemetrySlice.actions;
export default telemetrySlice.reducer;
