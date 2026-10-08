import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = `${process.env.NEXT_PUBLIC_API_BASE_URL}/billing/current-subscriptions/`;

export const fetchSubscription = createAsyncThunk(
  "billing/fetchSubscription",
  async (orgId, { getState, rejectWithValue }) => {
    try {
      const token = getState()?.auth?.token;

      const res = await axios.get(API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: orgId ? { org_id: orgId } : undefined,
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error fetching billing");
    }
  }
);

// Any way the session ends — explicit logout, forced logout after a failed
// token refresh — must drop the subscription, or the next account to sign in on
// this device would start out with the previous one's.
const LOGOUT_ACTIONS = [
  "auth/userLogout/fulfilled",
  "auth/userLogout/rejected",
  "auth/logoutImmediate",
  "auth/logout",
  "auth/refreshToken/rejected",
];

const initialState = {
    subscription: {
        has_subscription: false,
    },
    status: "idle", // loading | success | failed
    error: null,
    // Which org the loaded subscription belongs to (null = the user's own,
    // fetched without org context). Lets consumers tell whether the data
    // matches the org currently being viewed.
    orgId: null,
    // requestId of the most recently dispatched fetch. Several fetches can be
    // in flight at once (login, org switch, after checkout); only the latest
    // may write, so an older, slower response can't overwrite a newer one.
    requestId: null,
};

const billingSlice = createSlice({
  name: "billing",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscription.pending, (state, action) => {
        state.status = "loading";
        state.requestId = action.meta.requestId;
      })
      .addCase(fetchSubscription.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.requestId) return;
        state.status = "success";
        state.subscription = action.payload || null;
        state.orgId = action.meta.arg || null;
        state.error = null;
      })
      .addCase(fetchSubscription.rejected, (state, action) => {
        if (action.meta.requestId !== state.requestId) return;
        state.status = "failed";
        state.orgId = action.meta.arg || null;
        state.error = action.payload;
      })
      .addMatcher(
        (action) => LOGOUT_ACTIONS.includes(action.type),
        () => initialState
      );
  },
});

export default billingSlice.reducer;