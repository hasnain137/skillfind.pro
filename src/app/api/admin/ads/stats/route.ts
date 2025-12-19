// GET /api/admin/ads/stats - Get click statistics for ads
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
    try {
        await requireAdmin();

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '7', 10);

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Previous period for comparison
        const previousStartDate = new Date(startDate);
        previousStartDate.setDate(previousStartDate.getDate() - days);

        // Get daily clicks for the period
        const clicks = await prisma.adClick.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                createdAt: true,
            },
        });

        // Group by date
        const dailyStats: Record<string, { clicks: number; impressions: number }> = {};

        // Initialize all days
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            dailyStats[dateStr] = { clicks: 0, impressions: 0 };
        }

        // Count clicks per day
        clicks.forEach(click => {
            const dateStr = click.createdAt.toISOString().split('T')[0];
            if (dailyStats[dateStr]) {
                dailyStats[dateStr].clicks++;
            }
        });

        // Get total impressions (from campaigns)
        const totalImpressions = await prisma.adCampaign.aggregate({
            _sum: { impressions: true },
        });

        // Get previous period clicks for comparison
        const previousClicks = await prisma.adClick.count({
            where: {
                createdAt: {
                    gte: previousStartDate,
                    lt: startDate,
                },
            },
        });

        const daily = Object.entries(dailyStats)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, stats]) => ({
                date,
                clicks: stats.clicks,
                impressions: stats.impressions,
            }));

        return successResponse({
            daily,
            totalClicks: clicks.length,
            totalImpressions: totalImpressions._sum.impressions || 0,
            previousPeriodClicks: previousClicks,
            period: {
                start: startDate.toISOString(),
                end: endDate.toISOString(),
            },
        });
    } catch (error) {
        return handleApiError(error);
    }
}
