'use client';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { selectIsAuthenticated, selectIsHydrated } from '@/redux/auth/authSlices';
import LandingPage from '../components/landing/LandingPage';

// Main component that conditionally renders based on authentication
export default function ConditionalPage() {
  const isHydrated = useSelector(selectIsHydrated);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const router = useRouter();

  useEffect(() => {
    // If authenticated, redirect to organizations route
    if (isAuthenticated) {
      router.push('/organizations');
    }
  }, [isAuthenticated, router]);

  // Auth state hasn't been read from localStorage yet — this is a single
  // synchronous read, not a network wait, so it resolves in one tick.
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If authenticated, show loading while redirecting
  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Redirecting to organizations...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show landing page
  return <LandingPage />;
}