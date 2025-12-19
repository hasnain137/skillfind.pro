// GET /api/ads/active - Get active ads for display (public)
// POST /api/ads/[id]/click - Record ad click
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError } from '@/lib/api-response';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get('categoryId');
        const city = searchParams.get('city');
        const limit = parseInt(searchParams.get('limit') || '3', 10);

        const now = new Date();

        // Note: Advanced targeting with budget checks can be implemented 
        // using Prisma fieldReference in future versions
        // For now, we filter by basic criteria in the query below

        const ads = await prisma.adCampaign.findMany({
            where: {
                status: 'ACTIVE',
                startDate: { lte: now },
                endDate: { gte: now },
            },
            select: {
                id: true,
                name: true,
                description: true,
                imageUrl: true,
                linkUrl: true,
                category: {
                    select: { nameEn: true, slug: true },
                },
            },
            take: limit,
            orderBy: { createdAt: 'desc' },
        });

        // Record impressions (async, don't block response)
        if (ads.length > 0) {
            prisma.adCampaign.updateMany({
                where: { id: { in: ads.map(a => a.id) } },
                data: { impressions: { increment: 1 } },
            }).catch(console.error);
        }

        return successResponse({ ads });
    } catch (error) {
        return handleApiError(error);
    }
}
