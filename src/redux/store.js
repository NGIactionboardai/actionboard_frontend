import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../redux/auth/authSlices';
import organizationReducer from '../redux/auth/organizationSlice';
import meetingReducer from '../redux/auth/organizationSlice';
import zoomSlice from '../redux/auth/zoomSlice';
import jiraReducer from '../redux/auth/jiraSlice';
import billingReducer from "../redux/billing/billingSlice";

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
  ],
  blacklist: [
    'loading', 
    'error', 
    'successMessage', 
    'showConnectionModal', 
    'showDisconnectModal'
  ]
};

// Persist config for jira slice
const jiraPersistConfig = {
  key: 'jira',
  storage,
  whitelist: [
    'isConnected',
    'siteName',
    'siteUrl'
  ],
  blacklist: [
    'loading',
    'error',
    'successMessage',
    'showConnectionModal',
    'showDisconnectModal',
    'workspaces',
    'jiraProjects'
  ]
};

// Persist config for auth slice
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['token', 'user', 'isAuthenticated']
};

// Root persist config
const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['zoom', 'jira', 'auth']
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  organization: organizationReducer,
  meeting: meetingReducer,
  zoom: persistReducer(zoomPersistConfig, zoomSlice),
  jira: persistReducer(jiraPersistConfig, jiraReducer),
  billing: billingReducer,
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
