// POST /api/offers/[id]/accept - Accept an offer (client only)
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { NotFoundError, ForbiddenError, BadRequestError } from '@/lib/errors';
import { notifyOfferAccepted } from '@/lib/services/notifications';

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
      include: {
        user: true,
      },
    });

    if (!client) {
      throw new NotFoundError('Client profile');
    }

    // Get the offer
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        request: true,
        professional: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!offer) {
      throw new NotFoundError('Offer');
    }

    // Verify request ownership
    if (offer.request.clientId !== client.id) {
      throw new ForbiddenError('You can only accept offers on your own requests');
    }

    // Check if offer is still pending
    if (offer.status !== 'PENDING') {
      throw new BadRequestError('This offer is no longer available');
    }

    // Check if request is still open
    if (offer.request.status !== 'OPEN') {
      throw new BadRequestError('This request is no longer accepting offers');
    }

    // Check if professional is active
    if (offer.professional.status !== 'ACTIVE') {
      throw new BadRequestError('This professional is no longer active on the platform');
    }

    // Accept offer and create job in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update offer status
      const acceptedOffer = await tx.offer.update({
        where: { id: offerId },
        data: { status: 'ACCEPTED' },
      });

      // Reject all other pending offers for this request
      await tx.offer.updateMany({
        where: {
          requestId: offer.requestId,
          id: { not: offerId },
          status: 'PENDING',
        },
        data: { status: 'REJECTED' },
      });

      // Update the request to IN_PROGRESS
      await tx.request.update({
        where: { id: offer.requestId },
        data: {
          status: 'IN_PROGRESS',
          closedAt: new Date(),
        },
      });

      // Create job
      const job = await tx.job.create({
        data: {
          requestId: offer.requestId,
          clientId: client.id,
          professionalId: offer.professionalId,
          agreedPrice: offer.proposedPrice,
          status: 'IN_PROGRESS',
          startedAt: new Date(),
        },
      });

      return { acceptedOffer, job };
    });

    // Notify professional that their offer was accepted (don't block response)
    const clientName = `${client.user.firstName} ${client.user.lastName}`.trim() || 'A client';
    notifyOfferAccepted(
      offer.professional.user.id,
      clientName,
      offer.request.title,
      result.job.id
    ).catch(err => console.error('Failed to send notification:', err));

    // Phone numbers are now revealed (both parties can see)
    return successResponse(
      {
        offer: {
          id: result.acceptedOffer.id,
          status: result.acceptedOffer.status,
        },
        job: {
          id: result.job.id,
          status: result.job.status,
          agreedPrice: result.job.agreedPrice,
        },
        contactInfo: {
          professional: {
            firstName: offer.professional.user.firstName,
            lastName: offer.professional.user.lastName,
            email: offer.professional.user.email,
            phoneNumber: offer.professional.user.phoneNumber,
          },
          client: {
            firstName: client.user.firstName,
            lastName: client.user.lastName,
            email: client.user.email,
            phoneNumber: client.user.phoneNumber,
          },
        },
        message: 'Offer accepted successfully! Contact information has been exchanged.',
      },
      'Offer accepted successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

