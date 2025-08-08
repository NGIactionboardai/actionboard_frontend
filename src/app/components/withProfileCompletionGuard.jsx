'use client';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function withProfileCompletionGuard(Component) {
  return function GuardedPage(props) {
    const router = useRouter();
    const user = useSelector((state) => state.auth.user);

    useEffect(() => {
      if (user && (!user.country || !user.date_of_birth)) {
        router.replace('/auth/complete-profile');
      }
    }, [user, router]);

    return <Component {...props} />;
  };
}
