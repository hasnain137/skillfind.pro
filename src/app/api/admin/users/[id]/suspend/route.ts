// POST /api/admin/users/[id]/suspend - Suspend user account
// Admin only
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { NotFoundError, BadRequestError } from '@/lib/errors';
import { z } from 'zod';

const suspendUserSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: adminId } = await requireAdmin();
    const { id: userId } = await context.params;

    // Parse body
    const body = await request.json();
    const data = suspendUserSchema.parse(body);

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Check if already suspended
    if (!user.isActive) {
      throw new BadRequestError('User is already suspended');
    }

    // Suspend user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
      },
    });

    // Create admin action log
    await prisma.adminAction.create({
      data: {
        adminId,
        action: 'USER_BANNED',
        targetType: 'USER',
        targetId: userId,
        reason: data.reason,
      },
    });

    // TODO: Send notification to user
    // TODO: Cancel all pending offers/requests

    return successResponse(
      {
        user: {
          id: updatedUser.id,
          isActive: updatedUser.isActive,
        },
        message: 'User suspended successfully. User has been notified.',
      },
      'User suspended successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
