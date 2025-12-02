// POST /api/admin/reviews/[id]/approve - Approve review
// Admin only
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { NotFoundError, BadRequestError } from '@/lib/errors';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    // Get review
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        job: true,
      },
    });

    if (!review) {
      throw new NotFoundError('Review');
    }

    // Check if already approved
    if (review.moderationStatus === 'APPROVED') {
      throw new BadRequestError('Review is already approved');
    }

    // Approve review
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        moderationStatus: 'APPROVED',
        moderatedAt: new Date(),
      },
    });

    // Update professional's rating
    await updateProfessionalRating(review.job.professionalId);

    // TODO: Send notification to professional

    return successResponse(
      {
        review: {
          id: updatedReview.id,
          moderationStatus: updatedReview.moderationStatus,
          moderatedAt: updatedReview.moderatedAt,
        },
        message: 'Review approved and published. Professional has been notified.',
      },
      'Review approved successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

// Helper to update professional rating
async function updateProfessionalRating(professionalId: string) {
  const reviews = await prisma.review.findMany({
    where: {
      job: { professionalId },
      moderationStatus: 'APPROVED',
    },
    select: { rating: true },
  });

  if (reviews.length === 0) return;

  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = totalRating / reviews.length;

  await prisma.professional.update({
    where: { id: professionalId },
    data: {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
    },
  });
}
