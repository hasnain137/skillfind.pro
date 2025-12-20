// src/app/api/notifications/read-all/route.ts
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';

// POST /api/notifications/read-all - Mark all notifications as read
export async function POST() {
    try {
        const { userId } = await requireAuth();

        // Convert Clerk ID to database user ID
        const dbUser = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        if (!dbUser) {
            return successResponse({
                markedCount: 0,
                message: 'User not found'
            });
        }

        // Mark all unread notifications as read
        const result = await prisma.notification.updateMany({
            where: {
                userId: dbUser.id,
                isRead: false,
            },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });

        return successResponse({
            markedCount: result.count,
            message: `Marked ${result.count} notifications as read`,
        });
    } catch (error) {
        return handleApiError(error);
    }
}
