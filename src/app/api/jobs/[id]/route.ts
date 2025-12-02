// GET /api/jobs/[id] - View job details
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { NotFoundError, ForbiddenError } from '@/lib/errors';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, role } = await requireAuth();
    const { id } = await context.params;

    // Get job with all details
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        request: {
          include: {
            category: true,
            subcategory: true,
            offers: {
              where: {
                status: 'ACCEPTED',
              },
              take: 1,
            },
          },
        },
        client: {
          include: {
            user: true,
          },
        },
        professional: {
          include: {
            user: true,
          },
        },
        review: {
          include: {
            professionalResponse: true,
          },
        },
        disputes: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundError('Job');
    }

    // Verify access
    if (role === 'CLIENT') {
      const client = await prisma.client.findUnique({
        where: { userId },
      });

      if (job.clientId !== client?.id) {
        throw new ForbiddenError('You can only view your own jobs');
      }
    } else if (role === 'PROFESSIONAL') {
      const professional = await prisma.professional.findUnique({
        where: { userId },
      });

      if (job.professionalId !== professional?.id) {
        throw new ForbiddenError('You can only view your own jobs');
      }
    }

    // Format response
    return successResponse({
      job: {
        id: job.id,
        status: job.status,
        agreedPrice: {
          cents: job.agreedPrice,
          euros: job.agreedPrice ? job.agreedPrice / 100 : null,
        },
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        request: {
          id: job.request.id,
          title: job.request.title,
          description: job.request.description,
          budgetMin: job.request.budgetMin,
          budgetMax: job.request.budgetMax,
          city: job.request.city,
          locationType: job.request.locationType,
          category: {
            id: job.request.category.id,
            name: job.request.category.nameEn,
          },
          subcategory: {
            id: job.request.subcategory.id,
            name: job.request.subcategory.nameEn,
          },
        },
        offer: job.request.offers[0] ? {
          id: job.request.offers[0].id,
          message: job.request.offers[0].message,
          proposedPrice: job.request.offers[0].proposedPrice,
          estimatedDuration: job.request.offers[0].estimatedDuration,
          availableTimeSlots: job.request.offers[0].availableTimeSlots,
        } : null,
        client: {
          firstName: job.client.user.firstName,
          lastName: job.client.user.lastName,
          email: job.client.user.email,
          phoneNumber: job.client.user.phoneNumber,
          city: job.client.city,
          region: job.client.region,
          avatar: job.client.user.avatar,
        },
        professional: {
          id: job.professional.id,
          title: job.professional.title,
          bio: job.professional.bio,
          yearsOfExperience: job.professional.yearsOfExperience,
          city: job.professional.city,
          region: job.professional.region,
          user: {
            firstName: job.professional.user.firstName,
            lastName: job.professional.user.lastName,
            email: job.professional.user.email,
            phoneNumber: job.professional.user.phoneNumber,
            avatar: job.professional.user.avatar,
          },
        },
        review: job.review ? {
          id: job.review.id,
          rating: job.review.rating,
          title: job.review.title,
          content: job.review.content,
          tags: job.review.tags,
          wouldRecommend: job.review.wouldRecommend,
          createdAt: job.review.createdAt,
          professionalResponse: job.review.professionalResponse ? {
            response: job.review.professionalResponse.response,
            createdAt: job.review.professionalResponse.createdAt,
          } : null,
        } : null,
        disputes: job.disputes.map((dispute) => ({
          id: dispute.id,
          reason: dispute.reason,
          description: dispute.description,
          status: dispute.status,
          createdAt: dispute.createdAt,
        })),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
