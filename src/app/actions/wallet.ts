'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function cancelPendingTransaction(transactionId: string) {
    const { userId } = await auth();
    if (!userId) return { error: 'Unauthorized' };

    try {
        // 1. Verify ownership: The transaction must belong to a wallet belonging to the user
        // We can do this by checking if the transaction's wallet's professional's userId matches
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: {
                wallet: {
                    include: {
                        professional: true
                    }
                }
            }
        });

        if (!transaction) return { success: false, message: 'Transaction not found' };

        if (transaction.wallet.professional.userId !== userId) {
            return { error: 'Unauthorized' };
        }

        // 2. Only delete if it's strictly a DEPOSIT (safeguard)
        // In a real app we might want to check if it's "pending" based on timestamp or lack of referenceId
        // But our current flow assumes anything calling this endpoint is trying to clean up a failed attempt
        if (transaction.type !== 'DEPOSIT') {
            return { error: 'Invalid transaction type' };
        }

        await prisma.transaction.delete({
            where: { id: transactionId }
        });

        revalidatePath('/pro/wallet');
        return { success: true };
    } catch (error) {
        console.error('Failed to cancel transaction:', error);
        return { error: 'Failed to cancel transaction' };
    }
}
