'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

export default function StartJobButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const t = useTranslations('ProJobs.actions.start');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleStart() {
    if (!confirm(t('confirm'))) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/jobs/${jobId}/start`, {
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
        onClick={handleStart}
        disabled={loading}
        className="w-full sm:w-auto"
      >
        {loading ? t('loading') : `🚀 ${t('button')}`}
      </Button>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
