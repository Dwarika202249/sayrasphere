import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface AutomationRule {
  _id: string;
  name: string;
  trigger: {
    deviceId: { _id: string, name: string, type: string };
    metric: string;
    operator: string;
    value: any;
  };
  action: {
    deviceId: { _id: string, name: string, type: string };
    command: string;
    value: any;
  };
  enabled: boolean;
  createdAt: string;
}

interface RulesState {
  items: AutomationRule[];
  loading: boolean;
  error: string | null;
}

const initialState: RulesState = {
  items: [],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchRules = createAsyncThunk('rules/fetchRules', async () => {
  const response = await api.get('/rules');
  return response.data;
});

export const createRuleAction = createAsyncThunk(
  'rules/createRule',
  async (ruleData: any) => {
    const response = await api.post('/rules', ruleData);
    return response.data;
  }
);

export const toggleRuleAction = createAsyncThunk(
  'rules/toggleRule',
  async ({ ruleId, enabled }: { ruleId: string; enabled: boolean }) => {
    const response = await api.patch(`/rules/${ruleId}/toggle`, { enabled });
    return response.data;
  }
);

export const deleteRuleAction = createAsyncThunk(
  'rules/deleteRule',
  async (ruleId: string) => {
    await api.delete(`/rules/${ruleId}`);
    return ruleId; // return ID so Reducer can pop it locally
  }
);

const rulesSlice = createSlice({
  name: 'rules',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch
    builder
      .addCase(fetchRules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRules.fulfilled, (state, action: PayloadAction<AutomationRule[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchRules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch rules';
      });
      
    // Create
    builder
      .addCase(createRuleAction.fulfilled, (state, action: PayloadAction<AutomationRule>) => {
         // In a real app we might want to re-fetch rules so that the nested deviceId population is correct.
         // For now we just push it to the list. (or realistically trigger a re-fetch from the component)
         state.items.push(action.payload);
      });

    // Toggle
    builder
      .addCase(toggleRuleAction.fulfilled, (state, action) => {
         const index = state.items.findIndex(r => r._id === action.payload._id);
         if (index !== -1) {
             state.items[index].enabled = action.payload.enabled;
         }
      });

    // Delete
    builder
      .addCase(deleteRuleAction.fulfilled, (state, action: PayloadAction<string>) => {
         state.items = state.items.filter(r => r._id !== action.payload);
      });
  },
});

export default rulesSlice.reducer;
