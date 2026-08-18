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

  // Billing/subscription state must reflect the org actually being viewed, not
  // whichever value happened to be fetched at login. Only owners and admins can
  // act on a lapsed subscription (see billing:view in organisations/permissions.py),
  // so only they need this refetched per-org; members/viewers are never gated on it.
  useEffect(() => {
    if (orgId && (role === 'owner' || role === 'admin')) {
      dispatch(fetchSubscription(orgId));
    }
  }, [orgId, role, dispatch]);

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
