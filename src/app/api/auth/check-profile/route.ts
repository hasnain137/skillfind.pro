// GET /api/auth/check-profile
// Check if user has completed profile setup (doesn't require database user to exist)
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError } from '@/lib/api-response';
import { UnauthorizedError } from '@/lib/errors';

import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get Clerk auth first
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError('Not signed in');
    }

    // Get full Clerk user data
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    if (!clerkUser) {
      throw new UnauthorizedError('User not found in Clerk');
    }

    // Check if user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      include: {
        clientProfile: true,
        professionalProfile: true,
      },
    });

    if (!dbUser) {
      // User doesn't exist in database yet
      return successResponse({
        exists: false,
        hasProfile: false,
        role: clerkUser.publicMetadata?.role as string | undefined,
      });
    }

    // Check if they have the required role-specific profile
    const hasClientProfile = dbUser.role === 'CLIENT' && !!dbUser.clientProfile;
    const hasProfessionalProfile = dbUser.role === 'PROFESSIONAL' && !!dbUser.professionalProfile;
    const isAdmin = dbUser.role === 'ADMIN';

    return successResponse({
      exists: true,
      hasProfile: hasClientProfile || hasProfessionalProfile || isAdmin,
      role: dbUser.role,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        role: dbUser.role,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
