'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function ReviewModerationActions({ reviewId }: { reviewId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);

    async function handleAction(action: 'APPROVED' | 'REJECTED') {
        if (!confirm(`Are you sure you want to ${action} this review?`)) return;

        setLoading(action);
        try {
            const res = await fetch(`/api/admin/reviews/${reviewId}/moderate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: action }),
            });

            if (!res.ok) throw new Error('Failed to moderate review');
            router.refresh();
        } catch (error) {
            alert('Error moderating review');
            console.error(error);
        } finally {
            setLoading(null);
        }
    }

    return (
        <div className="flex justify-end gap-2">
            <Button
                variant="destructive"
                className="text-xs"
                onClick={() => handleAction('REJECTED')}
                disabled={!!loading}
            >
                Reject
            </Button>
            <Button
                variant="success"
                className="text-xs"
                onClick={() => handleAction('APPROVED')}
                disabled={!!loading}
            >
                Approve
            </Button>
        </div>
    );
}
