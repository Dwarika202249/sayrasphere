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
  lastSeen?: string;
  uptimeSince?: string;
  metadata?: Record<string, unknown>;
  location?: {
    lat: number;
    lng: number;
  };
  currentValue?: Record<string, unknown>;
}

interface DevicesState {
  items: Device[];
  isSimulating: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: DevicesState = {
  items: [],
  isSimulating: false,
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
    value: unknown;
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
        currentValue: Record<string, unknown>;
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
      action: PayloadAction<{ deviceId: string; action: string; value: unknown }>,
    ) => {
      const index = state.items.findIndex(
        (d) => d._id === action.payload.deviceId,
      );
      if (index !== -1) {
        if (action.payload.action === "toggle") {
          const device = state.items[index];
          // Ensure currentValue exists
          if (!device.currentValue) {
            device.currentValue = {};
          }
          device.currentValue.state = action.payload.value;
          
          // Also update status to reflect the toggle if applicable
          state.items[index].status = action.payload.value
            ? "online"
            : "offline";
        }
      }
    },
    setSimulating: (state, action: PayloadAction<boolean>) => {
      state.isSimulating = action.payload;
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
        
        // Intelligently set isSimulating based on device presence
        // If there are devices, we assume simulation is active (especially for the showcase user)
        if (action.payload.length > 0) {
          state.isSimulating = true;
        } else {
          state.isSimulating = false;
        }
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
  setSimulating,
} = devicesSlice.actions;

export default devicesSlice.reducer;
