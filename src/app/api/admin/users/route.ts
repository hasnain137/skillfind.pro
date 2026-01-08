// GET /api/admin/users - List users with filters
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

    // Get filters
    const role = searchParams.get('role');
    const isActive = searchParams.get('isActive');
    const emailVerified = searchParams.get('emailVerified');
    const search = searchParams.get('search');

    // Build where clause
    const whereClause: any = {};

    if (role) {
      whereClause.role = role;
    }

    if (isActive !== null) {
      whereClause.isActive = isActive === 'true';
    }

    if (emailVerified !== null) {
      whereClause.emailVerified = emailVerified === 'true';
    }

    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.user.count({ where: whereClause });

    // Get users
    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        clientProfile: {
          include: {
            _count: {
              select: {
                requests: true,
                jobs: true,
                reviews: true,
              },
            },
          },
        },
        professionalProfile: {
          include: {
            wallet: true,
            _count: {
              select: {
                offers: true,
                jobs: true,
                services: true,
              },
            },
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
    const formattedUsers = users.map((user) => ({
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phoneNumber: user.phoneNumber,
      city: user.clientProfile?.city || user.professionalProfile?.city,
      country: user.clientProfile?.country || user.professionalProfile?.country,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      stats: user.role === 'CLIENT' ? {
        requestsCount: user.clientProfile?._count.requests || 0,
        jobsCount: user.clientProfile?._count.jobs || 0,
        reviewsCount: user.clientProfile?._count.reviews || 0,
      } : user.role === 'PROFESSIONAL' ? {
        offersCount: user.professionalProfile?._count.offers || 0,
        jobsCount: user.professionalProfile?._count.jobs || 0,
        servicesCount: user.professionalProfile?._count.services || 0,
        walletBalance: user.professionalProfile?.wallet?.balance || 0,
        averageRating: user.professionalProfile?.averageRating,
        totalReviews: user.professionalProfile?.totalReviews || 0,
      } : {},
    }));

    return successResponse(
      { users: formattedUsers },
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
