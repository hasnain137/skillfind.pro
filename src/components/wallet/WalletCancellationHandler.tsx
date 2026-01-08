'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cancelPendingTransaction } from '@/app/actions/wallet';

export function WalletCancellationHandler() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const canceled = searchParams.get('canceled');
        const transactionId = searchParams.get('transactionId');
        const success = searchParams.get('success');

        if (canceled && transactionId) {
            const handleCancellation = async () => {
                const result = await cancelPendingTransaction(transactionId);

                if (result.success) {
                    toast.info('Deposit canceled', {
                        description: 'No funds were deducted from your account.'
                    });
                } else {
                    toast.error('Cancellation failed', {
                        description: result.error || 'Could not cancel transaction'
                    });
                }

                // Clean URL
                router.replace('/pro/wallet');
            };

            handleCancellation();
        } else if (canceled) {
            // Fallback if no ID (old link)
            toast.info('Deposit canceled');
            router.replace('/pro/wallet');
        }

        if (success) {
            toast.success('Deposit successful!', {
                description: 'Your wallet has been credited.'
            });
            router.replace('/pro/wallet');
        }
    }, [searchParams, router]);

    return null;
}
