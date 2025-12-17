import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

const isPublicRoute = createRouteMatcher([
  '/',
  '/:locale',
  '/:locale/login(.*)',
  '/:locale/signup(.*)',
  '/:locale/search(.*)',
  '/:locale/professionals/(.*)',
  '/:locale/generated/(.*)',
  '/api/webhooks(.*)',
  '/api/test(.*)',
  '/api/auth/complete-signup',
]);

const isClientRoute = createRouteMatcher(['/:locale/client(.*)']);
const isProRoute = createRouteMatcher(['/:locale/pro(.*)']);
const isAdminRoute = createRouteMatcher(['/:locale/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const isApiRoute = req.nextUrl.pathname.startsWith('/api');

  // Skip auth logic for public routes, but still run intl for them
  if (isPublicRoute(req)) {
    if (!isApiRoute) {
      return intlMiddleware(req);
    }
    return NextResponse.next();
  }

  // Protect private routes
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    if (isApiRoute) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return (await auth()).redirectToSignIn({ returnBackUrl: req.url });
  }

  // Role-based Access Control
  const metadata = sessionClaims?.metadata as { role?: string } | undefined;
  const publicMetadata = sessionClaims?.publicMetadata as { role?: string } | undefined;
  const userRole = metadata?.role || publicMetadata?.role;

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
