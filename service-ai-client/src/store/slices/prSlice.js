import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const analyzePR = createAsyncThunk("pr/analyze", async (data, { rejectWithValue }) => {
  try {
    const res = await api.post("/pr/analyze", data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || "Failed to analyze PR");
  }
});

export const fetchPRs = createAsyncThunk("pr/fetchAll", async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/pr${query ? "?" + query : ""}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || "Failed to fetch PRs");
  }
});

export const fetchPR = createAsyncThunk("pr/fetchOne", async (prId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/pr/${prId}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || "Failed to fetch PR");
  }
});

const prSlice = createSlice({
  name: "pr",
  initialState: {
    prs: [],
    currentPR: null,
    pagination: null,
    loading: false,
    error: null,
    activeSteps: {},
  },
  reducers: {
    updateStep: (state, action) => {
      const { prId, step, status, details } = action.payload;
      if (!state.activeSteps[prId]) {
        state.activeSteps[prId] = {};
      }
      state.activeSteps[prId][step] = { status, details };
    },
    clearActiveSteps: (state, action) => {
      delete state.activeSteps[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(analyzePR.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(analyzePR.fulfilled, (state) => { state.loading = false; })
      .addCase(analyzePR.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchPRs.pending, (state) => { state.loading = true; })
      .addCase(fetchPRs.fulfilled, (state, action) => {
        state.loading = false;
        state.prs = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPRs.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchPR.pending, (state) => { state.loading = true; })
      .addCase(fetchPR.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPR = action.payload.data;
      })
      .addCase(fetchPR.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { updateStep, clearActiveSteps } = prSlice.actions;
export default prSlice.reducer;
