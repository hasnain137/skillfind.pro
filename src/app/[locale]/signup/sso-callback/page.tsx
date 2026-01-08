// src/app/signup/sso-callback/page.tsx
'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

export default function SSOCallback() {
  // Handle the redirect flow by rendering the AuthenticateWithRedirectCallback component
  return <AuthenticateWithRedirectCallback />;
}
