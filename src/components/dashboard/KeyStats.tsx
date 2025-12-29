'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Link } from '@/i18n/routing';
import { Briefcase, Send, Wallet, Star, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface KeyStatsProps {
    activeJobs: number;
    pendingOffers: number;
    walletBalance: number;
    avgRating: string | number;
    currency?: string;
}

export function KeyStats({
    activeJobs,
    pendingOffers,
    walletBalance,
    avgRating,
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
            color: 'text-blue-600 bg-blue-50'
        },
        {
            id: 'offers',
            label: t('pendingOffers'),
            value: pendingOffers,
            icon: <Send className="h-4 w-4" />,
            href: '/pro/offers',
            color: 'text-purple-600 bg-purple-50'
        },
        {
            id: 'wallet',
            label: t('walletBalance'),
            value: new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(walletBalance / 100),
            icon: <Wallet className="h-4 w-4" />,
            href: '/pro/wallet',
            color: 'text-green-600 bg-green-50'
        },
        {
            id: 'rating',
            label: t('avgRating'),
            value: avgRating === 'N/A' ? '—' : `⭐ ${avgRating}`,
            icon: <Star className="h-4 w-4" />,
            href: '/pro/profile',
            color: 'text-amber-600 bg-amber-50'
        }
    ];

    return (
        <Card level={1} className="h-full border border-white/40 shadow-lg">
            <CardHeader className="pb-3 border-b border-gray-100/50">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
                        <Briefcase className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-sm font-bold text-[#333333] uppercase tracking-wide">{t('title')}</h3>
                </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
                {stats.map((stat) => (
                    <Link
                        key={stat.id}
                        href={stat.href}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 border border-gray-100 hover:bg-gray-100/80 hover:border-gray-200 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${stat.color}`}>
                                {stat.icon}
                            </div>
                            <span className="text-sm text-[#7C7373] font-medium">{stat.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-[#333333]">{stat.value}</span>
                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </div>
                    </Link>
                ))}
            </CardContent>
        </Card>
    );
}
