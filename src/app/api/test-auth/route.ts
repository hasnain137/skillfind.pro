// TEST ENDPOINT - Remove in production
// This endpoint helps you get auth tokens for testing
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Try importing Clerk dynamically to see if it's configured
    const { auth, currentUser } = await import('@clerk/nextjs/server');
    
    const { userId: clerkId, sessionId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({
        authenticated: false,
        message: 'Not authenticated. Please sign in first.',
        hint: 'Sign in through your app first, then visit this endpoint',
      }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      clerkId,
      sessionId,
      message: 'Clerk authentication is working!',
      instructions: [
        '1. Open DevTools → Application → Cookies',
        '2. Find __session cookie value',
        '3. Use it as: Authorization: Bearer <token>',
      ],
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Clerk authentication error',
      message: error instanceof Error ? error.message : 'Unknown error',
      hint: 'Make sure NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY are set in .env',
      clerkConfigured: process.env.CLERK_SECRET_KEY ? 'Yes' : 'No',
    }, { status: 500 });
  }
}
