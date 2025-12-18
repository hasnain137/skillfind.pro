// src/app/api/notifications/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
    try {
        const { userId } = await requireAuth();

        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');
        const unreadOnly = searchParams.get('unreadOnly') === 'true';

        // Get notifications for this user
        const where = {
            userId,
            ...(unreadOnly ? { isRead: false } : {}),
        };

        const [notifications, totalCount, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            prisma.notification.count({ where: { userId } }),
            prisma.notification.count({ where: { userId, isRead: false } }),
        ]);

        return successResponse({
            notifications,
            totalCount,
            unreadCount,
            hasMore: offset + notifications.length < totalCount,
        });
    } catch (error) {
        return handleApiError(error);
    }
}
