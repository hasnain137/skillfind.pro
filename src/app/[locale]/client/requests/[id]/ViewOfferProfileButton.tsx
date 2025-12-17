'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

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
    const [loading, setLoading] = useState(false);

    async function handleClick() {
        setLoading(true);
        try {
            // Record the click (fire and forget, or await?)
            // Awaiting ensures we record it, but adds delay.
            // Given it's a billing event, we should probably attempt it.
            await fetch('/api/clicks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ offerId }),
            });
        } catch (error) {
            console.error('Failed to record click:', error);
            // Proceed anyway, don't block user navigation
        } finally {
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
            {loading ? 'Loading...' : '👤 View Profile'}
        </Button>
    );
}
