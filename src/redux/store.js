// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../redux/auth/authSlices'
import organizationReducer from '../redux/auth/organizationSlice'
import meetingReducer from'../redux/auth/organizationSlice'
import zoomSlice from '../redux/auth/zoomSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    organization: organizationReducer,
    meeting: meetingReducer,
    zoom: zoomSlice
  },
});
