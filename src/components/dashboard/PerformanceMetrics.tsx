// src/components/dashboard/PerformanceMetrics.tsx
'use client';

import { useTranslations } from 'next-intl';

interface MetricsData {
  profileViews: number;
  offersSent: number;
  acceptanceRate: number;
  averageRating: number;
  totalReviews: number;
  responseTime: string;
}

interface PerformanceMetricsProps {
  data: MetricsData;
}

type IconBadgeColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';

interface Metric {
  label: string;
  value: string | number;
  icon: string;
  iconColor: IconBadgeColor;
  badge?: string | null;
}

export function PerformanceMetrics({ data }: PerformanceMetricsProps) {
  const t = useTranslations('Dashboard.PerformanceMetrics');

  const metrics: Metric[] = [
    {
      label: t('profileViews'),
      value: data.profileViews,
      icon: '👁️',
      iconColor: 'blue',
    },
    {
      label: t('offersSent'),
      value: data.offersSent,
      icon: '📨',
      iconColor: 'purple',
    },
    {
      label: t('acceptanceRate'),
      value: `${data.acceptanceRate}%`,
      icon: '✅',
      iconColor: 'green',
    },
    {
      label: t('avgRating'),
      value: data.averageRating > 0 ? `${data.averageRating.toFixed(1)}/5` : t('na'),
      icon: '⭐',
      iconColor: 'orange',
      badge: data.totalReviews > 0 ? t('reviews', { count: data.totalReviews }) : null,
    },
    {
      label: t('responseTime'),
      value: data.responseTime,
      icon: '⚡',
      iconColor: 'green',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric, index) => (
        <div
          key={metric.label}
          className={`
            glass-card rounded-2xl p-5
            transition-all duration-300 hover:shadow-glass-hover hover:scale-[1.01]
            stagger-${index + 1}
          `}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Label */}
              <p className="text-stat-label">{metric.label}</p>

              {/* Value */}
              <p className="mt-2 text-stat-value tabular-nums">
                {metric.value}
              </p>

              {/* Badge (e.g., review count) */}
              {metric.badge && (
                <p className="mt-2 text-xs text-gray-500">
                  {metric.badge}
                </p>
              )}
            </div>

            {/* Icon Badge */}
            <div className={`icon-badge icon-badge-${metric.iconColor}`}>
              {metric.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

