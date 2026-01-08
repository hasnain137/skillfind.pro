import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, handleApiError, errorResponse } from '@/lib/api-response';
import { NotFoundError, ForbiddenError } from '@/lib/errors';
import { z } from 'zod';

// POST /api/admin/verify-qualification - Approve a professional's qualifications
export async function POST(request: NextRequest) {
    try {
        const { userId, role } = await requireAuth();

        // Admin-only endpoint
        if (role !== 'ADMIN') {
            throw new ForbiddenError('Admin access required');
        }

        // Parse request body
        const body = await request.json();
        const schema = z.object({
            professionalId: z.string(),
            approved: z.boolean(),
            notes: z.string().optional(),
        });

        const data = schema.parse(body);

        // Fetch professional
        const professional = await prisma.professional.findUnique({
            where: { id: data.professionalId },
            include: {
                services: {
                    include: {
                        subcategory: true,
                    },
                },
            },
        });

        if (!professional) {
            throw new NotFoundError('Professional');
        }

        // Edge case: Check if professional actually has any services
        if (professional.services.length === 0) {
            return errorResponse(
                400,
                'NO_SERVICES',
                'This professional has not added any services yet.'
            );
        }

        // Update qualification status
        // Update qualification status
        if (data.approved) {
            await prisma.professional.update({
                where: { id: data.professionalId },
                data: {
                    qualificationVerified: true,
                },
            });

            console.log(`[Admin] Approved qualifications for professional ${data.professionalId} by admin ${userId}`);
        } else {
            // Unverify/Reject case
            await prisma.professional.update({
                where: { id: data.professionalId },
                data: {
                    qualificationVerified: false,
                },
            });

            console.log(`[Admin] Unverified/Rejected qualifications for professional ${data.professionalId} by admin ${userId}. Notes: ${data.notes}`);
        }

        // Recompute verification status using centralized logic (handles both upgrade and downgrade)
        const { updateProfessionalVerificationStatus } = await import('@/lib/services/verification');
        await updateProfessionalVerificationStatus(data.professionalId);

        return successResponse({
            professionalId: data.professionalId,
            qualificationVerified: data.approved,
            message: data.approved
                ? 'Qualifications approved successfully'
                : 'Qualifications rejected',
        });
    } catch (error) {
        return handleApiError(error);
    }
}
