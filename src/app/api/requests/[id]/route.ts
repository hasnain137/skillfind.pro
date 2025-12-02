// GET /api/requests/[id] - View single request
// PUT /api/requests/[id] - Update request
// DELETE /api/requests/[id] - Delete request (soft delete to CANCELLED)
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireClient } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { updateRequestSchema } from '@/lib/validations/request';
import { NotFoundError, ForbiddenError, BadRequestError } from '@/lib/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, role } = await requireAuth();
    const { id } = await params;

    // Get request with all details
    const requestData = await prisma.request.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            nameEn: true,
            nameFr: true,
          },
        },
        subcategory: {
          select: {
            id: true,
            nameEn: true,
            nameFr: true,
          },
        },
        client: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                emailVerified: true,
                phoneVerified: true,
              },
            },
          },
        },
        offers: {
          where: role === 'CLIENT' ? {} : { 
            professional: { userId } 
          },
          include: {
            professional: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    avatar: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!requestData) {
      throw new NotFoundError('Request');
    }

    // Check access permissions
    if (role === 'CLIENT') {
      const client = await prisma.client.findUnique({
        where: { userId },
      });

      if (requestData.clientId !== client?.id) {
        throw new ForbiddenError('You can only view your own requests');
      }
    }

    // Format response based on role
    const response: any = {
      id: requestData.id,
      title: requestData.title,
      description: requestData.description,
      status: requestData.status,
      budgetMin: requestData.budgetMin,
      budgetMax: requestData.budgetMax,
      locationType: requestData.locationType,
      city: requestData.city,
      region: requestData.region,
      country: requestData.country,
      address: requestData.address,
      urgency: requestData.urgency,
      preferredStartDate: requestData.preferredStartDate,
      category: {
        id: requestData.category.id,
        name: requestData.category.nameEn,
      },
      subcategory: {
        id: requestData.subcategory.id,
        name: requestData.subcategory.nameEn,
      },
      createdAt: requestData.createdAt,
      updatedAt: requestData.updatedAt,
    };

    // Clients see all offers and client info
    if (role === 'CLIENT') {
      response.client = {
        firstName: requestData.client.user.firstName,
        lastName: requestData.client.user.lastName,
        city: requestData.client.city,
        avatar: requestData.client.user.avatar,
      };

      response.offers = requestData.offers.map((offer) => ({
        id: offer.id,
        message: offer.message,
        proposedPrice: offer.proposedPrice,
        estimatedDuration: offer.estimatedDuration,
        availableTimeSlots: offer.availableTimeSlots,
        status: offer.status,
        professional: {
          id: offer.professional.id,
          title: offer.professional.title,
          city: offer.professional.city,
          user: {
            firstName: offer.professional.user.firstName,
            lastName: offer.professional.user.lastName,
            avatar: offer.professional.user.avatar,
          },
        },
        createdAt: offer.createdAt,
      }));

      response.offerCount = requestData.offers.length;
    }

    // Professionals see limited info
    if (role === 'PROFESSIONAL') {
      response.client = {
        city: requestData.client.city,
        // Don't show name or contact until offer accepted
      };

      // Show only their own offers
      response.myOffers = requestData.offers;
      response.hasOffered = requestData.offers.length > 0;
    }

    return successResponse({ request: response });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
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
    });

    if (!existingRequest) {
      throw new NotFoundError('Request');
    }

    // Verify ownership
    if (existingRequest.clientId !== client.id) {
      throw new ForbiddenError('You can only update your own requests');
    }

    // Cannot update closed or cancelled requests
    if (existingRequest.status !== 'OPEN') {
      throw new BadRequestError('Cannot update a closed or cancelled request');
    }

    // Parse and validate request body
    const body = await request.json();
    const data = updateRequestSchema.parse(body);

    // Update request
    const updatedRequest = await prisma.request.update({
      where: { id },
      data,
      include: {
        category: true,
        subcategory: true,
      },
    });

    return successResponse(
      {
        request: {
          id: updatedRequest.id,
          title: updatedRequest.title,
          description: updatedRequest.description,
          budgetMin: updatedRequest.budgetMin,
          budgetMax: updatedRequest.budgetMax,
          locationType: updatedRequest.locationType,
          city: updatedRequest.city,
          region: updatedRequest.region,
          country: updatedRequest.country,
          address: updatedRequest.address,
          urgency: updatedRequest.urgency,
          preferredStartDate: updatedRequest.preferredStartDate,
          updatedAt: updatedRequest.updatedAt,
        },
      },
      'Request updated successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
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
    });

    if (!existingRequest) {
      throw new NotFoundError('Request');
    }

    // Verify ownership
    if (existingRequest.clientId !== client.id) {
      throw new ForbiddenError('You can only delete your own requests');
    }

    // Soft delete - mark as cancelled
    await prisma.request.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return successResponse(
      { message: 'Request cancelled successfully' },
      'Request cancelled successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
