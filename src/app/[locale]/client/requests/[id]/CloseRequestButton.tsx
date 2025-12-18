'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

export default function CloseRequestButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const t = useTranslations('ClientRequests.actions.close');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleClose() {
    if (!confirm(t('confirm'))) {
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
        setError(data.message || t('error'));
      }
    } catch (err) {
      setError(t('error'));
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
        {loading ? t('loading') : t('button')}
      </Button>
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}
