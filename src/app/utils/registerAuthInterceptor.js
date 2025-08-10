// src/app/utils/registerAuthInterceptor.js
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { store } from '@/redux/store';
import { refreshToken, storage } from '@/redux/auth/authSlices';

// Keys - keep same names you already use
const ACCESS_KEY = 'meetingsummarizer_token';
const REFRESH_KEY = 'meetingsummarizer_refresh_token';

let isRegistered = false;     // ensure we register only once
let refreshPromise = null;    // single in-flight refresh promise

function tokenExpiringSoon(token) {
  if (!token) return false;
  try {
    const { exp } = jwtDecode(token);
    // Refresh a bit before expiry (e.g. 60s buffer)
    const REFRESH_BUFFER_MS = 10000; // 10 seconds
    return Date.now() >= (exp * 1000) - REFRESH_BUFFER_MS;
    // return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

async function performRefresh() {
  if (refreshPromise) {
    return refreshPromise; // already in progress
  }

  const storedRefresh = storage.get(REFRESH_KEY);
  if (!storedRefresh) {
    return null; // no refresh token available
  }

  refreshPromise = (async () => {
    try {
      const resultAction = await store.dispatch(refreshToken());

      if (resultAction?.meta?.requestStatus === 'fulfilled') {
        const payload = resultAction.payload || {};
        const newAccess = payload.access || payload.token || payload;
        const newRefresh = payload.refresh || payload.refreshToken || null;

        if (newAccess) {
          storage.set(ACCESS_KEY, newAccess);
          if (newRefresh) storage.set(REFRESH_KEY, newRefresh);
          console.log('[auth] token refreshed');
          return newAccess;
        }
      }

      console.warn('[auth] refresh did not return a new token, clearing storage');
      storage.clear();
      store.dispatch({ type: 'auth/logout' });
      return null;

    } catch (err) {
      console.error('[auth] performRefresh error', err);
      storage.clear();
      store.dispatch({ type: 'auth/logout' });
      throw err;
    } finally {
      refreshPromise = null; // ✅ only reset once here
    }
  })();

  return refreshPromise;
}


export function registerAuthInterceptor() {
  if (typeof window === 'undefined') return; // only run in browser
  if (isRegistered) return; // already registered

  isRegistered = true;
  console.log('[auth] registering axios auth interceptor');

  // Request interceptor
  axios.interceptors.request.use(
    async (config) => {
      try {
        let token = storage.get(ACCESS_KEY);

        // If token is expiring soon (or invalid), try refresh once
        if (token && tokenExpiringSoon(token)) {
          console.log('[auth] token expiring soon, attempting refresh');
          const newToken = await performRefresh();
          if (newToken) token = newToken;
        }

        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        // swallow so request still goes through without auth if something unexpected happens
        console.error('[auth] request interceptor error', err);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - retry once on 401
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (!originalRequest) return Promise.reject(error);

      // Only try once
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          console.log('[auth] 401 encountered, attempting refresh & retry');
          const newToken = await performRefresh();
          if (newToken) {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          }
        } catch (err) {
          console.error('[auth] refresh during 401 retry failed', err);
        }
      }

      return Promise.reject(error);
    }
  );
}
