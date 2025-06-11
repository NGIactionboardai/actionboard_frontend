'use client';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { selectIsAuthenticated } from '../../redux/auth/authSlices'; // Adjust path as needed
import ManageOrganizations from '../components/organizations/ManageOrganizations';

const OrganizationsPage = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/auth/login'); // or router.push('/') for home page
    }
  }, [isAuthenticated, router]);

  // Show loading or redirect message while checking auth
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Only render if authenticated
  return <ManageOrganizations />;
};

export default OrganizationsPage;