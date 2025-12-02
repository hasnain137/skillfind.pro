// POST /api/offers/[id]/click - Record click and charge professional (client only)
import { NextRequest } from 'next/server';
import { requireClient } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { recordClickAndCharge } from '@/lib/services/click-billing';
import { NotFoundError, ForbiddenError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireClient();
    const { id: offerId } = await params;

    // Get client profile
    const client = await prisma.client.findUnique({
      where: { userId },
    });

    if (!client) {
      throw new NotFoundError('Client profile');
    }

    // Get offer and verify access
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        request: true,
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

    // Verify the client owns this request
    if (offer.request.clientId !== client.id) {
      throw new ForbiddenError('You can only view offers on your own requests');
    }

    // Record click and charge
    const clickEvent = await recordClickAndCharge({
      offerId: offer.id,
      clientId: client.id,
      clickType: 'OFFER_VIEW',
    });

    return successResponse(
      {
        click: {
          id: clickEvent.id,
          clickedAt: clickEvent.clickedAt,
        },
        professional: {
          newBalance: offer.professional.wallet?.balance || 0,
        },
        message: 'Click recorded. Professional has been charged for the click',
      },
      'Click recorded successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
