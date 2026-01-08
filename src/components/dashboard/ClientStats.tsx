'use client';

import { useTranslations } from 'next-intl';
import { FileText, Mail, CheckCircle, Wallet } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ClientMetricsData {
    openRequests: number;
    totalOffers: number;
    completedRequests: number;
    // totalSpent?: number; // Add later if available
}

interface ClientStatsProps {
    data: ClientMetricsData;
}

type IconColor = 'blue' | 'purple' | 'green' | 'orange';

interface Metric {
    label: string;
    value: string | number;
    icon: React.ElementType;
    color: IconColor;
    badge?: string | null;
}

export function ClientStats({ data }: ClientStatsProps) {
    const t = useTranslations('ClientDashboard.stats');

    const metrics: Metric[] = [
        {
            label: t('openRequests'),
            value: data.openRequests,
            icon: FileText,
            color: 'blue',
        },
        {
            label: t('totalOffers'),
            value: data.totalOffers,
            icon: Mail,
            color: 'purple',
        },
        {
            label: t('completedRequests'),
            value: data.completedRequests,
            icon: CheckCircle,
            color: 'green',
        },
    ];

    const getColorStyles = (color: IconColor) => {
        switch (color) {
            case 'blue': return 'bg-blue-50 text-blue-600 ring-blue-600/20';
            case 'purple': return 'bg-purple-50 text-purple-600 ring-purple-600/20';
            case 'green': return 'bg-green-50 text-green-600 ring-green-600/20';
            case 'orange': return 'bg-orange-50 text-orange-600 ring-orange-600/20';
            default: return 'bg-gray-50 text-gray-600 ring-gray-600/20';
        }
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map((metric, index) => (
                <div
                    key={metric.label}
                    className={cn(
                        "group relative flex flex-col justify-between p-6 rounded-3xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:bg-white/80",
                        `stagger-${index + 1}`
                    )}
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className={cn("p-3 rounded-2xl transition-colors ring-1", getColorStyles(metric.color))}>
                            <metric.icon className="w-5 h-5" />
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">
                            {metric.label}
                        </p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-semibold text-[#333333] tabular-nums tracking-tight">
                                {metric.value}
                            </p>
                            {metric.badge && (
                                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                                    {metric.badge}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
