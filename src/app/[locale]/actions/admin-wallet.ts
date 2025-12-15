'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';

export async function addManualCredit(professionalId: string, amount: number, note: string) {
    // 1. Verify Authentication (Admin check could be added here if not handled by middleware)
    const session = await auth();
    if (!session?.userId) {
        return { success: false, error: 'Unauthorized' };
    }

    // In a real app, you might query the user role here to ensure they are an ADMIN
    // const user = await prisma.user.findUnique({ where: { clerkId: session.userId } });
    // if (user?.role !== 'ADMIN') { return { success: false, error: 'Forbidden' }; }

    if (!amount || amount <= 0) {
        return { success: false, error: 'Invalid amount' };
    }

    try {
        // 2. Perform Transaction
        // We use a transaction to ensure both Wallet and Transaction records are created atomically
        await prisma.$transaction(async (tx) => {
            // Find user's wallet
            const wallet = await tx.wallet.findUnique({
                where: { professionalId: professionalId },
            });

            if (!wallet) {
                throw new Error('Wallet not found');
            }

            const amountInCents = Math.round(amount * 100); // Store as cents
            const newBalance = wallet.balance + amountInCents;

            // Update Wallet
            await tx.wallet.update({
                where: { id: wallet.id },
                data: {
                    balance: newBalance,
                    totalDeposits: { increment: amountInCents },
                },
            });

            // Create Transaction Record
            await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    type: 'ADMIN_ADJUSTMENT',
                    amount: amountInCents,
                    balanceBefore: wallet.balance,
                    balanceAfter: newBalance,
                    description: note || 'Admin manual credit',
                    adminId: session.userId, // Log who did it
                },
            });
        });

        // 3. Revalidate the page
        revalidatePath(`/admin/professionals/${professionalId}`);
        return { success: true };

    } catch (error: any) {
        console.error('Failed to add credit:', error);
        return { success: false, error: error.message || 'Failed to add credit' };
    }
}
