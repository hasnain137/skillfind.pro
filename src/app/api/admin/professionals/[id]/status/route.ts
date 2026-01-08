import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { z } from 'zod';

const updateStatusSchema = z.object({
    status: z.enum(['ACTIVE', 'SUSPENDED', 'BANNED']),
});

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { userId } = await requireAdmin(); // Ensure admin

        const body = await request.json();
        const { status } = updateStatusSchema.parse(body);

        const professional = await prisma.professional.update({
            where: { id },
            data: { status },
        });

        // Log admin action
        await prisma.adminAction.create({
            data: {
                adminId: userId,
                action: status === 'BANNED' ? 'USER_BANNED' : 'USER_VERIFIED', // Simplified mapping
                targetType: 'PROFESSIONAL',
                targetId: id,
                metadata: { newStatus: status },
            },
        });

        return successResponse({ professional }, 'Status updated successfully');
    } catch (error) {
        return handleApiError(error);
    }
}
