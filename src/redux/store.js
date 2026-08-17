import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../redux/auth/authSlices';
import orgSelectionReducer from '../redux/auth/orgSelectionSlice';
import { organizationApi } from '../redux/api/organizationApi';
import { meetingsApi } from '../redux/api/meetingsApi';
import zoomSlice from '../redux/auth/zoomSlice';
import billingReducer from "../redux/billing/billingSlice";
import googleCalendarReducer from "../redux/integrations/googleCalendarSlice";
import jiraReducer from '../redux/integrations/jiraSlice';
import slackReducer from '../redux/integrations/slackSlice';
import teamsReducer from '../redux/integrations/teamsSlice';
import aiChatReducer from '../redux/aiChat/aiChatSlice';


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
  // zoom/auth handled separately; aiChat should always be fresh from the server;
  // RTK Query cache reducers should always refetch fresh too, not survive a reload.
  blacklist: ['zoom', 'auth', 'aiChat', organizationApi.reducerPath, meetingsApi.reducerPath],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  orgSelection: orgSelectionReducer,
  [organizationApi.reducerPath]: organizationApi.reducer,
  [meetingsApi.reducerPath]: meetingsApi.reducer,
  zoom: persistReducer(zoomPersistConfig, zoomSlice),
  billing: billingReducer,
  googleCalendar: googleCalendarReducer,
  jira: jiraReducer,
  slack: slackReducer,
  teams: teamsReducer,
  aiChat: aiChatReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(organizationApi.middleware, meetingsApi.middleware),
});

export const persistor = persistStore(store);