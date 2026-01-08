// GET /api/admin/ads/[id] - Get single campaign
// PATCH /api/admin/ads/[id] - Update campaign
// DELETE /api/admin/ads/[id] - Delete campaign
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { z } from 'zod';
import { NotFoundError } from '@/lib/errors';

const updateAdSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    imageUrl: z.string().url().optional().nullable(),
    linkUrl: z.string().url().optional().nullable(),
    categoryId: z.string().optional().nullable(),
    targetCity: z.string().optional().nullable(),
    targetRegion: z.string().optional().nullable(),
    targetCountry: z.string().optional().nullable(),
    budgetCents: z.number().int().min(0).optional(),
    costPerClick: z.number().int().min(1).optional(),
    startDate: z.string().transform(s => new Date(s)).optional(),
    endDate: z.string().transform(s => new Date(s)).optional(),
    status: z.enum(['DRAFT', 'PENDING_PAYMENT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']).optional(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();
        const { id } = await params;

        const campaign = await prisma.adCampaign.findUnique({
            where: { id },
            include: {
                category: true,
                adClicks: {
                    orderBy: { clickedAt: 'desc' },
                    take: 100,
                },
            },
        });

        if (!campaign) {
            throw new NotFoundError('Ad campaign');
        }

        // Calculate daily stats
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);

        const dailyClicks = await prisma.adClick.groupBy({
            by: ['clickedAt'],
            where: {
                campaignId: id,
                clickedAt: { gte: last7Days },
            },
            _count: { id: true },
        });

        return successResponse({
            campaign: {
                ...campaign,
                budgetEuros: campaign.budgetCents / 100,
                spentEuros: campaign.spentCents / 100,
                remainingBudget: (campaign.budgetCents - campaign.spentCents) / 100,
                ctr: campaign.impressions > 0
                    ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2) + '%'
                    : '0%',
            },
            stats: {
                dailyClicks,
            },
        });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();
        const { id } = await params;

        const body = await request.json();
        const data = updateAdSchema.parse(body);

        // Check if campaign exists
        const existing = await prisma.adCampaign.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundError('Ad campaign');
        }

        const campaign = await prisma.adCampaign.update({
            where: { id },
            data,
            include: {
                category: {
                    select: { id: true, nameEn: true },
                },
            },
        });

        return successResponse({ campaign }, 'Campaign updated successfully');
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();
        const { id } = await params;

        // Check if campaign exists
        const existing = await prisma.adCampaign.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundError('Ad campaign');
        }

        await prisma.adCampaign.delete({ where: { id } });

        return successResponse({ message: 'Campaign deleted' }, 'Campaign deleted successfully');
    } catch (error) {
        return handleApiError(error);
    }
}
