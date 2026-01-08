// POST /api/requests/[id]/close - Close a request
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { closeRequestSchema } from '@/lib/validations/request';
import { NotFoundError, ForbiddenError, BadRequestError } from '@/lib/errors';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireClient();
    const { id } = await params;

    // Get client profile
    const client = await prisma.client.findUnique({
      where: { userId },
    });

    if (!client) {
      throw new NotFoundError('Client profile');
    }

    // Get existing request
    const existingRequest = await prisma.request.findUnique({
      where: { id },
      include: {
        offers: true,
      },
    });

    if (!existingRequest) {
      throw new NotFoundError('Request');
    }

    // Verify ownership
    if (existingRequest.clientId !== client.id) {
      throw new ForbiddenError('You can only close your own requests');
    }

    // Check if already closed/cancelled
    if (existingRequest.status === 'CANCELLED') {
      throw new BadRequestError('Request is already closed');
    }

    if (existingRequest.status === 'COMPLETED') {
      throw new BadRequestError('Cannot close a completed request');
    }

    // Parse optional feedback
    const body = await request.json().catch(() => ({}));
    const data = closeRequestSchema.parse(body);

    // Close the request (set to CANCELLED status)
    const closedRequest = await prisma.request.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        closedAt: new Date(),
      },
    });

    // Reject all pending offers
    await prisma.offer.updateMany({
      where: {
        requestId: id,
        status: 'PENDING',
      },
      data: {
        status: 'REJECTED',
      },
    });

    return successResponse(
      {
        request: {
          id: closedRequest.id,
          status: closedRequest.status,
          closedAt: closedRequest.closedAt,
        },
        rejectedOffersCount: existingRequest.offers.filter(
          (o) => o.status === 'PENDING'
        ).length,
      },
      'Request closed successfully. All pending offers have been rejected.'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
