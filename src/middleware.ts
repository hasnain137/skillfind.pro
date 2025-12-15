
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs'; // Force Node.js runtime to allow Prisma usage

// Define public routes
const isPublicRoute = createRouteMatcher([
  '/:locale/login(.*)',
  '/:locale/signup(.*)',
  '/:locale/auth-redirect(.*)',
  '/:locale/debug-auth(.*)',
  '/:locale/forgot-password(.*)',
  '/:locale/search(.*)',
  '/:locale/professionals(.*)',
  '/:locale',
  '/',
  '/login(.*)',
  '/signup(.*)',
  '/auth-redirect(.*)',
  '/debug-auth(.*)',
  '/forgot-password(.*)',
  '/api/categories(.*)',
  '/api/reviews(.*)',
  '/api/test(.*)',
  '/api/professionals/search(.*)',
  '/api/professionals/[id]$',
  '/api/professionals/[id]/rating(.*)',
  '/api/professionals/[id]/reviews(.*)',
  '/api/webhooks(.*)',
  '/api/auth/complete-signup(.*)',
  '/api/auth/save-role(.*)',
  '/api/auth/check-profile',
  '/api/auth/check-profile(.*)',
  '/search(.*)',
  '/professionals(.*)',
]);

const isClientRoute = createRouteMatcher([
  '/:locale/client(.*)',
  '/client(.*)',
  '/api/client(.*)',
]);

const isProRoute = createRouteMatcher([
  '/:locale/pro(.*)',
  '/pro(.*)',
  '/api/professionals/profile(.*)',
  '/api/professionals/services(.*)',
  '/api/professionals/documents(.*)',
  '/api/professionals/matching-requests(.*)',
  '/api/professionals/clicks(.*)',
]);

const isAdminRoute = createRouteMatcher([
  '/:locale/admin(.*)',
  '/admin(.*)',
  '/api/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // 1. Fetch dynamic settings (Auto-Detect Logic)
  let localeDetection = true;
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'translation_auto_detect_enabled' }
    });
    if (setting?.value === 'false') localeDetection = false;
  } catch (e) {
    console.error('[Middleware] Failed to fetch settings:', e);
  }

  // 2. Create the intl middleware instance with dynamic config
  const intlMiddleware = createMiddleware({
    ...routing,
    localeDetection
  });

  // 3. Run next-intl middleware for non-API routes
  const isApiRoute = req.nextUrl.pathname.startsWith('/api') || req.nextUrl.pathname.includes('/api/');

  if (!isApiRoute) {
    const intlResponse = intlMiddleware(req);
    if (intlResponse) {
      return intlResponse;
    }
  }

  // 4. Auth Protection
  if (isPublicRoute(req)) {
    if (!isApiRoute) {
      return intlMiddleware(req);
    }
    return NextResponse.next();
  }

  if (!userId) {
    if (isApiRoute) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', message: 'Authentication required.' },
        { status: 401 }
      );
    }
    const signInUrl = new URL('/login', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  let publicMetadata = sessionClaims?.publicMetadata as { role?: string } | undefined;
  let userRole = publicMetadata?.role;

  // Fallback: If role is missing in Token (Clerk config issue), fetch from DB
  if (userId && !userRole) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { role: true }
      });
      if (dbUser?.role) {
        userRole = dbUser.role;
        console.log(`[Middleware] Fetched role from DB: ${userRole}`);
      }
    } catch (e) {
      console.error('[Middleware] Failed to fetch role from DB:', e);
    }
  }

  if (!userRole) {
    if (isApiRoute) {
      return NextResponse.json({ success: false, error: 'Incomplete Profile' }, { status: 403 });
    }
    return NextResponse.redirect(new URL('/auth-redirect', req.url));
  }

  // Role Access Control (with Admin Superuser Bypass)
  if (isClientRoute(req) && userRole !== 'CLIENT' && userRole !== 'ADMIN') {
    if (isApiRoute) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (isProRoute(req) && userRole !== 'PROFESSIONAL' && userRole !== 'ADMIN') {
    if (isApiRoute) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (isAdminRoute(req) && userRole !== 'ADMIN') {
    if (isApiRoute) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (!isApiRoute) {
    return intlMiddleware(req);
  }

  return NextResponse.next();
}, {
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
  clockSkewInMs: 30000,
});

export const config = {
  matcher: [
    '/',
    '/(fr|en)/:path*',
    '/(api|trpc)(.*)',
    '/((?!_next|.*\\..*).*)'
  ],
};
