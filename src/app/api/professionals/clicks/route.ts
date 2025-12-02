// GET /api/professionals/clicks
// View detailed click charge history and analytics for professionals
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireProfessional } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { z } from 'zod';
import { NotFoundError } from '@/lib/errors';

// Validation schema
const clickAnalyticsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  offerId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireProfessional();

    // Get professional profile
    const professional = await prisma.professional.findUnique({
      where: { userId },
    });

    if (!professional) {
      throw new NotFoundError('Professional profile');
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      offerId: searchParams.get('offerId'),
    };

    const filters = clickAnalyticsSchema.parse(params);

    // Build where clause for click events
    const whereClause: any = {
      professionalId: professional.id,
    };

    if (filters.offerId) {
      whereClause.offerId = filters.offerId;
    }

    if (filters.startDate || filters.endDate) {
      whereClause.createdAt = {};
      if (filters.startDate) {
        whereClause.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        whereClause.createdAt.lte = filters.endDate;
      }
    }

    // Get total count
    const total = await prisma.clickEvent.count({ where: whereClause });

    // Get click events
    const clicks = await prisma.clickEvent.findMany({
      where: whereClause,
      include: {
        offer: {
          include: {
            request: {
              select: {
                id: true,
                title: true,
                category: {
                  select: {
                    nameEn: true,
                  },
                },
                subcategory: {
                  select: {
                    nameEn: true,
                  },
                },
              },
            },
          },
        },
        transaction: {
          select: {
            id: true,
            amount: true,
            description: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        clickedAt: 'desc',
      },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    });

    // Calculate analytics - ClickEvent doesn't have a charged amount field
    // Just count the clicks (each click has the same cost from platform settings)
    const totalClicks = await prisma.clickEvent.count({
      where: whereClause,
    });

    // Get daily aggregates for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyClicks = await prisma.$queryRaw<
      Array<{ date: Date; clicks: bigint; totalCharged: bigint }>
    >`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as clicks,
        SUM(charged) as totalCharged
      FROM click_events
      WHERE professional_id = ${professional.id}
        AND created_at >= ${thirtyDaysAgo}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    // Get total statistics
    // Get total click stats
    const totalStats = {
      _count: totalClicks,
    };

    // Format response
    const formattedClicks = clicks.map((click) => ({
      id: click.id,
      charged: click.transaction ? {
        cents: Math.abs(click.transaction.amount),
        euros: Math.abs(click.transaction.amount) / 100,
      } : null,
      clickedAt: click.clickedAt,
      offer: {
        id: click.offer.id,
        message: click.offer.message.substring(0, 100) + '...',
        proposedPrice: click.offer.proposedPrice,
        status: click.offer.status,
      },
      request: {
        id: click.offer.request.id,
        title: click.offer.request.title,
        category: click.offer.request.category.nameEn,
        subcategory: click.offer.request.subcategory.nameEn,
      },
      transaction: click.transaction
        ? {
            id: click.transaction.id,
            amount: {
              cents: click.transaction.amount,
              euros: click.transaction.amount / 100,
            },
            description: click.transaction.description,
            createdAt: click.transaction.createdAt,
          }
        : null,
    }));

    return successResponse(
      {
        clicks: formattedClicks,
        analytics: {
          totalClicks: Number(totalStats._count),
          last30Days: dailyClicks.map((day) => ({
            date: day.date,
            clicks: Number(day.clicks),
          })),
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
