'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserInfo, hydrateAuth, refreshToken, selectIsHydrated, storage } from '../../redux/auth/authSlices';
import { registerAuthInterceptor } from '../utils/registerAuthInterceptor';
import LoadingPage from './LoadingPage';
import { fetchSubscription } from '@/redux/billing/billingSlice';

// Constants
const AUTH_STORAGE_KEYS = {
  TOKEN: 'meetingsummarizer_token',
  USER: 'meetingsummarizer_user',
  REFRESH_TOKEN: 'meetingsummarizer_refresh_token'
};

export default function AuthHydrator({ children }) {
  const dispatch = useDispatch();
  const isHydrated = useSelector(selectIsHydrated);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Only hydrate once on client mount
    if (!isHydrated) {
      dispatch(hydrateAuth());
    }
  }, [dispatch, isHydrated]);

  useEffect(() => {
    const initAuth = async () => {
      const token = storage.get(AUTH_STORAGE_KEYS.TOKEN);
      const refreshTokenVal = storage.get(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    
      // Step 1: Refresh token if expired
      if (token && refreshTokenVal && isTokenExpired(token)) {
        await dispatch(refreshToken());
      }
    
      // Step 2: Validate token again
      const validToken = storage.get(AUTH_STORAGE_KEYS.TOKEN);
    
      if (validToken) {
        try {
          // Step 3: Fetch user info
          const userInfo = await fetchUserInfo();
          storage.set(AUTH_STORAGE_KEYS.USER, userInfo);
          dispatch(hydrateAuth());
    
          // ✅ Step 4: Fetch billing (CRITICAL ADDITION)
          console.log("🔥 FETCH SUBSCRIPTION DISPATCHED");
          await dispatch(fetchSubscription());
    
        } catch (err) {
          console.error('Failed to fetch user info:', err);
        }
      }
    
      registerAuthInterceptor();
      setReady(true);
    };
  
    if (isHydrated) initAuth();
  }, [isHydrated, dispatch]);

  if (!ready) {
    return <LoadingPage />;
  }

  return children;
}

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    // refresh if less than 60 seconds left
    return Date.now() >= (exp * 1000) - 60000;
  } catch (e) {
    return true;
  }
}