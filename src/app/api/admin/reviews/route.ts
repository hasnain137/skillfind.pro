// GET /api/admin/reviews - List reviews pending moderation
// Admin only
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { paginationSchema } from '@/lib/validations/common';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    };

    const filters = paginationSchema.parse(params);

    // Get status filter
    const status = searchParams.get('status') || 'PENDING';

    // Build where clause
    const whereClause: any = {};
    
    if (status) {
      whereClause.moderationStatus = status;
    }

    // Get total count
    const total = await prisma.review.count({ where: whereClause });

    // Get reviews
    const reviews = await prisma.review.findMany({
      where: whereClause,
      include: {
        job: {
          include: {
            professional: {
              include: {
                user: true,
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
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    });

    // Format response
    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      content: review.content,
      tags: review.tags,
      wouldRecommend: review.wouldRecommend,
      moderationStatus: review.moderationStatus,
      moderationNote: review.moderationNote,
      createdAt: review.createdAt,
      professional: {
        id: review.job.professional.id,
        title: review.job.professional.title,
        user: {
          firstName: review.job.professional.user.firstName,
          lastName: review.job.professional.user.lastName,
          email: review.job.professional.user.email,
        },
      },
      client: {
        id: review.client.id,
        user: {
          firstName: review.client.user.firstName,
          lastName: review.client.user.lastName,
          email: review.client.user.email,
        },
      },
      service: {
        category: review.job.request.subcategory.category.nameEn,
        subcategory: review.job.request.subcategory.nameEn,
      },
      jobId: review.jobId,
    }));

    return successResponse(
      { reviews: formattedReviews },
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
