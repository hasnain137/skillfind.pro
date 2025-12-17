import { prisma } from '@/lib/prisma';
import { handleApiError, successResponse, unauthorizedResponse, notFoundResponse, forbiddenResponse, errorResponse } from '@/lib/api-utils';
import { auth } from '@clerk/nextjs/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        request: true,
        professional: {
          include: {
            user: true,
            profile: true,
          },
        },
      },
    });

    if (!offer) {
      return notFoundResponse('Offer not found');
    }

    const client = await prisma.client.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!client) {
      return forbiddenResponse('Only clients can accept offers');
    }

    if (offer.request.clientId !== client.id) {
      return forbiddenResponse('You can only accept offers for your own requests');
    }

    if (offer.request.status !== 'OPEN') {
      return errorResponse('Request is not open for new offers', 400);
    }

    if (offer.status !== 'PENDING' && offer.status !== 'VIEWED') {
      return errorResponse('This offer is no longer available', 400);
    }

    // Use a transaction to update status and create job
    const result = await prisma.$transaction(async (tx) => {
      // 1. Mark this offer as accepted
      const acceptedOffer = await tx.offer.update({
        where: { id: offer.id },
        data: { status: 'ACCEPTED' },
      });

      // 2. Mark other offers as rejected (optional rule, but good for single-hire jobs)
      // await tx.offer.updateMany({
      //   where: { requestId: offer.requestId, id: { not: offer.id } },
      //   data: { status: 'REJECTED' },
      // });

      // 3. Update request status
      // Note: We keep it 'OPEN' if multiple hires are allowed, but usually 'IN_PROGRESS'
      await tx.request.update({
        where: { id: offer.requestId },
        data: { status: 'IN_PROGRESS' },
      });

      // 4. Create the Job
      const job = await tx.job.create({
        data: {
          requestId: offer.requestId,
          clientId: client.id,
          professionalId: offer.professionalId,
          agreedPrice: offer.proposedPrice,
          status: 'ACCEPTED', // Initial status
        },
      });

      return { acceptedOffer, job };
    });

    // Return contact info in response so frontend can show a modal/toast
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
