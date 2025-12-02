'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * This page acts as a smart redirect handler after authentication.
 * It checks the user's role and redirects them to the appropriate dashboard.
 */
export default function AuthRedirectPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    async function handleRedirect() {
      if (!isLoaded) return;

      if (!user) {
        // No user, redirect to login
        window.location.href = '/login';
        return;
      }

      const role = user.publicMetadata?.role as string | undefined;

      if (!role) {
        // User has no role, this shouldn't happen but redirect to homepage
        window.location.href = '/';
        return;
      }

      // PROFESSIONAL users need to check if they have a professional profile
      if (role === 'PROFESSIONAL') {
        try {
          // Check if professional profile exists
          const response = await fetch('/api/professionals/profile');
          
          if (response.ok) {
            // Profile exists, go to dashboard
            window.location.href = '/pro';
          } else if (response.status === 404) {
            // Profile doesn't exist, need to complete it
            window.location.href = '/complete-profile';
          } else {
            // Some other error, go to complete-profile to be safe
            window.location.href = '/complete-profile';
          }
        } catch (error) {
          // Network error or other issue, go to complete-profile
          window.location.href = '/complete-profile';
        }
        return;
      }

      // CLIENT and ADMIN users go directly to their dashboards
      if (role === 'CLIENT') {
        window.location.href = '/client';
      } else if (role === 'ADMIN') {
        window.location.href = '/admin';
      } else {
        // Unknown role, go to homepage
        window.location.href = '/';
      }
    }

    handleRedirect();
  }, [user, isLoaded, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#2563EB] border-t-transparent mx-auto"></div>
        <p className="text-sm text-[#7C7373]">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
