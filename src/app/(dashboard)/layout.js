"use client";

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ProtectedRoute from '../components/ProtectedRoute';
import NewNavbar from '../components/layout/NewNavbar';
import ViewerGuard from '../components/ViewerGuard';
import { selectCurrentOrganization, getOrganizationDetails } from '@/redux/auth/organizationSlice';

export default function DashboardLayout({ children }) {
  const dispatch = useDispatch();
  const currentOrg = useSelector(selectCurrentOrganization);

  useEffect(() => {
    const orgId = currentOrg?.org_id || currentOrg?.id;
    if (orgId) {
      dispatch(getOrganizationDetails(orgId));
    }
  }, [currentOrg?.org_id, currentOrg?.id, dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navbar /> */}
      <NewNavbar />
      <ProtectedRoute>
        <ViewerGuard>
          <main className="mt-20 p-0">{children}</main>
        </ViewerGuard>
      </ProtectedRoute>
    </div>
  );
}
