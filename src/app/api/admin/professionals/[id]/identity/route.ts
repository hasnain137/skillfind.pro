import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { setIdentityVerified } from '@/lib/services/verification';
import { z } from 'zod';

const identitySchema = z.object({
    verified: z.boolean(),
});

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { userId } = await requireAdmin();

        const body = await request.json();
        const { verified } = identitySchema.parse(body);

        // Use centralized verification logic
        await setIdentityVerified(id, verified, userId);

        // Fetch updated professional
        const professional = await prisma.professional.findUnique({
            where: { id },
            select: {
                isVerified: true,
                qualificationVerified: true,
                stripeIdentityVerificationId: true,
            }
        });

        return successResponse(
            { professional },
            `Identity ${verified ? 'verified' : 'unverified'} successfully`
        );
    } catch (error) {
        return handleApiError(error);
    }
}
