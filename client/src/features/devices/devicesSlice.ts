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

// Async Thunk matching Phase 1
export const fetchDevices = createAsyncThunk(
  "devices/fetchDevices",
  async () => {
    const response = await api.get("/devices");
    return response.data;
  },
);

// Phase 2: Send Command
export const sendCommandAction = createAsyncThunk(
  "devices/sendCommandAction",
  async ({
    deviceId,
    action,
    value,
  }: {
    deviceId: string;
    action: string;
    value: any;
  }) => {
    const response = await api.post("/commands", {
      deviceId,
      action,
      value,
    });
    return response.data;
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
    // Optimistic UI updates based on the command that was sent
    optimisticCommandUpdate: (
      state,
      action: PayloadAction<{ deviceId: string; action: string; value: any }>,
    ) => {
      const index = state.items.findIndex(
        (d) => d._id === action.payload.deviceId,
      );
      if (index !== -1) {
        if (action.payload.action === "toggle") {
          state.items[index].currentValue.state = action.payload.value;
          state.items[index].status = action.payload.value
            ? "online"
            : "offline";
        }
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

export const {
  updateDeviceTelemetry,
  updateDeviceStatus,
  optimisticCommandUpdate,
} = devicesSlice.actions;

export default devicesSlice.reducer;
