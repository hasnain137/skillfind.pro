// src/app/admin/page.tsx
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { StatCard } from '@/components/ui/StatCard';
import { getTranslations } from 'next-intl/server';

export default async function AdminDashboardPage() {
    const t = await getTranslations('Components.AdminDashboard');

    // Fetch high-level stats
    const [
        totalUsers,
        totalProfessionals,
        totalClients,
        pendingVerifications,
        totalRevenue,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.professional.count(),
        prisma.client.count(),
        prisma.professional.count({
            where: {
                OR: [
                    { status: 'PENDING_REVIEW' },
                    { isVerified: false },
                ],
            },
        }),
        prisma.wallet.aggregate({
            _sum: {
                totalSpent: true,
            },
        }),
    ]);

    const revenueEuros = (totalRevenue._sum.totalSpent || 0) / 100;

    const stats = [
        { label: t('metrics.totalUsers'), value: totalUsers },
        { label: t('metrics.professionals'), value: totalProfessionals },
        { label: t('metrics.clients'), value: totalClients },
        { label: t('metrics.pendingVerifications'), value: pendingVerifications },
        { label: t('metrics.totalRevenue'), value: `€${revenueEuros.toFixed(2)}` },
    ];

    return (
        <div className="space-y-6">
            <SectionHeading
                eyebrow={t('eyebrow')}
                title={t('title')}
                description={t('description')}
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat) => (
                    <StatCard
                        key={stat.label}
                        label={stat.label}
                        value={stat.value}
                    />
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card level={1} className="h-full">
                    <CardHeader>
                        <CardTitle>{t('recentActivity')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-surface-500">{t('activityComingSoon')}</p>
                    </CardContent>
                </Card>

                <Card level={1} className="h-full">
                    <CardHeader>
                        <CardTitle>{t('systemHealth')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-green-500 shadow-glow-sm"></div>
                            <span className="text-sm font-medium text-surface-900">{t('allSystemsOperational')}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
