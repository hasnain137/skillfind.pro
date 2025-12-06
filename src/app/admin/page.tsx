// src/app/admin/page.tsx
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { StatCard } from '@/components/ui/StatCard';

export default async function AdminDashboardPage() {
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
        { label: 'Total Users', value: totalUsers },
        { label: 'Professionals', value: totalProfessionals },
        { label: 'Clients', value: totalClients },
        { label: 'Pending Verifications', value: pendingVerifications },
        { label: 'Total Revenue', value: `€${revenueEuros.toFixed(2)}` },
    ];

    return (
        <div className="space-y-6">
            <SectionHeading
                eyebrow="Admin Dashboard"
                title="Platform Overview"
                description="High-level metrics and platform health."
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
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-surface-500">Activity logs coming soon...</p>
                    </CardContent>
                </Card>

                <Card level={1} className="h-full">
                    <CardHeader>
                        <CardTitle>System Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-green-500 shadow-glow-sm"></div>
                            <span className="text-sm font-medium text-surface-900">All Systems Operational</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
