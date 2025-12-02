'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function AcceptOfferButton({ 
  offerId, 
  requestId 
}: { 
  offerId: string; 
  requestId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAccept() {
    if (!confirm('Accept this offer? This will create a job and reject other offers.')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/offers/${offerId}/accept`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        // Success! Refresh the page to show updated status
        router.refresh();
      } else {
        setError(data.message || 'Failed to accept offer');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Error accepting offer:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button 
        onClick={handleAccept}
        disabled={loading}
        className="px-4 py-2 text-xs"
      >
        {loading ? 'Accepting...' : 'Accept Offer'}
      </Button>
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}
