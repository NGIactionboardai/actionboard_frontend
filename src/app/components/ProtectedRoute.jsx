"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/redux/auth/authSlices';
import { selectCurrentOrganization, selectCurrentUserRole } from '@/redux/auth/organizationSlice';


const PUBLIC_PATHS = [
    '/',
  '/auth/login',
  '/auth/register',
  '/auth/otp-verification',
  '/auth/forgot-password',
  '/auth/google-login-success',
  '/terms',
  '/privacy-policy',
  '/help',
  '/feedback-form',
  '/zoom-connection-doc',
  '/pricing',
  '/invitations',
];

// Authenticated routes that must stay reachable no matter what an org's
// billing state is — most importantly the org switcher, so a user is never
// stranded on a single org's billing screen with no way out.
const BILLING_EXEMPT_PATHS = ['/organizations'];

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const billing = useSelector((state) => state.billing);
  const currentOrg = useSelector(selectCurrentOrganization);
  const role = useSelector(selectCurrentUserRole);

  // Check if current path is public (no auth required)
  const isPublic = PUBLIC_PATHS.some((path) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname === path || pathname.startsWith(path + "/");
  });

  const isBillingExempt = BILLING_EXEMPT_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  useEffect(() => {
    // 1. Auth check
    if (!isAuthenticated && !isPublic) {
      router.replace('/auth/login');
      return;
    }

    if (isAuthenticated && !isPublic) {

      if (pathname.startsWith('/pricing') || isBillingExempt) {
        return;
      }

      // No org selected yet: this is account-level onboarding (the user hasn't
      // created/joined an org), gated by the user's own subscription.
      if (!currentOrg) {
        if (billing.status === "idle" || billing.status === "loading") return;
        if (billing.status === "failed") {
          router.replace('/pricing');
          return;
        }
        const sub = billing.subscription;
        if (!sub || !sub.has_subscription) {
          router.replace('/pricing');
        }
        return;
      }

      // Inside an org: only owners/admins can act on that org's billing
      // (see billing:view in organisations/permissions.py), so only they are
      // ever redirected to the billing screen. Members/viewers are never
      // blocked account-wide by another org's subscription state — a
      // restricted org should only affect access to that org's resources,
      // which is enforced separately, per-resource, by the backend.
      if (role !== 'owner' && role !== 'admin') {
        return;
      }

      // WAIT for the org-scoped subscription fetch to resolve.
      if (billing.status === "idle" || billing.status === "loading") {
        return;
      }

      if (billing.status === "failed") {
        router.replace('/billing/upgrade');
        return;
      }

      const sub = billing.subscription;

      if (!sub || !sub.has_subscription) {
        router.replace('/billing/upgrade');
        return;
      }

      if (sub.is_expired) {
        router.replace('/billing/upgrade');
        return;
      }

      if (!["active", "trialing"].includes(sub.status)) {
        router.replace('/billing/upgrade');
        return;
      }
    }
  }, [isAuthenticated, isPublic, isBillingExempt, billing.status, billing.subscription, pathname, currentOrg, role]);

  // Show loading while checking auth on protected routes
  if (
    (!isAuthenticated && !isPublic) ||
    (isAuthenticated && !isPublic && !isBillingExempt && billing.status === "loading")
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
