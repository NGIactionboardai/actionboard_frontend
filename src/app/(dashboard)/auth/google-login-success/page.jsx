'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { googleLoginSuccess } from '@/redux/auth/authSlices';
import { makeApiCall } from '@/app/utils/api';

const GoogleLoginSuccessPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const handleGoogleLogin = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');

      const redirect_uri = 'https://actionboard-ai.vercel.app/auth/google-login-success/';
      // const redirect_uri = 'http://localhost:3000/auth/google-login-success/';


      if (!code) {
        router.push('/auth/login?error=missing-code');
        return;
      }

      try {
        const response = await makeApiCall(
          'https://actionboard-ai-backend.onrender.com/api/auth/dj-rest-auth/google/',
          // 'http://localhost:8000/api/auth/dj-rest-auth/google/',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code,
              redirect_uri,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Login failed:', errorData);
          router.push('/auth/login?error=google');
          return;
        }

        const data = await response.json();
        console.log('Response JSON:', data);
        const { access, refresh, user } = data;

        if (!access || !refresh || !user) {
          throw new Error('Incomplete login response');
        }

        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        localStorage.setItem('user', JSON.stringify(user));

        dispatch(
          googleLoginSuccess({
            token: access,
            refreshToken: refresh,
            user,
          })
        );

        if (!user.country || !user.date_of_birth) {
          router.push('/auth/complete-profile');
          return;
        }

        router.push('/organizations');
      } catch (err) {
        console.error('Login error:', err);
        router.push('/auth/login?error=google');
      }
    };

    handleGoogleLogin();
  }, [dispatch, router]);

  return <div className="text-center py-10">Logging you in with Google...</div>;
};

export default GoogleLoginSuccessPage;
