// GET /api/admin/disputes - List disputes for admin review
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
    const status = searchParams.get('status') || 'OPEN';

    // Build where clause
    const whereClause: any = {};
    
    if (status) {
      whereClause.status = status;
    }

    // Get total count
    const total = await prisma.dispute.count({ where: whereClause });

    // Get disputes
    const disputes = await prisma.dispute.findMany({
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
    const formattedDisputes = disputes.map((dispute) => ({
      id: dispute.id,
      reason: dispute.reason,
      description: dispute.description,
      evidenceUrls: dispute.evidenceUrls,
      status: dispute.status,
      raisedBy: dispute.raisedBy,
      resolution: dispute.resolution,
      resolvedAt: dispute.resolvedAt,
      createdAt: dispute.createdAt,
      job: {
        id: dispute.job.id,
        status: dispute.job.status,
        agreedPrice: dispute.job.agreedPrice,
        request: {
          title: dispute.job.request.title,
          category: dispute.job.request.subcategory.category.nameEn,
          subcategory: dispute.job.request.subcategory.nameEn,
        },
        client: {
          id: dispute.job.client.id,
          user: {
            firstName: dispute.job.client.user.firstName,
            lastName: dispute.job.client.user.lastName,
            email: dispute.job.client.user.email,
          },
        },
        professional: {
          id: dispute.job.professional.id,
          title: dispute.job.professional.title,
          user: {
            firstName: dispute.job.professional.user.firstName,
            lastName: dispute.job.professional.user.lastName,
            email: dispute.job.professional.user.email,
          },
        },
      },
    }));

    return successResponse(
      { disputes: formattedDisputes },
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
