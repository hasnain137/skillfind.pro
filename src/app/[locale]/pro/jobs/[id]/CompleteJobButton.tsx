'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function CompleteJobButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleComplete() {
    if (!confirm('Mark this job as complete? The client will be notified and asked to leave a review.')) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/jobs/${jobId}/complete`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete job');
      }

      // Refresh the page to show updated status
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleComplete}
        disabled={loading}
        className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
      >
        {loading ? 'Completing...' : '✅ Mark as Complete'}
      </Button>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
