import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { z } from 'zod';

const moderateReviewSchema = z.object({
    status: z.enum(['APPROVED', 'REJECTED']),
});

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { userId } = await requireAdmin();

        const body = await request.json();
        const { status } = moderateReviewSchema.parse(body);

        const review = await prisma.review.update({
            where: { id },
            data: {
                moderationStatus: status,
                moderatedBy: userId,
                moderatedAt: new Date(),
            },
            include: {
                job: {
                    include: {
                        professional: true,
                    },
                },
            },
        });

        // If approved, update professional stats
        if (status === 'APPROVED') {
            const professionalId = review.job.professionalId;

            // Recalculate average rating
            const stats = await prisma.review.aggregate({
                where: {
                    job: { professionalId },
                    moderationStatus: 'APPROVED',
                },
                _avg: { rating: true },
                _count: { id: true },
            });

            await prisma.professional.update({
                where: { id: professionalId },
                data: {
                    averageRating: stats._avg.rating || 0,
                    totalReviews: stats._count.id,
                },
            });
        }

        return successResponse({ review }, 'Review moderated successfully');
    } catch (error) {
        return handleApiError(error);
    }
}
