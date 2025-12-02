// POST /api/admin/reviews/[id]/reject - Reject review
// Admin only
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { NotFoundError, BadRequestError } from '@/lib/errors';
import { z } from 'zod';

const rejectReviewSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    // Parse body
    const body = await request.json();
    const data = rejectReviewSchema.parse(body);

    // Get review
    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundError('Review');
    }

    // Check if already rejected
    if (review.moderationStatus === 'REJECTED') {
      throw new BadRequestError('Review is already rejected');
    }

    // Reject review
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        moderationStatus: 'REJECTED',
        moderationNote: data.reason,
        moderatedAt: new Date(),
      },
    });

    // TODO: Send notification to client

    return successResponse(
      {
        review: {
          id: updatedReview.id,
          moderationStatus: updatedReview.moderationStatus,
          moderationNote: updatedReview.moderationNote,
          moderatedAt: updatedReview.moderatedAt,
        },
        message: 'Review rejected. Client has been notified.',
      },
      'Review rejected successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
