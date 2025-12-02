// API endpoint to save user role to Clerk metadata after role selection
import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { successResponse, handleApiError } from '@/lib/api-response';
import { UnauthorizedError, ValidationError } from '@/lib/errors';
import { z } from 'zod';

const saveRoleSchema = z.object({
  role: z.enum(['CLIENT', 'PROFESSIONAL']),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError('You must be signed in');
    }

    const body = await request.json();
    const data = saveRoleSchema.parse(body);

    // Get Clerk client
    const client = await clerkClient();

    try {
      // Update user's public metadata with role
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          role: data.role,
        },
      });

      console.log(`✅ Role ${data.role} saved for user ${userId}`);

      return successResponse(
        {
          role: data.role,
          message: 'Role saved. Please wait while we update your session...'
        },
        'Role saved successfully'
      );
    } catch (clerkError: any) {
      console.error('Clerk API error while saving role:', clerkError);
      throw new Error(`Failed to update user metadata: ${clerkError.message || 'Unknown error'}`);
    }
  } catch (error: any) {
    console.error('Error in save-role endpoint:', error);

    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid role. Must be either CLIENT or PROFESSIONAL.', error.errors);
    }

    if (error instanceof UnauthorizedError || error instanceof ValidationError) {
      return handleApiError(error);
    }

    return handleApiError(
      new Error('Failed to save role. Please try again or contact support if the problem persists.')
    );
  }
}
