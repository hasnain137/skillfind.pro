
'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export async function addManualCredit(professionalId: string, amount: number, note: string) {
    try {
        const { userId, sessionClaims } = await auth();

        // Basic Role Check (Ensure User is Admin)
        const metadata = sessionClaims?.metadata as { role?: string } | undefined;
        const publicMetadata = sessionClaims?.publicMetadata as { role?: string } | undefined;
        const userRole = metadata?.role || publicMetadata?.role;

        if (userRole !== 'ADMIN') {
            return { success: false, error: 'Unauthorized. Admin access required.' };
        }

        // 1. Get Wallet
        const wallet = await prisma.wallet.findUnique({
            where: { professionalId }
        });

        if (!wallet) {
            // Attempt to create if missing? Or error?
            // Usually Pro creation makes a wallet.
            return { success: false, error: 'Wallet not found for this professional.' };
        }

        // 2. Transact
        // Convert to cents if amount is float? The UI passes a float. 
        // Logic: The DB usually stores integers (cents).
        // Let's assume input is in EUR (e.g. 10.50), DB is cents.
        const amountInCents = Math.round(amount * 100);

        const transaction = await prisma.$transaction(async (tx) => {
            // Create Transaction Record
            const newTx = await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    type: 'ADMIN_ADJUSTMENT',
                    amount: amountInCents,
                    balanceBefore: wallet.balance,
                    balanceAfter: wallet.balance + amountInCents,
                    description: `Manual Adjustment: ${note}`,
                    adminId: userId,
                    adminNote: note
                }
            });

            // Update Wallet
            await tx.wallet.update({
                where: { id: wallet.id },
                data: {
                    balance: { increment: amountInCents },
                    totalDeposits: { increment: amountInCents > 0 ? amountInCents : 0 }
                    // If negative adjustment, maybe track separately? 
                    // For now, simple increment.
                }
            });

            return newTx;
        });

        revalidatePath('/admin/professionals');
        revalidatePath(`/admin/professionals/${professionalId}`);

        return { success: true, transactionId: transaction.id };

    } catch (error) {
        console.error('Failed to add manual credit:', error);
        return { success: false, error: 'Internal server error' };
    }
}
