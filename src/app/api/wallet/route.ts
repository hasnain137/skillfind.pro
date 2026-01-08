// GET /api/wallet - Get wallet balance and summary
import { requireProfessional } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { getOrCreateWallet } from '@/lib/services/wallet';
import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';

export async function GET() {
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

    // Get transaction summary
    const [
      totalDeposits,
      totalDebits,
      totalClicks,
      clicksToday,
      recentTransactions,
    ] = await Promise.all([
      // Total deposits
      prisma.transaction.aggregate({
        where: {
          walletId: wallet.id,
          type: 'DEPOSIT',
        },
        _sum: { amount: true },
      }),
      // Total debits (clicks + adjustments)
      prisma.transaction.aggregate({
        where: {
          walletId: wallet.id,
          type: 'DEBIT',
        },
        _sum: { amount: true },
      }),
      // Total clicks count
      prisma.clickEvent.count({
        where: { professionalId: professional.id },
      }),
      // Clicks today
      prisma.clickEvent.count({
        where: {
          professionalId: professional.id,
          clickedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      // Recent transactions (last 5)
      prisma.transaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    // Get platform settings for limits
    const platformSettings = await prisma.platformSettings.findFirst();
    const minimumBalance = platformSettings?.minimumWalletBalance || 200;

    // Calculate stats
    const balanceCents = wallet.balance;
    const balanceEuros = balanceCents / 100;
    const totalDepositsCents = totalDeposits._sum.amount || 0;
    const totalDebitsCents = Math.abs(totalDebits._sum.amount || 0);

    // Status checks
    const isLowBalance = balanceCents < minimumBalance;
    const canReceiveClicks = balanceCents >= minimumBalance;

    return successResponse({
      wallet: {
        id: wallet.id,
        balance: {
          cents: balanceCents,
          euros: balanceEuros,
          formatted: `€${balanceEuros.toFixed(2)}`,
        },
        status: {
          isLowBalance,
          canReceiveClicks,
          minimumBalance: {
            cents: minimumBalance,
            euros: minimumBalance / 100,
          },
        },
        summary: {
          totalDeposits: {
            cents: totalDepositsCents,
            euros: totalDepositsCents / 100,
          },
          totalDebits: {
            cents: totalDebitsCents,
            euros: totalDebitsCents / 100,
          },
          totalClicks,
          clicksToday,
        },
        recentTransactions: recentTransactions.map((tx) => ({
          id: tx.id,
          type: tx.type,
          amount: {
            cents: tx.amount,
            euros: tx.amount / 100,
          },
          description: tx.description,
          createdAt: tx.createdAt,
        })),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
