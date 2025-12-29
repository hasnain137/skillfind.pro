import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/auth';
import { successResponse, handleApiError, createdResponse } from '@/lib/api-response';
import { z } from 'zod';
import { BadRequestError, NotFoundError, ForbiddenError } from '@/lib/errors';
import { notifyNewReview } from '@/lib/services/notifications';

// Schema for review submission
// Schema for review submission
const createReviewSchema = z.object({
  jobId: z.string(),
  rating: z.number().min(1).max(5),
  content: z.string().min(10, 'Review must be at least 10 characters'),
  wouldRecommend: z.boolean().default(true),
  categories: z.array(z.string()).optional(),
});

import { moderateContent } from '@/lib/moderation';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireClient();

    const body = await req.json();
    const data = createReviewSchema.parse(body);

    // Content Moderation
    const moderation = await moderateContent(data.content);
    if (!moderation.safe) {
      throw new BadRequestError(`Review contains unsafe content: ${moderation.categories.join(', ')}`);
    }

    // Get client profile
    const client = await prisma.client.findUnique({
      where: { userId },
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    if (!client) {
      throw new NotFoundError('Client profile');
    }

    // Get job with professional user for notification
    const job = await prisma.job.findUnique({
      where: { id: data.jobId },
      include: {
        review: true,
        professional: {
          include: {
            user: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundError('Job');
    }

    // Verify ownership
    if (job.clientId !== client.id) {
      throw new ForbiddenError('You can only review jobs you requested');
    }

    // Verify status
    if (job.status !== 'COMPLETED') {
      throw new BadRequestError('You can only review completed jobs');
    }

    // Verify no existing review
    if (job.review) {
      throw new BadRequestError('You have already reviewed this job');
    }

    // Create review
    const review = await prisma.$transaction(async (tx) => {
      const newReview = await tx.review.create({
        data: {
          jobId: job.id,
          clientId: client.id,
          rating: data.rating,
          content: data.content,
          wouldRecommend: data.wouldRecommend,
          moderationStatus: 'APPROVED', // We blocked unsafe content above, so this is safe
        },
      });

      // Update professional stats
      // Recalculate average rating
      const aggregations = await tx.review.aggregate({
        where: {
          job: {
            professionalId: job.professionalId,
          },
        },
        _avg: {
          rating: true,
        },
        _count: {
          id: true,
        },
      });

      await tx.professional.update({
        where: { id: job.professionalId },
        data: {
          averageRating: aggregations._avg.rating || 0,
          totalReviews: aggregations._count.id || 0,
        },
      });

      return newReview;
    });

    // Notify professional about new review (don't block response)
    const clientName = `${client.user.firstName} ${client.user.lastName}`.trim() || 'A client';
    notifyNewReview(
      job.professional.user.id,
      clientName,
      data.rating,
      job.id
    ).catch(err => console.error('Failed to send notification:', err));

    return createdResponse({ review }, 'Review submitted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
