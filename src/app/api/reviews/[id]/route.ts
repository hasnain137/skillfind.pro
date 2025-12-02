// GET /api/reviews/[id] - View single review
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError } from '@/lib/api-response';
import { NotFoundError } from '@/lib/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get review
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            professional: {
              select: {
                id: true,
                title: true,
                city: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    avatar: true,
                  },
                },
              },
            },
            request: {
              include: {
                subcategory: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        },
        client: {
          select: {
            city: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        professionalResponse: true,
      },
    });

    if (!review) {
      throw new NotFoundError('Review');
    }

    // Only show approved reviews publicly
    if (review.moderationStatus !== 'APPROVED') {
      throw new NotFoundError('Review not found or pending moderation');
    }

    return successResponse({
      review: {
        id: review.id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        tags: review.tags,
        wouldRecommend: review.wouldRecommend,
        createdAt: review.createdAt,
        professional: {
          id: review.job.professional.id,
          title: review.job.professional.title,
          city: review.job.professional.city,
          user: {
            firstName: review.job.professional.user.firstName,
            lastName: review.job.professional.user.lastName,
            avatar: review.job.professional.user.avatar,
          },
        },
        client: {
          firstName: review.client.user.firstName,
          lastNameInitial: review.client.user.lastName ? review.client.user.lastName.charAt(0) + '.' : '',
          city: review.client.city,
        },
        service: {
          category: review.job.request.subcategory.category.nameEn,
          subcategory: review.job.request.subcategory.nameEn,
        },
        professionalResponse: review.professionalResponse ? {
          response: review.professionalResponse.response,
          createdAt: review.professionalResponse.createdAt,
        } : null,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
