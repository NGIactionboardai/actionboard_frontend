'use client';
import { useParams } from 'next/navigation';
// import OrgCalendar from '@/components/orgcalendar/OrgCalendar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import OrgCalendar from '@/app/components/orgcalendar/OrgCalendar';
import { getAuthHeaders, makeApiCall } from '@/app/utils/api';
import { selectIsAuthenticated } from '@/redux/auth/authSlices';
import axios from 'axios';

export default function OrgCalendarPage() {
  const { id: orgId } = useParams();
  const [orgName, setOrgName] = useState('');
  const [orgColor, setOrgColor] = useState('#6b7280');
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


  useEffect(() => {
    if (!isAuthenticated) router.push('/auth/login');
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/organisations/${orgId}/`);
        const data = res.data; // Axios already parses JSON
        console.log('org data:', data);
  
        setOrgName(data.name);
        setOrgColor(generateColorFromName(data.name)); // or use saved map
      } catch (err) {
        console.error('Error fetching organization:', err);
        setOrgName('Unknown');
      }
    };
  
    fetchOrg();
  }, [orgId]);

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
