'use client';

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';

import OtpVerification from '@/app/components/auth/OtpVerification';

export default function OtpVerificationPage() {
  return (
    <Suspense fallback={<div>Loading verification page...</div>}>
      <OtpVerification />
    </Suspense>
  );
}