// GET /api/offers/[id] - View single offer
// PUT /api/offers/[id] - Update offer (professional only)
// DELETE /api/offers/[id] - Withdraw offer (professional only)
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireProfessional } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { updateOfferSchema } from '@/lib/validations/offer';
import { NotFoundError, ForbiddenError, BadRequestError } from '@/lib/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, role } = await requireAuth();
    const { id } = await params;

    // Get offer
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        request: {
          include: {
            category: true,
            subcategory: true,
            client: {
              include: {
                user: true,
              },
            },
          },
        },
        professional: {
          include: {
            user: true,
            services: {
              include: {
                subcategory: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!offer) {
      throw new NotFoundError('Offer');
    }

    // Check access permissions
    if (role === 'PROFESSIONAL') {
      const professional = await prisma.professional.findUnique({
        where: { userId },
      });

      if (offer.professionalId !== professional?.id) {
        throw new ForbiddenError('You can only view your own offers');
      }
    } else if (role === 'CLIENT') {
      const client = await prisma.client.findUnique({
        where: { userId },
      });

      if (offer.request.clientId !== client?.id) {
        throw new ForbiddenError('You can only view offers on your own requests');
      }
    }

    // Format response
    const response = {
      id: offer.id,
      message: offer.message,
      proposedPrice: offer.proposedPrice,
      estimatedDuration: offer.estimatedDuration,
      availableTimeSlots: offer.availableTimeSlots,
      status: offer.status,
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
      request: {
        id: offer.request.id,
        title: offer.request.title,
        description: offer.request.description,
        status: offer.request.status,
        budgetMin: offer.request.budgetMin,
        budgetMax: offer.request.budgetMax,
        city: offer.request.city,
        locationType: offer.request.locationType,
        category: offer.request.category.nameEn,
        subcategory: offer.request.subcategory.nameEn,
      },
      professional: {
        id: offer.professional.id,
        title: offer.professional.title,
        bio: offer.professional.bio,
        yearsOfExperience: offer.professional.yearsOfExperience,
        city: offer.professional.city,
        region: offer.professional.region,
        isAvailable: offer.professional.isAvailable,
        remoteAvailability: offer.professional.remoteAvailability,
        user: {
          firstName: offer.professional.user.firstName,
          lastName: offer.professional.user.lastName,
          avatar: offer.professional.user.avatar,
        },
        services: offer.professional.services,
      },
    };

    // Add client info if user is professional or offer is accepted
    if (role === 'PROFESSIONAL' || offer.status === 'ACCEPTED') {
      response.request = {
        ...response.request,
        client: {
          firstName: offer.request.client.user.firstName,
          lastName: offer.request.client.user.lastName,
          city: offer.request.client.city,
          phoneNumber: offer.status === 'ACCEPTED' ? offer.request.client.user.phoneNumber : undefined,
          email: offer.status === 'ACCEPTED' ? offer.request.client.user.email : undefined,
        },
      } as any;
    }

    return successResponse({ offer: response });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireProfessional();
    const { id } = await params;

    // Get professional profile
    const professional = await prisma.professional.findUnique({
      where: { userId },
    });

    if (!professional) {
      throw new NotFoundError('Professional profile');
    }

    // Get existing offer
    const existingOffer = await prisma.offer.findUnique({
      where: { id },
      include: {
        request: true,
      },
    });

    if (!existingOffer) {
      throw new NotFoundError('Offer');
    }

    // Verify ownership
    if (existingOffer.professionalId !== professional.id) {
      throw new ForbiddenError('You can only update your own offers');
    }

    // Can only update pending offers
    if (existingOffer.status !== 'PENDING') {
      throw new BadRequestError('Can only update pending offers');
    }

    // Check if request is still open
    if (existingOffer.request.status !== 'OPEN') {
      throw new BadRequestError('The request is no longer accepting updates');
    }

    // Parse and validate request body
    const body = await request.json();
    const data = updateOfferSchema.parse(body);

    // Update offer
    const updatedOffer = await prisma.offer.update({
      where: { id },
      data,
    });

    return successResponse(
      {
        offer: {
          id: updatedOffer.id,
          message: updatedOffer.message,
          proposedPrice: updatedOffer.proposedPrice,
          estimatedDuration: updatedOffer.estimatedDuration,
          availableTimeSlots: updatedOffer.availableTimeSlots,
          updatedAt: updatedOffer.updatedAt,
        },
      },
      'Offer updated successfully'
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
    const { userId } = await requireProfessional();
    const { id } = await params;

    // Get professional profile
    const professional = await prisma.professional.findUnique({
      where: { userId },
    });

    if (!professional) {
      throw new NotFoundError('Professional profile');
    }

    // Get existing offer
    const existingOffer = await prisma.offer.findUnique({
      where: { id },
    });

    if (!existingOffer) {
      throw new NotFoundError('Offer');
    }

    // Verify ownership
    if (existingOffer.professionalId !== professional.id) {
      throw new ForbiddenError('You can only withdraw your own offers');
    }

    // Can only withdraw pending offers
    if (existingOffer.status !== 'PENDING') {
      throw new BadRequestError('Can only withdraw pending offers');
    }

    // Withdraw offer (mark as WITHDRAWN)
    await prisma.offer.update({
      where: { id },
      data: { status: 'WITHDRAWN' },
    });

    return successResponse(
      { message: 'Offer withdrawn successfully' },
      'Offer withdrawn successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
