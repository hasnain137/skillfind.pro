// src/app/api/clicks/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { BadRequestError, NotFoundError } from '@/lib/errors';

const CLICK_FEE = 10; // €0.10 in cents

export async function POST(request: NextRequest) {
    try {
        const { userId } = await requireClient();
        const body = await request.json();
        const { offerId } = body;

        if (!offerId) {
            throw new BadRequestError('Offer ID is required');
        }

        // Get client profile
        const client = await prisma.client.findUnique({
            where: { userId },
        });

        if (!client) {
            throw new NotFoundError('Client profile');
        }

        // Get offer details
        const offer = await prisma.offer.findUnique({
            where: { id: offerId },
            include: {
                professional: {
                    include: {
                        wallet: true,
                    },
                },
            },
        });

        if (!offer) {
            throw new NotFoundError('Offer');
        }

        // Check if click already exists
        const existingClick = await prisma.clickEvent.findUnique({
            where: {
                offerId_clientId: {
                    offerId,
                    clientId: client.id,
                },
            },
        });

        if (existingClick) {
            // Already clicked, just return success
            return successResponse({ clicked: true, charged: false }, 'Click already recorded');
        }

        // Create click event and deduct balance in transaction
        await prisma.$transaction(async (tx) => {
            // 1. Create click event
            const clickEvent = await tx.clickEvent.create({
                data: {
                    offerId,
                    clientId: client.id,
                    professionalId: offer.professionalId,
                },
            });

            // 2. Deduct from wallet (allow negative for now to ensure UX)
            // Ensure wallet exists
            if (offer.professional.wallet) {
                await tx.wallet.update({
                    where: { id: offer.professional.wallet.id },
                    data: {
                        balance: { decrement: CLICK_FEE },
                        totalSpent: { increment: CLICK_FEE },
                    },
                });

                // 3. Create transaction record
                await tx.transaction.create({
                    data: {
                        walletId: offer.professional.wallet.id,
                        type: 'DEBIT',
                        amount: CLICK_FEE,
                        balanceBefore: offer.professional.wallet.balance,
                        balanceAfter: offer.professional.wallet.balance - CLICK_FEE,
                        description: 'Profile view fee',
                        clickEvent: {
                            connect: { id: clickEvent.id },
                        },
                    },
                });
            }

            // 4. Mark offer as viewed
            await tx.offer.update({
                where: { id: offerId },
                data: {
                    viewedByClient: true,
                    viewedAt: new Date(),
                    status: offer.status === 'PENDING' ? 'VIEWED' : offer.status,
                },
            });
        });

        return successResponse({ clicked: true, charged: true }, 'Click recorded successfully');
    } catch (error) {
        return handleApiError(error);
    }
}
