// GET /api/admin/analytics - Platform analytics and statistics
// Admin only
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    // Parse query parameters for date range
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all statistics in parallel
    const [
      // User stats
      totalUsers,
      activeUsers,
      clientCount,
      professionalCount,
      newUsersInPeriod,

      // Request stats
      totalRequests,
      openRequests,
      closedRequests,
      requestsInPeriod,

      // Offer stats
      totalOffers,
      pendingOffers,
      acceptedOffers,
      offersInPeriod,

      // Job stats
      totalJobs,
      completedJobs,
      inProgressJobs,
      jobsInPeriod,

      // Review stats
      totalReviews,
      pendingReviews,
      approvedReviews,
      reviewsInPeriod,

      // Transaction stats
      totalTransactions,
      totalRevenue,
      transactionsInPeriod,

      // Click stats
      totalClicks,
      clicksInPeriod,

      // Dispute stats
      totalDisputes,
      openDisputes,

      // Platform settings
      platformSettings,
    ] = await Promise.all([
      // Users
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.client.count(),
      prisma.professional.count(),
      prisma.user.count({ where: { createdAt: { gte: startDate } } }),

      // Requests
      prisma.request.count(),
      prisma.request.count({ where: { status: 'OPEN' } }),
      prisma.request.count({
        where: { status: { in: ['COMPLETED', 'CANCELLED'] } },
      }),
      prisma.request.count({ where: { createdAt: { gte: startDate } } }),

      // Offers
      prisma.offer.count(),
      prisma.offer.count({ where: { status: 'PENDING' } }),
      prisma.offer.count({ where: { status: 'ACCEPTED' } }),
      prisma.offer.count({ where: { createdAt: { gte: startDate } } }),

      // Jobs
      prisma.job.count(),
      prisma.job.count({ where: { status: 'COMPLETED' } }),
      prisma.job.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.job.count({ where: { createdAt: { gte: startDate } } }),

      // Reviews
      prisma.review.count(),
      prisma.review.count({ where: { moderationStatus: 'PENDING' } }),
      prisma.review.count({ where: { moderationStatus: 'APPROVED' } }),
      prisma.review.count({ where: { createdAt: { gte: startDate } } }),

      // Transactions
      prisma.transaction.count(),
      prisma.transaction.aggregate({
        where: { type: 'DEPOSIT' },
        _sum: { amount: true },
      }),
      prisma.transaction.count({ where: { createdAt: { gte: startDate } } }),

      // Clicks
      prisma.clickEvent.count(),
      prisma.clickEvent.count({ where: { clickedAt: { gte: startDate } } }),

      // Disputes
      prisma.dispute.count(),
      prisma.dispute.count({ where: { status: 'OPEN' } }),

      // Settings
      prisma.platformSettings.findFirst(),
    ]);

    // Calculate conversion rates
    const requestToOfferRate = totalRequests > 0 ? (totalOffers / totalRequests) : 0;
    const offerAcceptanceRate = totalOffers > 0 ? (acceptedOffers / totalOffers) * 100 : 0;
    const jobCompletionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;
    
    // Calculate click revenue
    const clickFee = platformSettings?.clickFee ?? 10;
    const totalClickRevenue = totalClicks * clickFee;
    const periodClickRevenue = clicksInPeriod * clickFee;

    // Get daily breakdown for the period
    const dailyRequests = await prisma.request.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: startDate } },
      _count: { id: true },
    });

    const dailyJobs = await prisma.job.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: startDate } },
      _count: { id: true },
    });

    // Get top professionals by reviews
    const topProfessionals = await prisma.professional.findMany({
      where: {
        totalReviews: { gt: 0 },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: { jobs: true },
        },
      },
      orderBy: [
        { averageRating: 'desc' },
        { totalReviews: 'desc' },
      ],
      take: 10,
    });

    // Get top categories by requests
    const topCategories = await prisma.request.groupBy({
      by: ['categoryId'],
      _count: { id: true },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    const topCategoriesWithNames = await Promise.all(
      topCategories.map(async (cat: { categoryId: string; _count: { id: number } }) => {
        const category = await prisma.category.findUnique({
          where: { id: cat.categoryId },
        });
        return {
          categoryId: cat.categoryId,
          name: category?.nameEn || 'Unknown',
          count: cat._count.id,
        };
      })
    );

    return successResponse({
      period: {
        days,
        startDate,
        endDate: new Date(),
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        clients: clientCount,
        professionals: professionalCount,
        newInPeriod: newUsersInPeriod,
      },
      requests: {
        total: totalRequests,
        open: openRequests,
        closed: closedRequests,
        newInPeriod: requestsInPeriod,
      },
      offers: {
        total: totalOffers,
        pending: pendingOffers,
        accepted: acceptedOffers,
        newInPeriod: offersInPeriod,
      },
      jobs: {
        total: totalJobs,
        completed: completedJobs,
        inProgress: inProgressJobs,
        newInPeriod: jobsInPeriod,
      },
      reviews: {
        total: totalReviews,
        pending: pendingReviews,
        approved: approvedReviews,
        newInPeriod: reviewsInPeriod,
      },
      financial: {
        totalTransactions,
        totalRevenue: {
          cents: totalRevenue._sum.amount || 0,
          euros: (totalRevenue._sum.amount || 0) / 100,
        },
        transactionsInPeriod,
        clicks: {
          total: totalClicks,
          inPeriod: clicksInPeriod,
          revenue: {
            cents: totalClickRevenue,
            euros: totalClickRevenue / 100,
          },
          revenueInPeriod: {
            cents: periodClickRevenue,
            euros: periodClickRevenue / 100,
          },
        },
      },
      disputes: {
        total: totalDisputes,
        open: openDisputes,
      },
      conversions: {
        requestToOfferRate: requestToOfferRate.toFixed(2),
        offerAcceptanceRate: offerAcceptanceRate.toFixed(1) + '%',
        jobCompletionRate: jobCompletionRate.toFixed(1) + '%',
      },
      topProfessionals: topProfessionals.map((pro: { 
        id: string; 
        averageRating: number; 
        totalReviews: number; 
        user: { firstName: string | null; lastName: string | null; email: string }; 
        _count: { jobs: number } 
      }) => ({
        id: pro.id,
        name: `${pro.user.firstName || 'Unknown'} ${pro.user.lastName || 'User'}`,
        email: pro.user.email,
        averageRating: pro.averageRating,
        totalReviews: pro.totalReviews,
        totalJobs: pro._count.jobs,
      })),
      topCategories: topCategoriesWithNames,
      platformSettings: {
        clickFee: platformSettings?.clickFee || 10,
        minimumWalletBalance: platformSettings?.minimumWalletBalance || 200,
        maxOffersPerRequest: platformSettings?.maxOffersPerRequest || 10,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
