// src/app/components/InterceptorLoader.jsx
'use client';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { registerAuthInterceptor } from '@/app/utils/registerAuthInterceptor';
import { selectIsHydrated } from '@/redux/auth/authSlices';

export default function InterceptorLoader() {
  const isHydrated = useSelector(selectIsHydrated);
  // If you exposed a 'refreshing' state in the slice, use it here:
  const refreshing = useSelector((state) => state.auth.refreshing);

  useEffect(() => {
    // Wait until hydrate step is done AND any initial refresh is finished (refreshing===false)
    if (isHydrated && !refreshing) {
      registerAuthInterceptor();
    }
  }, [isHydrated, refreshing]);

  return null;
}
