'use client';

import { useTranslations } from 'next-intl';
import { Spinner } from './Spinner';
import { Container } from './Container';

export function LoadingPage({ message }: { message?: string }) {
  const t = useTranslations('Common');
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Container>
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-sm text-[#7C7373]">{message || t('loading')}</p>
        </div>
      </Container>
    </div>
  );
}

export function LoadingSection({ message }: { message?: string }) {
  const t = useTranslations('Common');
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Spinner size="md" className="mx-auto mb-3" />
        <p className="text-xs text-[#7C7373]">{message || t('loading')}</p>
      </div>
    </div>
  );
}
