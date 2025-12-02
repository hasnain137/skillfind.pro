// src/components/dashboard/PerformanceMetrics.tsx

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
  const metrics = [
    {
      label: 'Profile Views',
      value: data.profileViews,
      icon: '👁️',
      color: 'from-blue-50 to-blue-100 border-blue-200',
      textColor: 'text-blue-700',
    },
    {
      label: 'Offers Sent',
      value: data.offersSent,
      icon: '📨',
      color: 'from-purple-50 to-purple-100 border-purple-200',
      textColor: 'text-purple-700',
    },
    {
      label: 'Acceptance Rate',
      value: `${data.acceptanceRate}%`,
      icon: '✅',
      color: 'from-green-50 to-green-100 border-green-200',
      textColor: 'text-green-700',
    },
    {
      label: 'Avg. Rating',
      value: data.averageRating > 0 ? `${data.averageRating.toFixed(1)}/5` : 'N/A',
      icon: '⭐',
      color: 'from-yellow-50 to-yellow-100 border-yellow-200',
      textColor: 'text-yellow-700',
      badge: data.totalReviews > 0 ? `${data.totalReviews} reviews` : null,
    },
    {
      label: 'Response Time',
      value: data.responseTime,
      icon: '⚡',
      color: 'from-orange-50 to-orange-100 border-orange-200',
      textColor: 'text-orange-700',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className={`group relative overflow-hidden rounded-xl border bg-gradient-to-br p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${metric.color}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-[#7C7373]">{metric.label}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <p className={`text-2xl font-bold ${metric.textColor}`}>
                  {metric.value}
                </p>
              </div>
              {metric.badge && (
                <p className="mt-1 text-[10px] text-[#7C7373]">
                  {metric.badge}
                </p>
              )}
            </div>
            <div className="text-2xl opacity-50 group-hover:scale-110 transition-transform">
              {metric.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
