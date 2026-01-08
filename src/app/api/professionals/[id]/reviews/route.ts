// GET /api/professionals/[id]/reviews - Get all reviews for a professional
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError } from '@/lib/api-response';
import { paginationSchema } from '@/lib/validations/common';
import { NotFoundError } from '@/lib/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: professionalId } = await params;

    // Verify professional exists
    const professional = await prisma.professional.findUnique({
      where: { id: professionalId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!professional) {
      throw new NotFoundError('Professional profile');
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params_query = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    };

    const filters = paginationSchema.parse(params_query);

    // Build where clause
    const whereClause = {
      job: {
        professionalId,
      },
      moderationStatus: 'APPROVED' as const,
    };

    // Get total count
    const total = await prisma.review.count({ where: whereClause });

    // Get reviews
    const reviews = await prisma.review.findMany({
      where: whereClause,
      include: {
        job: {
          include: {
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
          include: {
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
      orderBy: {
        createdAt: 'desc',
      },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    });

    // Calculate rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: whereClause,
      _count: {
        rating: true,
      },
    });

    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    ratingDistribution.forEach((item) => {
      distribution[item.rating as keyof typeof distribution] = item._count.rating;
    });

    // Calculate recommendation percentage
    const recommendCount = await prisma.review.count({
      where: {
        ...whereClause,
        wouldRecommend: true,
      },
    });

    const recommendationPercentage = total > 0 ? Math.round((recommendCount / total) * 100) : 0;

    // Format reviews
    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      content: review.content,
      tags: review.tags,
      wouldRecommend: review.wouldRecommend,
      createdAt: review.createdAt,
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
    }));

    return successResponse(
      {
        professional: {
          id: professional.id,
          title: professional.title,
          averageRating: professional.averageRating,
          totalReviews: professional.totalReviews,
          city: professional.city,
          user: {
            firstName: professional.user.firstName,
            lastName: professional.user.lastName,
          },
        },
        reviews: formattedReviews,
        statistics: {
          total,
          averageRating: professional.averageRating,
          ratingDistribution: distribution,
          recommendationPercentage,
        },
      },
      undefined,
      {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
