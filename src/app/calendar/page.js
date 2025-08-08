'use client';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { selectIsAuthenticated } from '../../redux/auth/authSlices';
import Calendar from '../components/Calendar';
import withProfileCompletionGuard from '../components/withProfileCompletionGuard';

function CalendarPage() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login'); 
    }
  }, [isAuthenticated, router]);

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

  return (
    <main className="p-0">
      <Calendar />
    </main>
  );
}

export default withProfileCompletionGuard(CalendarPage)