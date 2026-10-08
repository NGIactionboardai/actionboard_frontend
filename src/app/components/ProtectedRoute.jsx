"use client";

import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/redux/auth/authSlices';
import { selectCurrentOrganizationId } from '@/redux/auth/orgSelectionSlice';
import { useOrgRole } from '@/app/hooks/useOrgRole';


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
  const currentOrg = useSelector(selectCurrentOrganizationId);
  const { role } = useOrgRole();
  const [adminNoticeDismissed, setAdminNoticeDismissed] = useState(false);

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
        // Same rule as below: only a successful, user-level answer counts. A
        // failed request (network, expired token) is not "no subscription".
        if (billing.status !== "success" || billing.orgId !== null) return;
        const sub = billing.subscription;
        if (!sub || !sub.has_subscription) {
          router.replace('/pricing');
        }
        return;
      }

      // Inside an org, billing is the owner's responsibility: only the owner can
      // renew or upgrade (billing:manage), so only the owner is ever redirected
      // to the billing screen. Admins can't act on it and get a notice instead
      // (rendered below); members/viewers are never gated here — a restricted
      // org only affects that org's resources, enforced per-resource by the
      // backend.
      if (role !== 'owner') {
        return;
      }

      // Only judge a subscription fetched for *this* org. Anything else — the
      // user-level one from login, the previously viewed org's after a switch,
      // a fetch still in flight — must not trigger a redirect.
      if (billing.status !== "success" || billing.orgId !== currentOrg) {
        return;
      }

      if (isSubscriptionInactive(billing.subscription)) {
        router.replace('/billing/upgrade');
      }
    }
  }, [isAuthenticated, isPublic, isBillingExempt, billing.status, billing.subscription, billing.orgId, pathname, currentOrg, role]);

  // Show loading while checking auth on protected routes. Hold the page only while the first subscription for the current context
  // loads; a background refetch of the same org keeps the page mounted.
  const awaitingBilling =
    billing.status === "loading" && billing.orgId !== (currentOrg || null);

  if (
    (!isAuthenticated && !isPublic) ||
    (isAuthenticated && !isPublic && !isBillingExempt && awaitingBilling)
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

  const showAdminNotice =
    isAuthenticated &&
    !isPublic &&
    role === 'admin' &&
    !adminNoticeDismissed &&
    billing.status === "success" &&
    billing.orgId === currentOrg &&
    isSubscriptionInactive(billing.subscription);

  return (
    <>
      {children}
      {showAdminNotice && (
        <div className="fixed bottom-4 inset-x-4 sm:left-auto sm:right-4 sm:max-w-md z-40 rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-medium text-amber-900">This organisation&apos;s subscription is inactive</p>
              <p className="text-amber-800 mt-1">
                Some features may be unavailable. Ask the organisation owner to renew the plan.
              </p>
            </div>
            <button
              onClick={() => setAdminNoticeDismissed(true)}
              className="text-amber-700 hover:text-amber-900 cursor-pointer"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function isSubscriptionInactive(sub) {
  return (
    !sub ||
    !sub.has_subscription ||
    sub.is_expired ||
    !["active", "trialing"].includes(sub.status)
  );
}
