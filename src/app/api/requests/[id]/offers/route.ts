// GET /api/requests/[id]/offers - Get all offers for a request (client only)
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { NotFoundError, ForbiddenError } from '@/lib/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireClient();
    const { id: requestId } = await params;

    // Get client profile
    const client = await prisma.client.findUnique({
      where: { userId },
    });

    if (!client) {
      throw new NotFoundError('Client profile');
    }

    // Get request and verify ownership
    const requestData = await prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!requestData) {
      throw new NotFoundError('Request');
    }

    if (requestData.clientId !== client.id) {
      throw new ForbiddenError('You can only view offers for your own requests');
    }

    // Get all offers for this request
    const offers = await prisma.offer.findMany({
      where: { requestId },
      include: {
        professional: {
          select: {
            id: true,
            title: true,
            bio: true,
            yearsOfExperience: true,
            city: true,
            region: true,
            isAvailable: true,
            remoteAvailability: true,
            profileCompletion: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format offers
    const formattedOffers = offers.map((offer) => ({
      id: offer.id,
      message: offer.message,
      proposedPrice: offer.proposedPrice,
      estimatedDuration: offer.estimatedDuration,
      availableTimeSlots: offer.availableTimeSlots,
      status: offer.status,
      createdAt: offer.createdAt,
      professional: {
        id: offer.professional.id,
        title: offer.professional.title,
        bio: offer.professional.bio,
        yearsOfExperience: offer.professional.yearsOfExperience,
        city: offer.professional.city,
        region: offer.professional.region,
        isAvailable: offer.professional.isAvailable,
        remoteAvailability: offer.professional.remoteAvailability,
        profileCompletion: offer.professional.profileCompletion,
        user: {
          firstName: offer.professional.user.firstName,
          lastName: offer.professional.user.lastName,
          avatar: offer.professional.user.avatar,
        },
        services: offer.professional.services.map((service) => ({
          id: service.id,
          category: service.subcategory.category.nameEn,
          subcategory: service.subcategory.nameEn,
          priceFrom: service.priceFrom,
          priceTo: service.priceTo,
        })),
      },
    }));

    // Group by status
    const offersByStatus = {
      pending: formattedOffers.filter((o) => o.status === 'PENDING'),
      accepted: formattedOffers.filter((o) => o.status === 'ACCEPTED'),
      rejected: formattedOffers.filter((o) => o.status === 'REJECTED'),
      withdrawn: formattedOffers.filter((o) => o.status === 'WITHDRAWN'),
    };

    return successResponse({
      offers: formattedOffers,
      offersByStatus,
      totalCount: formattedOffers.length,
      pendingCount: offersByStatus.pending.length,
      acceptedCount: offersByStatus.accepted.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
