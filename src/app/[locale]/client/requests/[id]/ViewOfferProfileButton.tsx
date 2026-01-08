'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

interface ViewOfferProfileButtonProps {
    offerId: string;
    professionalId: string;
    className?: string;
}

export default function ViewOfferProfileButton({
    offerId,
    professionalId,
    className
}: ViewOfferProfileButtonProps) {
    const router = useRouter();
    const t = useTranslations('ClientRequests.actions.viewProfile');
    const [loading, setLoading] = useState(false);

    async function handleClick() {
        setLoading(true);
        try {
            // Attempt to charge €0.10 for viewing
            // If already charged (idempotency), the API will return conflict but that's fine
            await fetch('/api/clicks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ offerId }),
            });
        } catch (error) {
            // Silent fail - don't block profile view if charging fails
            console.error('Click billing failed (non-blocking):', error);
        } finally {
            // Always navigate to profile regardless of billing outcome
            router.push(`/professionals/${professionalId}`);
        }
    }

    return (
        <Button
            variant="ghost"
            className={className}
            onClick={handleClick}
            disabled={loading}
        >
            {loading ? t('loading') : `👤 ${t('button')}`}
        </Button>
    );
}
