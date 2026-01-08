// GET /api/wallet/transactions - Get transaction history with filters
import { NextRequest } from 'next/server';
import { requireProfessional } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { getOrCreateWallet } from '@/lib/services/wallet';
import { listTransactionsSchema } from '@/lib/validations/wallet';
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

    // Get or create wallet
    const wallet = await getOrCreateWallet(professional.id);

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      type: searchParams.get('type'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
    };

    const filters = listTransactionsSchema.parse(params);

    // Build where clause
    const whereClause: any = {
      walletId: wallet.id,
    };

    if (filters.type) {
      whereClause.type = filters.type;
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
    const total = await prisma.transaction.count({ where: whereClause });

    // Get transactions
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    });

    // Calculate period totals
    const periodTotals = await prisma.transaction.groupBy({
      by: ['type'],
      where: whereClause,
      _sum: {
        amount: true,
      },
    });

    const totals = periodTotals.reduce((acc, item) => {
      acc[item.type] = {
        cents: item._sum.amount || 0,
        euros: (item._sum.amount || 0) / 100,
      };
      return acc;
    }, {} as Record<string, { cents: number; euros: number }>);

    return successResponse(
      {
        transactions: transactions.map((tx) => ({
          id: tx.id,
          type: tx.type,
          amount: {
            cents: tx.amount,
            euros: tx.amount / 100,
            formatted: `${tx.amount > 0 ? '+' : ''}€${(tx.amount / 100).toFixed(2)}`,
          },
          description: tx.description,
          referenceId: tx.referenceId,
          createdAt: tx.createdAt,
        })),
        summary: {
          currentBalance: {
            cents: wallet.balance,
            euros: wallet.balance / 100,
          },
          periodTotals: totals,
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
