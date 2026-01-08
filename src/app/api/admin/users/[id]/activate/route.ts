// POST /api/admin/users/[id]/activate - Reactivate suspended user
// Admin only
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { NotFoundError, BadRequestError } from '@/lib/errors';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: adminId } = await requireAdmin();
    const { id: userId } = await context.params;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Check if already active
    if (user.isActive) {
      throw new BadRequestError('User is already active');
    }

    // Activate user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: true,
      },
    });

    // Create admin action log
    await prisma.adminAction.create({
      data: {
        adminId,
        action: 'USER_UNBANNED',
        targetType: 'USER',
        targetId: userId,
        reason: 'User reactivated by admin',
      },
    });

    // Send notification to user
    await import('@/lib/services/mail').then(mod =>
      mod.sendNotificationEmail(
        user.email,
        'Account Reactivated - SkillFind.pro',
        `Hello ${user.firstName}, \n\nYour account has been reactivated by our administration team. You can now access all platform features again.\n\nWelcome back!`,
        '/login'
      )
    ).catch(err => console.error('Failed to send activation email:', err));

    return successResponse(
      {
        user: {
          id: updatedUser.id,
          isActive: updatedUser.isActive,
        },
        message: 'User activated successfully. User has been notified.',
      },
      'User activated successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
