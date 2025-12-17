// src/components/dashboard/PerformanceMetrics.tsx

import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
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

export function PerformanceMetrics({ data }: PerformanceMetricsProps) {
  const t = useTranslations('Dashboard.PerformanceMetrics');

  const metrics = [
    {
      label: t('profileViews'),
      value: data.profileViews,
      icon: '👁️',
      color: 'bg-blue-50/50 border-blue-100 text-blue-700',
    },
    {
      label: t('offersSent'),
      value: data.offersSent,
      icon: '📨',
      color: 'bg-purple-50/50 border-purple-100 text-purple-700',
    },
    {
      label: t('acceptanceRate'),
      value: `${data.acceptanceRate}%`,
      icon: '✅',
      color: 'bg-green-50/50 border-green-100 text-green-700',
    },
    {
      label: t('avgRating'),
      value: data.averageRating > 0 ? `${data.averageRating.toFixed(1)}/5` : t('na'),
      icon: '⭐',
      color: 'bg-yellow-50/50 border-yellow-100 text-yellow-700',
      badge: data.totalReviews > 0 ? t('reviews', { count: data.totalReviews }) : null,
    },
    {
      label: t('responseTime'),
      value: data.responseTime, // This value might need its own formatting if it's "1 hour" etc.
      icon: '⚡',
      color: 'bg-orange-50/50 border-orange-100 text-orange-700',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => (
        <Card
          key={metric.label}
          level={2}
          className={cn("transition-all hover:-translate-y-0.5 hover:shadow-medium border", metric.color)}
        >
          <CardContent className="p-4 flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium opacity-80">{metric.label}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-2xl font-bold">
                  {metric.value}
                </p>
              </div>
              {metric.badge && (
                <p className="mt-1 text-[10px] opacity-70">
                  {metric.badge}
                </p>
              )}
            </div>
            <div className="text-2xl opacity-50">
              {metric.icon}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
