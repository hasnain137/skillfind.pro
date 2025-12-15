// Click billing service (Pay-Per-Click)
import 'server-only';
import { prisma } from '../prisma';
import { debitWallet, getMinimumWalletBalance, hasSufficientBalance } from './wallet';
import { InsufficientBalanceError, LimitExceededError, ConflictError } from '../errors';

const CLICK_FEE_CENTS = 10; // €0.10 per click

/**
 * Record a click and charge the professional's wallet
 * This is idempotent - won't charge twice for same offer/client
 */
export async function recordClickAndCharge(params: {
  offerId: string;
  clientId: string;
  clickType?: 'OFFER_VIEW' | 'PROFILE_VIEW' | 'CONTACT_REVEAL';
}) {
  const { offerId, clientId, clickType = 'OFFER_VIEW' } = params;

  // Get offer with professional info
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: {
      professional: {
        include: {
          wallet: true,
        },
      },
      request: true,
    },
  });

  if (!offer) {
    throw new Error('Offer not found');
  }

  // Check if click already recorded (idempotency)
  const existingClick = await prisma.clickEvent.findFirst({
    where: {
      offerId,
      clientId,
    },
  });

  if (existingClick) {
    // Already charged for this click
    throw new ConflictError('Click already recorded for this offer and client');
  }



  // Check minimum balance requirement
  const minBalance = await getMinimumWalletBalance();
  const hasBalance = await hasSufficientBalance(offer.professionalId, minBalance);

  if (!hasBalance) {
    throw new InsufficientBalanceError(
      `Wallet balance below minimum requirement of €${(minBalance / 100).toFixed(2)}. Please top up to continue receiving clicks.`
    );
  }

  // Check if wallet has enough for this click
  const canAffordClick = await hasSufficientBalance(offer.professionalId, CLICK_FEE_CENTS);

  if (!canAffordClick) {
    throw new InsufficientBalanceError(
      `Insufficient balance to process click. Fee: €${(CLICK_FEE_CENTS / 100).toFixed(2)}`
    );
  }

  // Record click and charge in a transaction
  return await prisma.$transaction(async (tx) => {
    // Create click event
    const clickEvent = await tx.clickEvent.create({
      data: {
        professionalId: offer.professionalId,
        clientId,
        offerId,
      },
    });

    // Debit wallet (this already handles transaction safety)
    await debitWallet({
      professionalId: offer.professionalId,
      amount: CLICK_FEE_CENTS,
      description: `Click fee for ${clickType.toLowerCase().replace('_', ' ')}`,
      referenceId: clickEvent.id,
    });

    return clickEvent;
  });
}

/**
 * Get click statistics for a professional
 */
export async function getClickStats(professionalId: string, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const clicks = await prisma.clickEvent.findMany({
    where: {
      professionalId,
      clickedAt: {
        gte: startDate,
      },
    },
    orderBy: {
      clickedAt: 'desc',
    },
  });

  const totalClicks = clicks.length;
  const totalCost = totalClicks * CLICK_FEE_CENTS; // Fixed fee per click

  // Group by day
  const clicksByDay = clicks.reduce((acc, click) => {
    const day = click.clickedAt.toISOString().split('T')[0];
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalClicks,
    totalCostCents: totalCost,
    totalCostEuros: totalCost / 100,
    clicksByDay,
    averageCostPerClick: CLICK_FEE_CENTS,
  };
}

/**
 * Check if a click can be processed without actually charging
 */
export async function canProcessClick(
  professionalId: string
): Promise<{ canProcess: boolean; reason?: string }> {


  // Check minimum balance
  const minBalance = await getMinimumWalletBalance();
  const hasMinBalance = await hasSufficientBalance(professionalId, minBalance);

  if (!hasMinBalance) {
    return {
      canProcess: false,
      reason: `Wallet balance below minimum requirement of €${(minBalance / 100).toFixed(2)}`,
    };
  }

  // Check if can afford click
  const canAfford = await hasSufficientBalance(professionalId, CLICK_FEE_CENTS);

  if (!canAfford) {
    return {
      canProcess: false,
      reason: `Insufficient balance for click fee of €${(CLICK_FEE_CENTS / 100).toFixed(2)}`,
    };
  }

  return { canProcess: true };
}
