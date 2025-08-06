'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserInfo, hydrateAuth, refreshToken, selectIsHydrated, storage } from '../../redux/auth/authSlices';

// Constants
const AUTH_STORAGE_KEYS = {
  TOKEN: 'meetingsummarizer_token',
  USER: 'meetingsummarizer_user',
  REFRESH_TOKEN: 'meetingsummarizer_refresh_token'
};

export default function AuthHydrator({ children }) {
  const dispatch = useDispatch();
  const isHydrated = useSelector(selectIsHydrated);

  useEffect(() => {
    // Only hydrate once on client mount
    if (!isHydrated) {
      dispatch(hydrateAuth());
    }
  }, [dispatch, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      const storedToken = storage.get(AUTH_STORAGE_KEYS.TOKEN);
      const refreshTokenExists = storage.get(AUTH_STORAGE_KEYS.REFRESH_TOKEN);

      if (storedToken && refreshTokenExists && isTokenExpired(storedToken)) {
        dispatch(refreshToken());
      }
    }
  }, [isHydrated, dispatch]);


  useEffect(() => {
    const getUser = async () => {
      try {
        const userInfo = await fetchUserInfo();
        storage.set(AUTH_STORAGE_KEYS.USER, userInfo);
  
        // Re-hydrate Redux state with updated localStorage
        dispatch(hydrateAuth());
      } catch (err) {
        console.error('Failed to fetch user info:', err);
      }
    };

    const token = storage.get(AUTH_STORAGE_KEYS.TOKEN);
  
    if (isHydrated && token) {
      getUser();
    }
  }, [isHydrated, dispatch]);

  // You can optionally show a loading state while hydrating
  // if (!isHydrated) {
  //   return <div>Loading...</div>;
  // }

  return children;
}

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    return Date.now() >= exp * 1000;
  } catch (e) {
    return true; // invalid token format
  }
}