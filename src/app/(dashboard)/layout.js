"use client";

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ProtectedRoute from '../components/ProtectedRoute';
import NewNavbar from '../components/layout/NewNavbar';
import ViewerGuard from '../components/ViewerGuard';
import UpcomingMeetingNotification from '../components/notifications/UpcomingMeetingNotification';
import { selectCurrentOrganization, selectCurrentUserRole, getOrganizationDetails } from '@/redux/auth/organizationSlice';
import { fetchSubscription } from '@/redux/billing/billingSlice';

export default function DashboardLayout({ children }) {
  const dispatch = useDispatch();
  const currentOrg = useSelector(selectCurrentOrganization);
  const role = useSelector(selectCurrentUserRole);

  useEffect(() => {
    const orgId = currentOrg?.org_id || currentOrg?.id;
    console.log('[RBAC] DashboardLayout: currentOrg changed', { orgId, currentOrg });
    if (orgId) {
      dispatch(getOrganizationDetails(orgId));
    } else {
      console.warn('[RBAC] DashboardLayout: currentOrg is null — getOrganizationDetails will NOT be called');
    }
  }, [currentOrg?.org_id, currentOrg?.id, dispatch]);

  useEffect(() => {
    console.log('[RBAC] DashboardLayout: resolved role =', role);
  }, [role]);

  // Billing/subscription state must reflect the org actually being viewed, not
  // whichever value happened to be fetched at login. Only owners and admins can
  // act on a lapsed subscription (see billing:view in organisations/permissions.py),
  // so only they need this refetched per-org; members/viewers are never gated on it.
  useEffect(() => {
    const orgId = currentOrg?.org_id || currentOrg?.id;
    if (orgId && (role === 'owner' || role === 'admin')) {
      dispatch(fetchSubscription(orgId));
    }
  }, [currentOrg?.org_id, currentOrg?.id, role, dispatch]);

  return (
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
  );
}
