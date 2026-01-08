// Wallet service with transaction safety
import 'server-only';
import { prisma } from '../prisma';
import { TransactionType } from '@prisma/client';
import { stripe } from '@/lib/stripe';
import { InsufficientBalanceError } from '../errors';

/**
 * Get or create wallet for a professional
 */
export async function getOrCreateWallet(professionalId: string) {
  let wallet = await prisma.wallet.findUnique({
    where: { professionalId },
  });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        professionalId,
        balance: 0,
      },
    });
  }

  return wallet;
}

/**
 * Calculate wallet balance from transactions
 */
export async function calculateWalletBalance(walletId: string): Promise<number> {
  const result = await prisma.transaction.aggregate({
    where: { walletId },
    _sum: { amount: true },
  });

  return result._sum.amount || 0;
}

/**
 * Record a transaction and update wallet balance (atomic)
 */
export async function recordTransaction(params: {
  walletId: string;
  amount: number; // Positive for credits, negative for debits
  type: TransactionType;
  description: string;
  referenceId?: string;
  adminId?: string;
  adminNote?: string;
}) {
  const { walletId, amount, type, description, referenceId, adminId, adminNote } = params;

  // Use transaction to ensure atomicity
  return await prisma.$transaction(async (tx) => {
    // 1. Pessimistic Lock: Lock the wallet row to prevent race conditions
    // This requires the table name to match the DB exactly (mapped to "wallets")
    await tx.$executeRaw`SELECT 1 FROM "wallets" WHERE id = ${walletId} FOR UPDATE`;

    // 2. Refresh wallet data (now locked)
    const wallet = await tx.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + amount;

    // 3. Prevent negative balance
    // Note: This check is now safe because we hold a lock on the row
    if (balanceAfter < 0) {
      throw new InsufficientBalanceError(
        `Insufficient balance. Current: €${(wallet.balance / 100).toFixed(2)}, Required: €${(Math.abs(amount) / 100).toFixed(2)}`
      );
    }

    // 4. Create transaction record
    const transaction = await tx.transaction.create({
      data: {
        walletId,
        amount,
        type,
        description,
        balanceBefore,
        balanceAfter,
        referenceId,
        adminId,
        adminNote,
      },
    });

    // 5. Update wallet balance
    await tx.wallet.update({
      where: { id: walletId },
      data: { balance: balanceAfter },
    });

    return transaction;
  });
}

/**
 * Debit from wallet (used for PPC clicks)
 */
export async function debitWallet(params: {
  professionalId: string;
  amount: number; // Positive number (will be converted to negative)
  description: string;
  referenceId?: string;
}) {
  const wallet = await getOrCreateWallet(params.professionalId);

  return await recordTransaction({
    walletId: wallet.id,
    amount: -Math.abs(params.amount), // Ensure negative
    type: 'DEBIT',
    description: params.description,
    referenceId: params.referenceId,
  });
}

/**
 * Credit to wallet (deposits, refunds)
 */
export async function creditWallet(params: {
  professionalId: string;
  amount: number;
  type: 'DEPOSIT' | 'REFUND' | 'ADMIN_ADJUSTMENT';
  description: string;
  referenceId?: string;
  adminId?: string;
  adminNote?: string;
}) {
  const wallet = await getOrCreateWallet(params.professionalId);

  return await recordTransaction({
    walletId: wallet.id,
    amount: Math.abs(params.amount), // Ensure positive
    type: params.type,
    description: params.description,
    referenceId: params.referenceId,
    adminId: params.adminId,
    adminNote: params.adminNote,
  });
}

/**
 * Check if professional has sufficient balance
 */
export async function hasSufficientBalance(
  professionalId: string,
  requiredAmount: number
): Promise<boolean> {
  const wallet = await getOrCreateWallet(professionalId);
  return wallet.balance >= requiredAmount;
}

/**
 * Get minimum wallet balance requirement (from platform settings)
 */
export async function getMinimumWalletBalance(): Promise<number> {
  const settings = await prisma.platformSettings.findFirst();
  return settings?.minimumWalletBalance || 200; // Default: €2.00
}

/**
 * Get wallet with transaction history
 */
export async function getWalletWithTransactions(
  professionalId: string,
  limit = 50
) {
  const wallet = await getOrCreateWallet(professionalId);

  const transactions = await prisma.transaction.findMany({
    where: { walletId: wallet.id },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return {
    wallet,
    transactions,
  };
}

/**
 * Complete a pending deposit transaction
 * Verifies with Stripe and updates wallet
 */
export async function completeDeposit(pendingTransactionId: string) {
  // 1. Find the pending transaction
  const pendingTx = await prisma.transaction.findUnique({
    where: { id: pendingTransactionId },
    include: { wallet: true }
  });

  if (!pendingTx) {
    // It might have been already processed and deleted
    return { status: 'not_found' };
  }

  if (pendingTx.type !== 'DEPOSIT') {
    throw new Error('Transaction is not a deposit');
  }

  // 2. Verify with Stripe
  // The pending transaction stores the session ID in referenceId
  const sessionId = pendingTx.referenceId;
  if (!sessionId || !sessionId.startsWith('cs_')) {
    throw new Error('Invalid Stripe session ID');
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== 'paid') {
    return { status: 'pending', paymentStatus: session.payment_status };
  }

  const paymentIntentId = session.payment_intent as string;

  // 3. Idempotency Check
  // Check if a completed transaction with the PAYMENT INTENT ID already exists
  const existingCompletedTx = await prisma.transaction.findFirst({
    where: {
      referenceId: paymentIntentId,
      type: 'DEPOSIT'
    }
  });

  if (existingCompletedTx) {
    // Already processed. Just clean up the pending one if it still exists.
    try {
      if (pendingTx) {
        await prisma.transaction.delete({ where: { id: pendingTransactionId } });
      }
    } catch (e) {
      // Ignore if already deleted
    }
    return { status: 'completed', transaction: existingCompletedTx };
  }

  // 4. Process Success
  // Delete pending first
  await prisma.transaction.delete({ where: { id: pendingTransactionId } });

  // Create credit
  const newTx = await creditWallet({
    professionalId: pendingTx.wallet.professionalId,
    amount: session.amount_total || 0,
    type: 'DEPOSIT',
    description: `Stripe deposit ${paymentIntentId}`,
    referenceId: paymentIntentId,
  });

  return { status: 'completed', transaction: newTx };
}
