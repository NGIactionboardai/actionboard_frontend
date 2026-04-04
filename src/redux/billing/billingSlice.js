import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = `${process.env.NEXT_PUBLIC_API_BASE_URL}/billing/current-subscriptions/`;

export const fetchSubscription = createAsyncThunk(
  "billing/fetchSubscription",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState()?.auth?.token;

      const res = await axios.get(API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error fetching billing");
    }
  }
);

const billingSlice = createSlice({
  name: "billing",
  initialState: {
    subscription: {
        has_subscription: false,
    },
    status: "idle", // loading | success | failed
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscription.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSubscription.fulfilled, (state, action) => {
        state.status = "success";
        state.subscription = action.payload || null;
        state.error = null;
      })
      .addCase(fetchSubscription.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default billingSlice.reducer;