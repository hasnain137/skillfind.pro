'use client';

import { useTranslations } from 'next-intl';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-3',
};

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const t = useTranslations('Common');
  return (
    <div
      className={`inline-block animate-spin rounded-full border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] ${SIZES[size]} ${className}`}
      role="status"
    >
      <span className="sr-only">{t('loading')}</span>
    </div>
  );
}

export function LoadingButton({ children, loading, ...props }: any) {
  const t = useTranslations('Common');
  return (
    <button {...props} disabled={loading || props.disabled}>
      {loading ? (
        <span className="flex items-center gap-2">
          <Spinner size="sm" />
          <span>{t('loading')}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
