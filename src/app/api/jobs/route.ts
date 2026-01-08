// GET /api/jobs - List jobs (role-based)
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { paginationSchema } from '@/lib/validations/common';
import { NotFoundError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const { userId, role } = await requireAuth();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    };

    const filters = paginationSchema.parse(params);

    // Get status filter
    const status = searchParams.get('status');

    // Build where clause based on role
    let whereClause: any = {};

    if (role === 'CLIENT') {
      const client = await prisma.client.findUnique({
        where: { userId },
      });

      if (!client) {
        throw new NotFoundError('Client profile');
      }

      whereClause.clientId = client.id;
    } else if (role === 'PROFESSIONAL') {
      const professional = await prisma.professional.findUnique({
        where: { userId },
      });

      if (!professional) {
        throw new NotFoundError('Professional profile');
      }

      whereClause.professionalId = professional.id;
    }

    // Apply status filter if provided
    if (status) {
      whereClause.status = status;
    }

    // Get total count
    const total = await prisma.job.count({ where: whereClause });

    // Get jobs
    const jobs = await prisma.job.findMany({
      where: whereClause,
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
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
                avatar: true,
              },
            },
          },
        },
        professional: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
                avatar: true,
              },
            },
          },
        },
        review: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    });

    // Format response
    const formattedJobs = jobs.map((job) => ({
      id: job.id,
      status: job.status,
      agreedPrice: {
        cents: job.agreedPrice,
        euros: job.agreedPrice ? job.agreedPrice / 100 : null,
      },
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      request: {
        id: job.request.id,
        title: job.request.title,
        description: job.request.description,
        category: job.request.category.nameEn,
        subcategory: job.request.subcategory.nameEn,
      },
      offer: job.request.offers[0] ? {
        id: job.request.offers[0].id,
        message: job.request.offers[0].message,
        proposedPrice: job.request.offers[0].proposedPrice,
      } : null,
      client: {
        firstName: job.client.user.firstName,
        lastName: job.client.user.lastName,
        email: job.client.user.email,
        phoneNumber: job.client.user.phoneNumber,
        city: job.client.city,
        avatar: job.client.user.avatar,
      },
      professional: {
        firstName: job.professional.user.firstName,
        lastName: job.professional.user.lastName,
        email: job.professional.user.email,
        phoneNumber: job.professional.user.phoneNumber,
        city: job.professional.city,
        avatar: job.professional.user.avatar,
      },
      hasReview: !!job.review,
      review: job.review ? {
        id: job.review.id,
        rating: job.review.rating,
        content: job.review.content,
      } : null,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    }));

    return successResponse(
      { jobs: formattedJobs },
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
