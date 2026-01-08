// GET /api/wallet/stats - Get spending statistics and analytics
import { NextRequest } from 'next/server';
import { requireProfessional } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { getOrCreateWallet } from '@/lib/services/wallet';
import { getClickStats } from '@/lib/services/click-billing';
import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';

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

    // Parse query parameters (days to look back)
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);

    // Get or create wallet
    const wallet = await getOrCreateWallet(professional.id);

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get click statistics
    const clickStats = await getClickStats(professional.id, days);

    // Get transaction statistics
    const [deposits, debits, refunds] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          walletId: wallet.id,
          type: 'DEPOSIT',
          createdAt: { gte: startDate },
        },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: {
          walletId: wallet.id,
          type: 'DEBIT',
          createdAt: { gte: startDate },
        },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: {
          walletId: wallet.id,
          type: 'REFUND',
          createdAt: { gte: startDate },
        },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    // Get daily spending breakdown
    const dailyTransactions = await prisma.transaction.findMany({
      where: {
        walletId: wallet.id,
        createdAt: { gte: startDate },
      },
      select: {
        amount: true,
        type: true,
        createdAt: true,
      },
    });

    // Group by day
    const dailyBreakdown = dailyTransactions.reduce((acc, tx) => {
      const day = tx.createdAt.toISOString().split('T')[0];
      if (!acc[day]) {
        acc[day] = { deposits: 0, debits: 0, net: 0 };
      }
      
      if (tx.type === 'DEPOSIT' || tx.type === 'REFUND') {
        acc[day].deposits += tx.amount;
      } else if (tx.type === 'DEBIT') {
        acc[day].debits += Math.abs(tx.amount);
      }
      acc[day].net = acc[day].deposits - acc[day].debits;
      
      return acc;
    }, {} as Record<string, { deposits: number; debits: number; net: number }>);

    // Calculate averages
    const totalDays = Object.keys(dailyBreakdown).length || 1;
    const totalDebits = Math.abs(debits._sum.amount || 0);
    const avgDailySpend = totalDebits / days;

    // Project when balance will run out
    const daysUntilEmpty = avgDailySpend > 0 
      ? Math.floor(wallet.balance / avgDailySpend)
      : 999;

    // Get offers statistics
    const [totalOffers, acceptedOffers, pendingOffers] = await Promise.all([
      prisma.offer.count({
        where: { professionalId: professional.id },
      }),
      prisma.offer.count({
        where: {
          professionalId: professional.id,
          status: 'ACCEPTED',
        },
      }),
      prisma.offer.count({
        where: {
          professionalId: professional.id,
          status: 'PENDING',
        },
      }),
    ]);

    // Calculate conversion metrics
    const clickToOfferRatio = totalOffers > 0 ? clickStats.totalClicks / totalOffers : 0;
    const offerAcceptanceRate = totalOffers > 0 ? (acceptedOffers / totalOffers) * 100 : 0;

    return successResponse({
      period: {
        days,
        startDate,
        endDate: new Date(),
      },
      currentBalance: {
        cents: wallet.balance,
        euros: wallet.balance / 100,
      },
      transactions: {
        deposits: {
          total: {
            cents: deposits._sum.amount || 0,
            euros: (deposits._sum.amount || 0) / 100,
          },
          count: deposits._count,
        },
        debits: {
          total: {
            cents: totalDebits,
            euros: totalDebits / 100,
          },
          count: debits._count,
        },
        refunds: {
          total: {
            cents: refunds._sum.amount || 0,
            euros: (refunds._sum.amount || 0) / 100,
          },
          count: refunds._count,
        },
      },
      clicks: {
        total: clickStats.totalClicks,
        totalCost: {
          cents: clickStats.totalCostCents,
          euros: clickStats.totalCostEuros,
        },
        byDay: clickStats.clicksByDay,
        averageCostPerClick: {
          cents: Math.round(clickStats.averageCostPerClick),
          euros: clickStats.averageCostPerClick / 100,
        },
      },
      offers: {
        total: totalOffers,
        accepted: acceptedOffers,
        pending: pendingOffers,
        acceptanceRate: offerAcceptanceRate.toFixed(1) + '%',
      },
      analytics: {
        avgDailySpend: {
          cents: Math.round(avgDailySpend),
          euros: avgDailySpend / 100,
        },
        daysUntilEmpty: daysUntilEmpty > 365 ? 'Over 1 year' : `${daysUntilEmpty} days`,
        clickToOfferRatio: clickToOfferRatio.toFixed(2),
        costPerAcceptedOffer: acceptedOffers > 0 ? {
          cents: Math.round(clickStats.totalCostCents / acceptedOffers),
          euros: (clickStats.totalCostCents / acceptedOffers / 100).toFixed(2),
        } : null,
      },
      dailyBreakdown: Object.entries(dailyBreakdown).map(([date, data]) => ({
        date,
        deposits: {
          cents: data.deposits,
          euros: data.deposits / 100,
        },
        debits: {
          cents: data.debits,
          euros: data.debits / 100,
        },
        net: {
          cents: data.net,
          euros: data.net / 100,
        },
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
