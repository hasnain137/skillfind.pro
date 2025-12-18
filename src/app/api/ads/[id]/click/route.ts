// POST /api/ads/[id]/click - Record ad click
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError } from '@/lib/api-response';
import { auth } from '@clerk/nextjs/server';
import { NotFoundError } from '@/lib/errors';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { userId } = await auth();

        // Get campaign
        const campaign = await prisma.adCampaign.findUnique({
            where: { id },
        });

        if (!campaign) {
            throw new NotFoundError('Ad campaign');
        }

        // Record click
        const headers = request.headers;
        const ipAddress = headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown';
        const userAgent = headers.get('user-agent') || undefined;
        const referrer = headers.get('referer') || undefined;

        await prisma.$transaction(async (tx) => {
            // Create click record
            await tx.adClick.create({
                data: {
                    campaignId: id,
                    userId: userId || undefined,
                    ipAddress,
                    userAgent,
                    referrer,
                },
            });

            // Update campaign stats and spent
            await tx.adCampaign.update({
                where: { id },
                data: {
                    clicks: { increment: 1 },
                    spentCents: { increment: campaign.costPerClick },
                },
            });

            // Check if budget exhausted
            const updated = await tx.adCampaign.findUnique({ where: { id } });
            if (updated && updated.budgetCents > 0 && updated.spentCents >= updated.budgetCents) {
                await tx.adCampaign.update({
                    where: { id },
                    data: { status: 'COMPLETED' },
                });
            }
        });

        return successResponse({
            clicked: true,
            redirectUrl: campaign.linkUrl,
        });
    } catch (error) {
        return handleApiError(error);
    }
}
