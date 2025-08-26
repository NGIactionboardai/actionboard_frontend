'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/redux/auth/authSlices';

const PUBLIC_PATHS = [
    '/',
  '/auth/login',
  '/auth/register',
  '/terms',
  '/privacy-policy',
  '/help',
  '/feedback-form',
  '/zoom-connection-doc'
];

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Check if current path is public (no auth required)
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  useEffect(() => {
    // If not authenticated and not on public route, redirect to login
    if (!isAuthenticated && !isPublic) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isPublic, router]);

  // Show loading while checking auth on protected routes
  if (!isAuthenticated && !isPublic) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Authenticated or public route, render children normally
  return children;
}
