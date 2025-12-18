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

        // Find notification and verify ownership
        const notification = await prisma.notification.findUnique({
            where: { id },
        });

        if (!notification) {
            throw new NotFoundError('Notification');
        }

        if (notification.userId !== userId) {
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
