'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hydrateAuth, selectIsHydrated } from '../../redux/auth/authSlices';

// Cheap, synchronous (localStorage-only) auth hydration that every route
// needs for `isAuthenticated` to read correctly — unlike AuthHydrator, this
// never blocks rendering on network calls (token refresh, fetchUserInfo,
// fetchSubscription), so it's safe to mount above public routes too.
export default function AuthStateSync() {
  const dispatch = useDispatch();
  const isHydrated = useSelector(selectIsHydrated);

  useEffect(() => {
    if (!isHydrated) {
      dispatch(hydrateAuth());
    }
  }, [dispatch, isHydrated]);

  return null;
}
