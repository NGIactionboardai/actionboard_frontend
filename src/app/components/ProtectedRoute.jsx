"use client";

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
  '/zoom-connection-doc',
  '/pricing'
];

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const billing = useSelector((state) => state.billing);

  // Check if current path is public (no auth required)
  const isPublic = PUBLIC_PATHS.some((path) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname === path || pathname.startsWith(path + "/");
  });

  console.log("🛡 ProtectedRoute RENDERED");
  console.log("AUTH:", isAuthenticated);
  console.log("BILLING STATUS:", billing.status);
  console.log("SUB:", billing.subscription);

  


  useEffect(() => {
    // 1. Auth check
    if (!isAuthenticated && !isPublic) {
      router.push('/auth/login');
      return;
    }
  
    if (isAuthenticated && !isPublic) {

      if (pathname.startsWith('/pricing')) {
        return;
      }
      // WAIT for billing
      if (billing.status === "idle" || billing.status === "loading") {
        return;
      }
  
      // API failed → block
      if (billing.status === "failed") {
        router.push('/pricing');
        return;
      }
  
      const sub = billing.subscription;
  
      // No subscription → block
      if (!sub || !sub.has_subscription) {
        router.push('/pricing');
        return;
      }
  
      // Not active → block
      if (!["active", "trialing"].includes(sub.status)) {
        router.push('/pricing');
      }
    }
  }, [isAuthenticated, isPublic, billing.status, billing.subscription]);

  // Show loading while checking auth on protected routes
  if (
    (!isAuthenticated && !isPublic) ||
    (isAuthenticated && !isPublic && billing.status === "loading")
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Preparing your workspace...</p>
        </div>
      </div>
    );
  }

  return children;
}
