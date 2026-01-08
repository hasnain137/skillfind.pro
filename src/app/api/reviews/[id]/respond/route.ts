// POST /api/reviews/[id]/respond - Professional responds to review
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireProfessional } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { createReviewResponseSchema } from '@/lib/validations/review';
import { NotFoundError, ForbiddenError, BadRequestError } from '@/lib/errors';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireProfessional();
    const { id: reviewId } = await params;

    // Get professional
    const professional = await prisma.professional.findUnique({
      where: { userId },
    });

    if (!professional) {
      throw new NotFoundError('Professional profile');
    }

    // Parse and validate request body
    const body = await request.json();
    const data = createReviewResponseSchema.parse(body);

    // Get review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        job: true,
        client: { include: { user: true } },
        professionalResponse: true,
      },
    });

    if (!review) {
      throw new NotFoundError('Review');
    }

    // Verify review is for this professional's job
    if (review.job.professionalId !== professional.id) {
      throw new ForbiddenError('You can only respond to reviews on your own jobs');
    }

    // Check if review is approved
    if (review.moderationStatus !== 'APPROVED') {
      throw new BadRequestError('You can only respond to approved reviews');
    }

    // Check if response already exists
    if (review.professionalResponse) {
      throw new BadRequestError('You have already responded to this review');
    }

    // Create response
    const response = await prisma.reviewResponse.create({
      data: {
        reviewId: review.id,
        response: data.response,
      },
    });

    // Send notification to client
    await import('@/lib/services/mail').then(mod =>
      mod.sendNotificationEmail(
        review.client.user.email,
        'Professional Responded to Your Review',
        `Hello ${review.client.user.firstName}, \n\nProfessional has responded to your review: \n\n"${data.response}" \n\nYou can view it on their profile or in your completed reviews.`,
        `/pro/${review.job.professionalId}`
      )
    ).catch(err => console.error('Failed to send response email:', err));

    return successResponse(
      {
        response: {
          id: response.id,
          response: response.response,
          createdAt: response.createdAt,
        },
        message: 'Response submitted successfully. Client will be notified.',
      },
      'Response created successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
