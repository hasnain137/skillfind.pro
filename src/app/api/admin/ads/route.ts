// GET /api/admin/ads - List all ad campaigns
// POST /api/admin/ads - Create new ad campaign
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, handleApiError, createdResponse } from '@/lib/api-response';
import { z } from 'zod';

const createAdSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    imageUrl: z.string().url().optional().nullable(),
    linkUrl: z.string().url().optional().nullable(),
    categoryId: z.string().optional().nullable(),
    targetCity: z.string().optional().nullable(),
    targetRegion: z.string().optional().nullable(),
    targetCountry: z.string().optional().nullable(),
    budgetCents: z.number().int().min(0).default(0),
    costPerClick: z.number().int().min(1).default(10),
    startDate: z.string().transform(s => new Date(s)),
    endDate: z.string().transform(s => new Date(s)),
    status: z.enum(['DRAFT', 'PENDING_PAYMENT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']).default('DRAFT'),
});

export async function GET(request: NextRequest) {
    try {
        await requireAdmin();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '20', 10);

        const whereClause: any = {};
        if (status) {
            whereClause.status = status;
        }

        const [campaigns, total] = await Promise.all([
            prisma.adCampaign.findMany({
                where: whereClause,
                include: {
                    category: {
                        select: { id: true, nameEn: true, slug: true },
                    },
                    _count: {
                        select: { adClicks: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.adCampaign.count({ where: whereClause }),
        ]);

        return successResponse(
            {
                campaigns: campaigns.map(c => ({
                    ...c,
                    budgetEuros: c.budgetCents / 100,
                    spentEuros: c.spentCents / 100,
                    clickCount: c._count.adClicks,
                    ctr: c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(2) + '%' : '0%',
                })),
            },
            undefined,
            { page, limit, total, totalPages: Math.ceil(total / limit) }
        );
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await requireAdmin();

        const body = await request.json();
        const data = createAdSchema.parse(body);

        const campaign = await prisma.adCampaign.create({
            data: {
                name: data.name,
                description: data.description,
                imageUrl: data.imageUrl,
                linkUrl: data.linkUrl,
                categoryId: data.categoryId,
                targetCity: data.targetCity,
                targetRegion: data.targetRegion,
                targetCountry: data.targetCountry,
                budgetCents: data.budgetCents,
                costPerClick: data.costPerClick,
                startDate: data.startDate,
                endDate: data.endDate,
                status: data.status,
                createdBy: userId,
            },
            include: {
                category: {
                    select: { id: true, nameEn: true },
                },
            },
        });

        return createdResponse({ campaign }, 'Ad campaign created successfully');
    } catch (error) {
        return handleApiError(error);
    }
}
