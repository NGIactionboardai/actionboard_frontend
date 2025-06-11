'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { hydrateAuth, selectIsHydrated } from '../../redux/auth/authSlices';

export default function AuthHydrator({ children }) {
  const dispatch = useDispatch();
  const isHydrated = useSelector(selectIsHydrated);

  useEffect(() => {
    // Only hydrate once on client mount
    if (!isHydrated) {
      dispatch(hydrateAuth());
    }
  }, [dispatch, isHydrated]);

  // You can optionally show a loading state while hydrating
  // if (!isHydrated) {
  //   return <div>Loading...</div>;
  // }

  return children;
}