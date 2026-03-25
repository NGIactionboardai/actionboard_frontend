'use client';

import LandingPage from '@/app/components/landing/LandingPage';

// Main component that conditionally renders based on authentication
export default function ConditionalPage() {

  // If not authenticated, show landing page
  return <LandingPage />;
}