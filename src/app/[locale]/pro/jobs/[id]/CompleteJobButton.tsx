'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

export default function CompleteJobButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const t = useTranslations('ProJobs.actions.complete');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleComplete() {
    if (!confirm(t('confirm'))) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/jobs/${jobId}/complete`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('error'));
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
        {loading ? t('loading') : `✅ ${t('button')}`}
      </Button>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
