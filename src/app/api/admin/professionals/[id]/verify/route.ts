import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { z } from 'zod';

const verifySchema = z.object({
    isVerified: z.boolean(),
});

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { userId } = await requireAdmin();

        const body = await request.json();
        const { isVerified } = verifySchema.parse(body);

        const professional = await prisma.professional.update({
            where: { id },
            data: {
                isVerified,
                verifiedAt: isVerified ? new Date() : null,
                verifiedBy: isVerified ? userId : null,
                verificationMethod: 'MANUAL',
            },
        });

        // Log admin action
        await prisma.adminAction.create({
            data: {
                adminId: userId,
                action: isVerified ? 'USER_VERIFIED' : 'USER_REJECTED', // Using REJECTED as proxy for un-verifying
                targetType: 'PROFESSIONAL',
                targetId: id,
                metadata: { isVerified, method: 'MANUAL' },
            },
        });

        return successResponse({ professional }, `Professional ${isVerified ? 'verified' : 'unverified'} successfully`);
    } catch (error) {
        return handleApiError(error);
    }
}
