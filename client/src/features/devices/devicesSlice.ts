import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../../services/api";

export interface Device {
  _id: string;
  name: string;
  type: string;
  status: "online" | "offline";
  lastPing: string;
  metadata?: any;
  currentValue?: any;
}

interface DevicesState {
  items: Device[];
  loading: boolean;
  error: string | null;
}

const initialState: DevicesState = {
  items: [],
  loading: false,
  error: null,
};

// Async thunk to fetch initial devices list via REST
export const fetchDevices = createAsyncThunk(
  "devices/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/devices");
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch devices",
      );
    }
  },
);

const devicesSlice = createSlice({
  name: "devices",
  initialState,
  reducers: {
    // These reducers handle real-time WebSocket updates
    updateDeviceTelemetry: (
      state,
      action: PayloadAction<{
        id: string;
        currentValue: any;
        lastPing: string;
      }>,
    ) => {
      const idx = state.items.findIndex((d) => d._id === action.payload.id);
      if (idx !== -1) {
        state.items[idx].currentValue = action.payload.currentValue;
        state.items[idx].lastPing = action.payload.lastPing;
      }
    },
    updateDeviceStatus: (
      state,
      action: PayloadAction<{
        id: string;
        status: "online" | "offline";
        lastPing: string;
      }>,
    ) => {
      const idx = state.items.findIndex((d) => d._id === action.payload.id);
      if (idx !== -1) {
        state.items[idx].status = action.payload.status;
        state.items[idx].lastPing = action.payload.lastPing;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDevices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { updateDeviceTelemetry, updateDeviceStatus } =
  devicesSlice.actions;

export default devicesSlice.reducer;
