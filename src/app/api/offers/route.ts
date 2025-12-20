// GET /api/offers - List offers (role-based)
// POST /api/offers - Create new offer (professional only)
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireProfessional } from '@/lib/auth';
import { successResponse, handleApiError, createdResponse } from '@/lib/api-response';
import { createOfferSchema, listOffersSchema } from '@/lib/validations/offer';
import { NotFoundError, BadRequestError, LimitExceededError, ForbiddenError } from '@/lib/errors';
import { notifyNewOffer } from '@/lib/services/notifications';
import { getOrCreateWallet, getMinimumWalletBalance } from '@/lib/services/wallet';



export async function GET(request: NextRequest) {
  try {
    const { userId, role } = await requireAuth();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      requestId: searchParams.get('requestId') || undefined,
      status: searchParams.get('status') || undefined,
    };

    console.log('[Offers API] Parsing params:', params);

    try {
      var filters = listOffersSchema.parse(params);
    } catch (error: any) {
      console.error('[Offers API] Validation error:', error.errors);
      throw error;
    }

    // Build where clause based on role
    let whereClause: any = {};

    if (role === 'PROFESSIONAL') {
      // Professionals see only their own offers
      const professional = await prisma.professional.findUnique({
        where: { userId },
      });

      if (!professional) {
        throw new NotFoundError('Professional profile');
      }

      whereClause.professionalId = professional.id;
    } else if (role === 'CLIENT') {
      // Clients see offers on their requests
      const client = await prisma.client.findUnique({
        where: { userId },
      });

      if (!client) {
        throw new NotFoundError('Client profile');
      }

      whereClause.request = {
        clientId: client.id,
      };
    }

    // Apply filters
    if (filters.requestId) {
      whereClause.requestId = filters.requestId;
    }

    if (filters.status) {
      whereClause.status = filters.status;
    }

    // Get total count
    const total = await prisma.offer.count({ where: whereClause });

    // Get offers
    const offers = await prisma.offer.findMany({
      where: whereClause,
      include: {
        request: {
          include: {
            category: {
              select: {
                id: true,
                nameEn: true,
              },
            },
            subcategory: {
              select: {
                id: true,
                nameEn: true,
              },
            },
            client: role === 'PROFESSIONAL' ? {
              select: {
                city: true,
                region: true,
                country: true,
              },
            } : undefined,
          },
        },
        professional: role === 'CLIENT' ? {
          include: {
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
        } : undefined,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    });

    // Format response based on role
    const formattedOffers = offers.map((offer) => {
      const base = {
        id: offer.id,
        message: offer.message,
        proposedPrice: offer.proposedPrice,
        estimatedDuration: offer.estimatedDuration,
        availableTimeSlots: offer.availableTimeSlots,
        status: offer.status,
        createdAt: offer.createdAt,
        updatedAt: offer.updatedAt,
      };

      if (role === 'PROFESSIONAL') {
        return {
          ...base,
          request: {
            id: offer.request.id,
            title: offer.request.title,
            description: offer.request.description,
            status: offer.request.status,
            budgetMin: offer.request.budgetMin,
            budgetMax: offer.request.budgetMax,
            locationType: offer.request.locationType,
            city: offer.request.city,
            category: offer.request.category,
            subcategory: offer.request.subcategory,
            client: {
              city: offer.request.client?.city,
              region: offer.request.client?.region,
              country: offer.request.client?.country,
            },
          },
        };
      } else {
        // CLIENT role - professional includes user and services
        return {
          ...base,
          request: {
            id: offer.request.id,
            title: offer.request.title,
          },
          professional: offer.professional ? {
            id: offer.professional.id,
            title: offer.professional.title,
            bio: offer.professional.bio,
            yearsOfExperience: offer.professional.yearsOfExperience,
            city: offer.professional.city,
            region: offer.professional.region,
            profileCompletion: offer.professional.profileCompletion,
            user: (offer.professional as any).user ? {
              firstName: (offer.professional as any).user.firstName,
              lastName: (offer.professional as any).user.lastName,
              avatar: (offer.professional as any).user.avatar,
            } : undefined,
            services: (offer.professional as any).services || [],
          } : undefined,
        };
      }
    });

    return successResponse(
      { offers: formattedOffers },
      undefined,
      {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireProfessional();

    // Get professional profile
    const professional = await prisma.professional.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });

    if (!professional) {
      throw new NotFoundError('Professional profile');
    }

    // Check if professional is active
    if (professional.status !== 'ACTIVE') {
      throw new ForbiddenError('Your account is not active. Please complete verification or contact support.');
    }

    // Check wallet balance (min required balance from settings to send offers)
    const wallet = await getOrCreateWallet(professional.id);
    const minBalance = await getMinimumWalletBalance();

    if (wallet.balance < minBalance) {
      throw new ForbiddenError(
        `Insufficient balance. You need at least €${(minBalance / 100).toFixed(2)} in your wallet to send offers.`
      );
    }

    // Note: Terms acceptance is handled during signup/profile completion
    // Professional profile wouldn't exist if terms weren't accepted

    // Parse and validate request body
    const body = await request.json();
    const data = createOfferSchema.parse(body);

    // Get the request
    const serviceRequest = await prisma.request.findUnique({
      where: { id: data.requestId },
      include: {
        client: {
          include: {
            user: {
              select: { id: true },
            },
          },
        },
        _count: {
          select: { offers: true },
        },
      },
    });

    if (!serviceRequest) {
      throw new NotFoundError('Request');
    }

    // Check if request is still open
    if (serviceRequest.status !== 'OPEN') {
      throw new BadRequestError('This request is no longer accepting offers');
    }

    // Check if professional already sent an offer
    const existingOffer = await prisma.offer.findFirst({
      where: {
        requestId: data.requestId,
        professionalId: professional.id,
      },
    });

    if (existingOffer) {
      throw new BadRequestError('You have already sent an offer for this request');
    }

    // Get platform settings for limits
    const settings = await prisma.platformSettings.findFirst();
    const maxOffers = settings?.maxOffersPerRequest || 10;

    // Check offer limit per request (enforce in transaction)
    if (serviceRequest._count.offers >= maxOffers) {
      throw new LimitExceededError(
        `This request has reached the maximum of ${maxOffers} offers`
      );
    }

    // Create offer in transaction to ensure offer limit
    const offer = await prisma.$transaction(async (tx) => {
      // Recheck count with lock
      const offerCount = await tx.offer.count({
        where: { requestId: data.requestId },
      });

      if (offerCount >= maxOffers) {
        throw new LimitExceededError(
          `This request has reached the maximum of ${maxOffers} offers`
        );
      }

      // Create the offer
      return await tx.offer.create({
        data: {
          professionalId: professional.id,
          requestId: data.requestId,
          message: data.message,
          proposedPrice: data.proposedPrice,
          estimatedDuration: data.estimatedDuration,
          availableTimeSlots: data.availableTimeSlots,
          status: 'PENDING',
        },
        include: {
          request: {
            include: {
              category: true,
              subcategory: true,
            },
          },
        },
      });
    });

    // Notify client about new offer (don't block response on this)
    const proName = `${professional.user.firstName} ${professional.user.lastName}`.trim() || 'A professional';
    const clientUserId = serviceRequest.client.user.id;
    console.log(`[Offer] 🔔 Notifying client (DB User ID: ${clientUserId}) about new offer from ${proName}`);
    notifyNewOffer(
      clientUserId,
      proName,
      serviceRequest.title,
      serviceRequest.id
    ).catch(err => console.error('[Offer] ❌ Failed to send notification:', err));

    return createdResponse(
      {
        offer: {
          id: offer.id,
          message: offer.message,
          proposedPrice: offer.proposedPrice,
          estimatedDuration: offer.estimatedDuration,
          availableTimeSlots: offer.availableTimeSlots,
          status: offer.status,
          request: {
            id: offer.request.id,
            title: offer.request.title,
            category: offer.request.category.nameEn,
            subcategory: offer.request.subcategory.nameEn,
          },
          createdAt: offer.createdAt,
        },
      },
      'Offer sent successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
