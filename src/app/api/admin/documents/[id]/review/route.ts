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

        // If approved, check if we should verify the professional
        if (status === 'APPROVED') {
            // Check if this was the last pending document or if it's a critical one
            // For MVP, if they have at least one approved identity doc, we verify them
            const identityDocs = ['IDENTITY_CARD', 'PASSPORT', 'DRIVERS_LICENSE'];

            if (identityDocs.includes(document.type)) {
                await prisma.professional.update({
                    where: { id: document.professionalId },
                    data: {
                        isVerified: true,
                        verifiedAt: new Date(),
                        verifiedBy: userId,
                        status: 'ACTIVE', // Auto-activate on verification
                    },
                });
            }
        }

        return successResponse({ document }, 'Document reviewed successfully');
    } catch (error) {
        return handleApiError(error);
    }
}
