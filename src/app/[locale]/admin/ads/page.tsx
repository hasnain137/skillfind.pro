import { prisma } from '@/lib/prisma';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Link } from '@/i18n/routing';
import { AdCampaignsList } from '@/components/admin/AdCampaignsList';
import { AdClickStatsChart } from '@/components/admin/AdClickStatsChart';

export default async function AdminAdsPage() {
    // Get summary stats
    const [totalCampaigns, activeCampaigns, totalClicks, totalSpent] = await Promise.all([
        prisma.adCampaign.count(),
        prisma.adCampaign.count({ where: { status: 'ACTIVE' } }),
        prisma.adClick.count(),
        prisma.adCampaign.aggregate({ _sum: { spentCents: true } }),
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <SectionHeading
                    eyebrow="Monetization"
                    title="Advertisement Campaigns"
                    description="Create and manage advertising campaigns with targeting and budget controls."
                />
                <Link
                    href="/admin/ads/new"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                    + New Campaign
                </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-4">
                <Card level={1} className="p-4 text-center">
                    <p className="text-2xl font-bold text-[#333333]">{totalCampaigns}</p>
                    <p className="text-xs text-[#7C7373]">Total Campaigns</p>
                </Card>
                <Card level={1} className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{activeCampaigns}</p>
                    <p className="text-xs text-[#7C7373]">Active</p>
                </Card>
                <Card level={1} className="p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{totalClicks}</p>
                    <p className="text-xs text-[#7C7373]">Total Clicks</p>
                </Card>
                <Card level={1} className="p-4 text-center">
                    <p className="text-2xl font-bold text-[#333333]">€{((totalSpent._sum.spentCents || 0) / 100).toFixed(2)}</p>
                    <p className="text-xs text-[#7C7373]">Revenue</p>
                </Card>
            </div>

            {/* Click Statistics Chart */}
            <AdClickStatsChart days={7} />

            <AdCampaignsList />
        </div>
    );
}

