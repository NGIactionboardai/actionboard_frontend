'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { googleLoginSuccess } from '@/redux/auth/authSlices';

const GoogleLoginSuccessPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');

    const redirect_uri = 'https://actionboard-ai.vercel.app/auth/google-login-success/'

    // const redirect_uri = 'http://localhost:3000/auth/google-login-success/'
    // const redirect_uri = 'http://localhost:3000/'

    if (code) {
      axios
        .post('https://actionboard-ai-backend.onrender.com/api/auth/dj-rest-auth/google/', {
          code,
          redirect_uri: redirect_uri,
        })
        .then((res) => {
          const { access, refresh, user } = res.data;

          localStorage.setItem('accessToken', access);
          localStorage.setItem('refreshToken', refresh);
          localStorage.setItem('user', JSON.stringify(user));

          axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

          dispatch(
            googleLoginSuccess({
              token: access,
              refreshToken: refresh,
              user,
            })
          );

          router.push('/organization');
        })
        .catch((err) => {
          console.error('Login error:', err.response?.data || err.message);
          router.push('/login?error=google');
        });
    } else {
      router.push('/login?error=missing-code');
    }
  }, [dispatch, router]);

  return <div className="text-center py-10">Logging you in with Google...</div>;
};

export default GoogleLoginSuccessPage;
