"use client";

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AuthHydrator from '../components/AuthHydrator';
import ProtectedRoute from '../components/ProtectedRoute';
import NewNavbar from '../components/layout/NewNavbar';
import ViewerGuard from '../components/ViewerGuard';
import UpcomingMeetingNotification from '../components/notifications/UpcomingMeetingNotification';
import { selectCurrentOrganizationId } from '@/redux/auth/orgSelectionSlice';
import { useOrgRole } from '@/app/hooks/useOrgRole';
import { fetchSubscription } from '@/redux/billing/billingSlice';

export default function DashboardLayout({ children }) {
  const dispatch = useDispatch();
  const orgId = useSelector(selectCurrentOrganizationId);
  // Calling the query hook here (in addition to wherever else needs org details)
  // is intentional — RTK Query dedupes identical in-flight/cached queries by arg,
  // so this just "warms" the cache for every other consumer of this org's details.
  const { role } = useOrgRole();

  const billingOrgId = useSelector((state) => state.billing.orgId);
  const billingStatus = useSelector((state) => state.billing.status);

  // Billing/subscription state must reflect the org actually being viewed, not
  // whichever value happened to be fetched last (login fetches the user-level
  // subscription; checkout/pricing pages refetch it too). Only owners and admins
  // can see an org's billing (see billing:view in organisations/permissions.py),
  // so only they get it refetched per-org; members/viewers are never gated on it.
  // Re-runs whenever the loaded data belongs to a different context, which also
  // corrects an older, user-level response that landed after the org one.
  // Waits for AuthHydrator's first fetch (status leaves 'idle'), which only
  // happens after an expired access token has been refreshed — fetching before
  // that would 401.
  useEffect(() => {
    if (billingStatus === 'idle' || billingStatus === 'loading') return;
    if (orgId && (role === 'owner' || role === 'admin')) {
      if (billingOrgId !== orgId) dispatch(fetchSubscription(orgId));
    } else if (!orgId && billingOrgId !== null) {
      dispatch(fetchSubscription());
    }
  }, [orgId, role, billingOrgId, billingStatus, dispatch]);

  return (
    <AuthHydrator>
      <div className="min-h-screen bg-gray-50">
        {/* <Navbar /> */}
        <NewNavbar />
        <ProtectedRoute>
          <ViewerGuard>
            <main className="mt-20 p-0">{children}</main>
          </ViewerGuard>
        </ProtectedRoute>
        <UpcomingMeetingNotification />
      </div>
    </AuthHydrator>
  );
}
