'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export default function AcceptOfferButton({
  offerId,
  requestId
}: {
  offerId: string;
  requestId: string;
}) {
  const router = useRouter();
  const t = useTranslations('ClientRequests.actions.accept');
  const [loading, setLoading] = useState(false);

  async function handleAccept() {
    if (!confirm(t('confirm'))) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/offers/${offerId}/accept`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(t('success'));
        router.refresh();
      } else {
        // Display the specific error message from the API
        let errorMessage = data.error?.message || data.message || t('error');

        // Handle structured validation errors if present
        if (data.error?.code === 'VALIDATION_ERROR' && data.error.details) {
          errorMessage = data.error.details
            .map((d: any) => d.message)
            .join('. ');
        }

        toast.error(errorMessage);
      }
    } catch (err) {
      toast.error(t('error'));
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
      {loading ? t('loading') : t('button')}
    </Button>
  );
}
