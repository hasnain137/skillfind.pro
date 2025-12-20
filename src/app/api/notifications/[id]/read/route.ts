// src/app/api/notifications/[id]/read/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { NotFoundError, ForbiddenError } from '@/lib/errors';

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/notifications/[id]/read - Mark notification as read
export async function POST(request: NextRequest, context: RouteParams) {
    try {
        const { userId } = await requireAuth();
        const { id } = await context.params;

        // Convert Clerk ID to database user ID
        const dbUser = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        if (!dbUser) {
            throw new ForbiddenError('User not found');
        }

        // Find notification and verify ownership
        const notification = await prisma.notification.findUnique({
            where: { id },
        });

        if (!notification) {
            throw new NotFoundError('Notification');
        }

        if (notification.userId !== dbUser.id) {
            throw new ForbiddenError('You can only read your own notifications');
        }

        // Mark as read
        const updated = await prisma.notification.update({
            where: { id },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });

        return successResponse({ notification: updated });
    } catch (error) {
        return handleApiError(error);
    }
}
