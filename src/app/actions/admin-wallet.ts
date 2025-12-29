
'use server';

import { prisma } from '@/lib/prisma';
import { recordTransaction } from '@/lib/services/wallet';
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

        // 2. Transact using the shared service
        // Logic: The DB usually stores integers (cents).
        const amountInCents = Math.round(amount * 100);

        // Use recordTransaction to support both positive (credit) and negative (debit) adjustments
        const tx = await recordTransaction({
            walletId: wallet.id,
            amount: amountInCents,
            type: 'ADMIN_ADJUSTMENT',
            description: `Manual Adjustment: ${note}`,
            adminId: userId,
            adminNote: note
        });

        revalidatePath('/admin/professionals');
        revalidatePath(`/admin/professionals/${professionalId}`);

        return { success: true, transactionId: tx.id };

    } catch (error) {
        console.error('Failed to add manual credit:', error);
        return { success: false, error: 'Internal server error' };
    }
}
