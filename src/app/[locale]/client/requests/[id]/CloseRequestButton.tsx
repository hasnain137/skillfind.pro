'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function CloseRequestButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleClose() {
    if (!confirm('Close this request? You will no longer receive offers.')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/requests/${requestId}/close`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        // Success! Redirect to requests list
        router.push('/client/requests');
        router.refresh();
      } else {
        setError(data.message || 'Failed to close request');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Error closing request:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button 
        onClick={handleClose}
        disabled={loading}
        variant="ghost"
        className="text-xs border border-[#E5E7EB]"
      >
        {loading ? 'Closing...' : 'Close Request'}
      </Button>
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}
