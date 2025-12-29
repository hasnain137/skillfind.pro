'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Link } from '@/i18n/routing';
import {
    Briefcase,
    Send,
    Wallet,
    Star,
    ChevronRight,
    CheckCircle2,
    Bell,
    TrendingUp
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface KeyStatsProps {
    activeJobs: number;
    pendingOffers: number;
    walletBalance: number;
    avgRating: string | number;
    completedJobs: number;
    newRequestsToday: number;
    totalReviews: number;
    currency?: string;
}

export function KeyStats({
    activeJobs,
    pendingOffers,
    walletBalance,
    avgRating,
    completedJobs,
    newRequestsToday,
    totalReviews,
    currency = 'EUR'
}: KeyStatsProps) {
    const t = useTranslations('ProDashboard.KeyStats');

    const stats = [
        {
            id: 'jobs',
            label: t('activeJobs'),
            value: activeJobs,
            icon: <Briefcase className="h-4 w-4" />,
            href: '/pro/jobs',
            color: 'text-blue-600 bg-blue-50',
            highlight: activeJobs > 0
        },
        {
            id: 'offers',
            label: t('pendingOffers'),
            value: pendingOffers,
            icon: <Send className="h-4 w-4" />,
            href: '/pro/offers',
            color: 'text-purple-600 bg-purple-50',
            highlight: pendingOffers > 0
        },
        {
            id: 'newRequests',
            label: t('newRequestsToday'),
            value: newRequestsToday,
            icon: <Bell className="h-4 w-4" />,
            href: '/pro/requests',
            color: 'text-red-600 bg-red-50',
            highlight: newRequestsToday > 0
        },
        {
            id: 'completed',
            label: t('completedJobs'),
            value: completedJobs,
            icon: <CheckCircle2 className="h-4 w-4" />,
            href: '/pro/jobs?filter=completed',
            color: 'text-green-600 bg-green-50',
            highlight: false
        },
        {
            id: 'wallet',
            label: t('walletBalance'),
            value: new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(walletBalance / 100),
            icon: <Wallet className="h-4 w-4" />,
            href: '/pro/wallet',
            color: 'text-emerald-600 bg-emerald-50',
            highlight: walletBalance < 200
        },
        {
            id: 'rating',
            label: t('avgRating'),
            value: avgRating === 'N/A' ? '—' : `⭐ ${avgRating}`,
            subValue: totalReviews > 0 ? `(${totalReviews} ${t('reviews')})` : null,
            icon: <Star className="h-4 w-4" />,
            href: '/pro/profile',
            color: 'text-amber-600 bg-amber-50',
            highlight: false
        }
    ];

    return (
        <Card level={1} className="border border-white/40 shadow-lg">
            <CardHeader className="pb-3 border-b border-gray-100/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                        </div>
                        <h3 className="text-sm font-bold text-[#333333] uppercase tracking-wide">{t('title')}</h3>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-3">
                    {stats.map((stat) => (
                        <Link
                            key={stat.id}
                            href={stat.href}
                            className={`flex flex-col p-4 rounded-xl border transition-all group ${stat.highlight
                                    ? 'bg-gradient-to-br from-blue-50 to-white border-blue-200 shadow-sm'
                                    : 'bg-gray-50/50 border-gray-100 hover:bg-gray-100/80 hover:border-gray-200'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className={`p-2 rounded-lg ${stat.color}`}>
                                    {stat.icon}
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                            </div>
                            <span className="text-2xl font-bold text-[#333333]">{stat.value}</span>
                            <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs text-[#7C7373] font-medium">{stat.label}</span>
                                {stat.subValue && (
                                    <span className="text-xs text-[#9CA3AF]">{stat.subValue}</span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
