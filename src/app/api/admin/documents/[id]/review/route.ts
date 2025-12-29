import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { z } from 'zod';

const reviewDocumentSchema = z.object({
    status: z.enum(['APPROVED', 'REJECTED']),
    rejectionReason: z.string().optional(),
});

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { userId } = await requireAdmin(); // Ensure admin

        const body = await request.json();
        const { status, rejectionReason } = reviewDocumentSchema.parse(body);

        // Update document status
        const document = await prisma.verificationDocument.update({
            where: { id },
            data: {
                status,
                reviewedBy: userId,
                reviewedAt: new Date(),
                rejectionReason: status === 'REJECTED' ? rejectionReason : null,
            },
            include: { professional: true },
        });

        // If approved, recompute verification status using centralized logic
        if (status === 'APPROVED') {
            const { updateProfessionalVerificationStatus } = await import('@/lib/services/verification');
            await updateProfessionalVerificationStatus(document.professionalId);
        }

        return successResponse({ document }, 'Document reviewed successfully');
    } catch (error) {
        return handleApiError(error);
    }
}
