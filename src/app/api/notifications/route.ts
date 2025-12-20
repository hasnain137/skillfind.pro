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

        // Convert Clerk ID to database user ID
        const dbUser = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        if (!dbUser) {
            return successResponse({
                notifications: [],
                totalCount: 0,
                unreadCount: 0,
                hasMore: false
            });
        }

        // Get notifications for this user (using database user ID)
        const where = {
            userId: dbUser.id,
            ...(unreadOnly ? { isRead: false } : {}),
        };

        const [notifications, totalCount, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            prisma.notification.count({ where: { userId: dbUser.id } }),
            prisma.notification.count({ where: { userId: dbUser.id, isRead: false } }),
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

// DELETE /api/notifications - Delete all notifications for user
export async function DELETE(request: NextRequest) {
    try {
        const { userId } = await requireAuth();

        const dbUser = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
        });

        if (!dbUser) {
            return successResponse({ deleted: 0 });
        }

        const { count } = await prisma.notification.deleteMany({
            where: { userId: dbUser.id }
        });

        return successResponse({ deleted: count });
    } catch (error) {
        return handleApiError(error);
    }
}
