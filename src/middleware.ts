// Clerk authentication middleware
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Force Node.js runtime instead of Edge

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/signup(.*)',
  '/auth-redirect(.*)', // Smart redirect handler and onboarding orchestrator
  '/debug-auth(.*)', // Temporary debug page
  '/forgot-password(.*)',
  '/api/categories(.*)',
  '/api/reviews(.*)', // Public reviews
  '/api/test(.*)',
  '/api/professionals/search(.*)',
  '/api/professionals/[id]$', // Public professional profile (exact match)
  '/api/professionals/[id]/rating(.*)',
  '/api/professionals/[id]/reviews(.*)',
  '/api/webhooks(.*)', // Stripe webhooks
  '/api/auth/complete-signup(.*)', // Initial signup completion
  '/api/auth/save-role(.*)', // Save user role during onboarding
  '/api/auth/check-profile', // Exact match
  '/api/auth/check-profile(.*)', // Wildcard match
  '/search(.*)', // Public search page
  '/professionals(.*)', // Public professional profiles
]);

// Define routes that require specific roles
const isClientRoute = createRouteMatcher([
  '/client(.*)',
  '/api/client(.*)',
]);

const isProRoute = createRouteMatcher([
  '/pro(.*)',
  '/api/professionals/profile(.*)',
  '/api/professionals/services(.*)',
  '/api/professionals/documents(.*)',
  '/api/professionals/matching-requests(.*)',
  '/api/professionals/clicks(.*)',
]);

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Require authentication for all other routes (including API)
  if (!userId) {
    // For API routes, return 401 instead of redirecting
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required. Please sign in.'
        },
        { status: 401 }
      );
    }

    // For web routes, redirect to login
    const signInUrl = new URL('/login', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Get user role from session claims
  // Clerk stores it in sessionClaims.metadata (not publicMetadata)
  const metadata = sessionClaims?.metadata as { role?: string } | undefined;
  const publicMetadata = sessionClaims?.publicMetadata as { role?: string } | undefined;
  const userRole = metadata?.role || publicMetadata?.role;

  // If user is authenticated but has no role, redirect to auth-redirect for onboarding
  // This handles edge cases where user exists in Clerk but hasn't completed onboarding
  if (!userRole && !isPublicRoute(req)) {
    // For API routes, return 403 with helpful message
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Incomplete Profile',
          message: 'Please complete your profile setup to access this resource.',
          redirectTo: '/auth-redirect'
        },
        { status: 403 }
      );
    }
    // For web routes, redirect to complete onboarding
    return NextResponse.redirect(new URL('/auth-redirect', req.url));
  }

  // Check role-based access
  if (isClientRoute(req) && userRole !== 'CLIENT') {
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'Access denied. Client role required.'
        },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (isProRoute(req) && userRole !== 'PROFESSIONAL') {
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'Access denied. Professional role required.'
        },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (isAdminRoute(req) && userRole !== 'ADMIN') {
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'Access denied. Admin role required.'
        },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}, {
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
  clockSkewInMs: 30000, // Allow 30 seconds skew for local dev
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
