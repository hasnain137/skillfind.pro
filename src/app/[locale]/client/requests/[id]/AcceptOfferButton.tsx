'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export default function AcceptOfferButton({
  offerId,
  requestId
}: {
  offerId: string;
  requestId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAccept() {
    // Use a custom toast for confirmation if desired, or just standard confirm for now
    if (!confirm('Accept this offer? This will create a job and reject other offers.')) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/offers/${offerId}/accept`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Offer accepted successfully!');
        router.refresh();
      } else {
        // Display the specific error message from the API
        let errorMessage = data.error?.message || data.message || 'Failed to accept offer';

        // Handle structured validation errors if present
        if (data.error?.code === 'VALIDATION_ERROR' && data.error.details) {
          errorMessage = data.error.details
            .map((d: any) => d.message)
            .join('. ');
        }

        toast.error(errorMessage);
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
      console.error('Error accepting offer:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleAccept}
      disabled={loading}
      className="px-4 py-2 text-xs"
    >
      {loading ? 'Accepting...' : 'Accept Offer'}
    </Button>
  );
}
