'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { handleActionError } from '@/lib/action-utils';
import { UnauthorizedError, NotFoundError, ForbiddenError, BadRequestError } from '@/lib/errors';

export async function cancelPendingTransaction(transactionId: string) {
    try {
        const { userId } = await auth();
        if (!userId) throw new UnauthorizedError();

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

        if (!transaction) throw new NotFoundError('Transaction');

        if (transaction.wallet.professional.userId !== userId) {
            throw new ForbiddenError('You do not own this transaction');
        }

        // 2. Only delete if it's strictly a DEPOSIT (safeguard)
        // In a real app we might want to check if it's "pending" based on timestamp or lack of referenceId
        // But our current flow assumes anything calling this endpoint is trying to clean up a failed attempt
        if (transaction.type !== 'DEPOSIT') {
            throw new BadRequestError('Only deposit transactions can be cancelled');
        }

        await prisma.transaction.delete({
            where: { id: transactionId }
        });

        revalidatePath('/pro/wallet');
        return { success: true };
    } catch (error) {
        return handleActionError(error);
    }
}
