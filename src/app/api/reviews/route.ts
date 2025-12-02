// GET /api/reviews - List reviews
// POST /api/reviews - Create review (client only, after job completion)
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireClient } from '@/lib/auth';
import { successResponse, handleApiError, createdResponse } from '@/lib/api-response';
import { createReviewSchema, listReviewsSchema } from '@/lib/validations/review';
import { NotFoundError, ForbiddenError, BadRequestError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    // Public endpoint - no auth required

    // Parse query parameters with error handling
    const { searchParams } = new URL(request.url);
    const params = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      professionalId: searchParams.get('professionalId'),
      rating: searchParams.get('rating'),
      wouldRecommend: searchParams.get('wouldRecommend'),
    };

    let filters;
    try {
      filters = listReviewsSchema.parse(params);
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return successResponse(
        { reviews: [] },
        'Invalid parameters',
        {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        }
      );
    }

    // Build where clause
    const whereClause: any = {
      moderationStatus: 'APPROVED', // Only show approved reviews publicly
    };

    if (filters.professionalId) {
      whereClause.job = {
        professionalId: filters.professionalId,
      };
    }

    if (filters.rating) {
      whereClause.rating = filters.rating;
    }

    if (filters.wouldRecommend !== undefined) {
      whereClause.wouldRecommend = filters.wouldRecommend;
    }

    // Get total count with error handling
    let total = 0;
    try {
      total = await prisma.review.count({ where: whereClause });
    } catch (countError) {
      console.error('Count error:', countError);
      // Return empty if table doesn't exist or has issues
      return successResponse(
        { reviews: [] },
        'No reviews available',
        {
          page: filters.page,
          limit: filters.limit,
          total: 0,
          totalPages: 0,
        }
      );
    }

    // If no reviews, return empty array
    if (total === 0) {
      return successResponse(
        { reviews: [] },
        'No reviews found',
        {
          page: filters.page,
          limit: filters.limit,
          total: 0,
          totalPages: 0,
        }
      );
    }

    // Get reviews
    const reviews = await prisma.review.findMany({
      where: whereClause,
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
      createdAt: review.createdAt,
      professional: {
        id: review.job.professional.id,
        title: review.job.professional.title,
        city: review.job.professional.city,
        user: {
          firstName: review.job.professional.user.firstName,
          lastName: review.job.professional.user.lastName,
        },
      },
      client: {
        firstName: review.client.user.firstName,
        // Last name initial only for privacy
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

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireClient();

    // Get client profile
    const client = await prisma.client.findUnique({
      where: { userId },
    });

    if (!client) {
      throw new NotFoundError('Client profile');
    }

    // Parse and validate request body
    const body = await request.json();
    const data = createReviewSchema.parse(body);

    // Get job
    const job = await prisma.job.findUnique({
      where: { id: data.jobId },
      include: {
        review: true,
      },
    });

    if (!job) {
      throw new NotFoundError('Job');
    }

    // Verify job belongs to client
    if (job.clientId !== client.id) {
      throw new ForbiddenError('You can only review jobs you hired for');
    }

    // Check if job is completed
    if (job.status !== 'COMPLETED') {
      throw new BadRequestError('You can only review completed jobs');
    }

    // Check if review already exists
    if (job.review) {
      throw new BadRequestError('You have already reviewed this job');
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        jobId: job.id,
        clientId: client.id,
        rating: data.rating,
        title: data.title,
        content: data.content,
        tags: data.tags || [],
        wouldRecommend: data.wouldRecommend,
        moderationStatus: 'PENDING', // Admin will review
      },
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
      },
    });

    // Update professional's average rating
    await updateProfessionalRating(job.professionalId);

    // TODO: Send notification to professional
    // TODO: Queue for moderation

    return createdResponse(
      {
        review: {
          id: review.id,
          rating: review.rating,
          title: review.title,
          content: review.content,
          tags: review.tags,
          wouldRecommend: review.wouldRecommend,
          moderationStatus: review.moderationStatus,
          createdAt: review.createdAt,
        },
        message: 'Review submitted successfully. It will be published after moderation.',
      },
      'Review created successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

// Helper function to update professional's average rating
async function updateProfessionalRating(professionalId: string) {
  const reviews = await prisma.review.findMany({
    where: {
      job: {
        professionalId,
      },
      moderationStatus: 'APPROVED',
    },
    select: {
      rating: true,
    },
  });

  if (reviews.length === 0) return;

  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = totalRating / reviews.length;

  await prisma.professional.update({
    where: { id: professionalId },
    data: {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: reviews.length,
    },
  });
}
