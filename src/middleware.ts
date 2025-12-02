// Clerk authentication middleware
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/signup(.*)',
  '/complete-profile(.*)', // Profile completion after signup
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
]);

// Define routes that require specific roles
const isClientRoute = createRouteMatcher([
  '/client(.*)',
  '/api/client(.*)',
]);

const isProRoute = createRouteMatcher([
  '/pro(.*)',
  '/api/pro(.*)',
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

  // Get user role from session claims (you'll need to set this in Clerk)
  const metadata = sessionClaims?.metadata as { role?: string } | undefined;
  const userRole = metadata?.role;

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
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
