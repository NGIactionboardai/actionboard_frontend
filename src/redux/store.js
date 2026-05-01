import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../redux/auth/authSlices';
import organizationReducer from '../redux/auth/organizationSlice';
// import meetingReducer from '../redux/auth/organizationSlice';
import zoomSlice from '../redux/auth/zoomSlice';
import billingReducer from "../redux/billing/billingSlice";
import googleCalendarReducer from "../redux/integrations/googleCalendarSlice";
import meetingReducer from '../redux/meetings/meetingSlice';


// Persist config for zoom slice
const zoomPersistConfig = {
  key: 'zoom',
  storage,
  whitelist: [
    'isConnected', 
    'userInfo', 
    'tokenExpiry', 
    'currentOrganizationId',
    'connectionStatus'
  ], // Only persist these fields
  blacklist: [
    'loading', 
    'error', 
    'successMessage', 
    'showConnectionModal', 
    'showDisconnectModal'
  ] // Don't persist UI state
};

// Persist config for auth slice
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['token', 'user', 'isAuthenticated'] // Only persist essential auth data
};

// Root persist config
const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['zoom', 'auth'] // We handle these separately
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  organization: organizationReducer,
  meeting: meetingReducer,
  zoom: persistReducer(zoomPersistConfig, zoomSlice),
  billing: billingReducer,
  googleCalendar: googleCalendarReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);