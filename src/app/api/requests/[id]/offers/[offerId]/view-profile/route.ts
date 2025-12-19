// POST /api/requests/[id]/offers/[offerId]/view-profile
// Track when client views professional profile from an offer (for click billing)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { NotFoundError, ForbiddenError, InsufficientBalanceError } from '@/lib/errors';
import { recordClickAndCharge } from '@/lib/services/click-billing';
import { notifyClickCharge, notifyLowBalance } from '@/lib/services/notifications';

interface RouteParams {
  params: Promise<{
    id: string;
    offerId: string;
  }>;
}

export async function POST(request: NextRequest, context: RouteParams) {
  try {
    const { userId } = await requireClient();
    const { id: requestId, offerId } = await context.params;

    // Validate IDs
    if (!requestId || !offerId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid parameters',
          message: 'Request ID and Offer ID must be provided',
        },
        { status: 400 }
      );
    }

    // Get client profile
    const client = await prisma.client.findUnique({
      where: { userId },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    if (!client) {
      throw new NotFoundError('Client profile');
    }

    // Get request and verify ownership
    const serviceRequest = await prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!serviceRequest) {
      throw new NotFoundError('Request');
    }

    if (serviceRequest.clientId !== client.id) {
      throw new ForbiddenError('You can only view offers on your own requests');
    }

    // Get offer and verify it belongs to this request
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        professional: {
          include: {
            user: true,
            wallet: true,
          },
        },
      },
    });

    if (!offer) {
      throw new NotFoundError('Offer');
    }

    if (offer.requestId !== requestId) {
      throw new ForbiddenError('Offer does not belong to this request');
    }

    // Check if already clicked today (prevent duplicate charges)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingClick = await prisma.clickEvent.findFirst({
      where: {
        offerId: offerId,
        professionalId: offer.professionalId,
        clickedAt: {
          gte: today,
        },
      },
    });

    if (existingClick) {
      // Already tracked today, just return success
      return successResponse(
        {
          professional: {
            id: offer.professional.id,
            title: offer.professional.title,
            bio: offer.professional.bio,
            yearsOfExperience: offer.professional.yearsOfExperience,
            city: offer.professional.city,
            averageRating: offer.professional.averageRating,
            totalReviews: offer.professional.totalReviews,
            user: {
              firstName: offer.professional.user.firstName,
              lastName: offer.professional.user.lastName,
              avatar: offer.professional.user.avatar,
            },
          },
          clickTracked: false,
          message: 'Profile view already tracked today',
        },
        'Professional profile retrieved'
      );
    }

    // Process click charge
    try {
      const clientName = client.user
        ? `${client.user.firstName || 'A client'} ${client.user.lastName || ''}`.trim()
        : 'A client';

      await recordClickAndCharge({
        offerId: offerId,
        clientId: client.id,
        clickType: 'PROFILE_VIEW',
        clientName,
      });

      // Check balance (optional optimization: recordClickAndCharge could return this, but querying is fine)
      const updatedWallet = await prisma.wallet.findUnique({
        where: { professionalId: offer.professionalId },
        select: { balance: true },
      });
      const newBalance = updatedWallet?.balance ?? 0;

      // If balance is low (below €2), send low balance warning
      if (newBalance < 200) {
        await notifyLowBalance(offer.professional.userId, newBalance);
      }

      return successResponse(
        {
          professional: {
            id: offer.professional.id,
            title: offer.professional.title,
            bio: offer.professional.bio,
            yearsOfExperience: offer.professional.yearsOfExperience,
            city: offer.professional.city,
            region: offer.professional.region,
            isAvailable: offer.professional.isAvailable,
            remoteAvailability: offer.professional.remoteAvailability,
            averageRating: offer.professional.averageRating,
            totalReviews: offer.professional.totalReviews,
            profileCompletion: offer.professional.profileCompletion,
            user: {
              firstName: offer.professional.user.firstName,
              lastName: offer.professional.user.lastName,
              avatar: offer.professional.user.avatar,
            },
          },
          clickTracked: true,
          message: 'Click charge applied successfully',
        },
        'Professional profile retrieved'
      );
    } catch (error) {
      // If click charge fails due to insufficient balance, still show profile but notify
      if (error instanceof InsufficientBalanceError) {
        return successResponse(
          {
            professional: {
              id: offer.professional.id,
              title: offer.professional.title,
              bio: offer.professional.bio,
              yearsOfExperience: offer.professional.yearsOfExperience,
              city: offer.professional.city,
              averageRating: offer.professional.averageRating,
              totalReviews: offer.professional.totalReviews,
              user: {
                firstName: offer.professional.user.firstName,
                lastName: offer.professional.user.lastName,
                avatar: offer.professional.user.avatar,
              },
            },
            clickTracked: false,
            warning: 'Professional has insufficient wallet balance for click charges',
          },
          'Professional profile retrieved (click not charged due to low balance)'
        );
      }
      throw error;
    }
  } catch (error) {
    return handleApiError(error);
  }
}
