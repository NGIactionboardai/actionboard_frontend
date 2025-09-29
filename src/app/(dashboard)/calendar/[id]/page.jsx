'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import OrgCalendar from '@/app/components/orgcalendar/OrgCalendar';
import { selectIsAuthenticated } from '@/redux/auth/authSlices';
import axios from 'axios';
import Link from 'next/link';

export default function OrgCalendarPage() {
  const { id: orgId } = useParams();
  const [orgName, setOrgName] = useState('');
  const [orgColor, setOrgColor] = useState('#6b7280');
  const [orgError, setOrgError] = useState(null); // NEW state
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    if (!isAuthenticated) router.push('/auth/login');
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/organisations/${orgId}/`);
        const data = res.data;
        setOrgName(data.name);
        setOrgColor(generateColorFromName(data.name));
        setOrgError(null);
      } catch (err) {
        console.error('Error fetching organization:', err);
        setOrgError('Organization not found or invalid.');
      }
    };

    if (orgId) {
      fetchOrg();
    }
  }, [orgId, API_BASE_URL]);

  // --- Error / invalid org handling ---
  if (!orgId || orgError) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">
            {orgError ? 'Organization Not Found' : 'Invalid Organization'}
          </h2>
          <p className="mt-2 text-gray-600">
            {orgError || 'Organization ID is required to view this calendar.'}
          </p>
          <div className="mt-6">
            <Link
              href="/calendar"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go to My Calendar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return isAuthenticated && orgName ? (
    <OrgCalendar orgId={orgId} />
  ) : (
    <div className="p-10 text-center">Loading organization calendar...</div>
  );
}

// Simple hash for color code
function generateColorFromName(name) {
  const colors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash += name.charCodeAt(i);
  }
  return colors[hash % colors.length];
}
