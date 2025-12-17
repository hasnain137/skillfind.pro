'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function CompleteJobButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleComplete() {
    if (!confirm('Mark this job as complete? The professional will be notified.')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/jobs/${jobId}/complete`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        router.refresh();
      } else {
        setError(data.message || 'Failed to complete job');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Error completing job:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button 
        onClick={handleComplete}
        disabled={loading}
      >
        {loading ? 'Completing...' : 'Mark as Complete'}
      </Button>
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}
