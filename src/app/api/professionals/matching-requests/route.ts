// GET /api/professionals/matching-requests - Get requests matching professional's services
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireProfessional } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { matchingRequestsSchema } from '@/lib/validations/request';
import { NotFoundError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireProfessional();

    // Get professional profile with services
    const professional = await prisma.professional.findUnique({
      where: { userId },
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
    });

    if (!professional) {
      throw new NotFoundError('Professional profile');
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      categoryId: searchParams.get('categoryId'),
      subcategoryId: searchParams.get('subcategoryId'),
      remoteOnly: searchParams.get('remoteOnly'),
    };

    const filters = matchingRequestsSchema.parse(params);

    // Build matching criteria
    let whereClause: any = {
      status: 'OPEN',
    };

    // Match by professional's services if no specific filters
    if (!filters.categoryId && !filters.subcategoryId) {
      // Get all subcategory IDs from professional's services
      const subcategoryIds = professional.services.map((s) => s.subcategoryId);

      if (subcategoryIds.length > 0) {
        whereClause.subcategoryId = {
          in: subcategoryIds,
        };
      } else {
        // No services set up, return empty
        return successResponse(
          { requests: [] },
          'No matching requests found. Please add services to your profile.',
          {
            page: filters.page,
            limit: filters.limit,
            total: 0,
            totalPages: 0,
          }
        );
      }
    }

    // Apply manual filters
    if (filters.categoryId) {
      whereClause.categoryId = filters.categoryId;
    }

    if (filters.subcategoryId) {
      whereClause.subcategoryId = filters.subcategoryId;
    }

    // Location matching
    // Filter based on professional's remote availability
    if (professional.remoteAvailability === 'NO_REMOTE') {
      // Professional only works on-site - filter for same city
      whereClause.city = professional.city;
      whereClause.locationType = 'ON_SITE';
    }

    // Filter for remote-only requests if specified
    if (filters.remoteOnly) {
      whereClause.locationType = 'REMOTE';
    }

    // Exclude requests where professional already sent an offer
    const existingOfferRequestIds = await prisma.offer.findMany({
      where: { professionalId: professional.id },
      select: { requestId: true },
    });

    if (existingOfferRequestIds.length > 0) {
      whereClause.id = {
        notIn: existingOfferRequestIds.map((o) => o.requestId),
      };
    }

    // Get total count
    const total = await prisma.request.count({ where: whereClause });

    // Get matching requests
    const requests = await prisma.request.findMany({
      where: whereClause,
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
          select: {
            id: true,
            city: true,
            region: true,
            country: true,
            user: {
              select: {
                emailVerified: true,
                phoneVerified: true,
                // Don't show name until offer accepted
              },
            },
          },
        },
        _count: {
          select: {
            offers: true,
          },
        },
      },
      orderBy: [
        { createdAt: 'desc' }, // Newest first
      ],
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    });

    // Format response
    const formattedRequests = requests.map((req) => {
      // Calculate match score (0-100)
      let matchScore = 50; // Base score

      // Bonus for exact subcategory match
      const hasExactMatch = professional.services.some(
        (s) => s.subcategoryId === req.subcategoryId
      );
      if (hasExactMatch) matchScore += 30;

      // Bonus for same location
      if (req.city && professional.city && req.city.toLowerCase() === professional.city.toLowerCase()) {
        matchScore += 15;
      }

      // Bonus for remote availability match
      if (req.locationType === 'REMOTE' && (professional.remoteAvailability === 'ONLY_REMOTE' || professional.remoteAvailability === 'YES_AND_ONSITE')) {
        matchScore += 10;
      }

      return {
        id: req.id,
        title: req.title,
        description: req.description,
        budgetMin: req.budgetMin,
        budgetMax: req.budgetMax,
        locationType: req.locationType,
        city: req.city,
        region: req.region,
        country: req.country,
        urgency: req.urgency,
        preferredStartDate: req.preferredStartDate,
        category: {
          id: req.category.id,
          name: req.category.nameEn,
        },
        subcategory: {
          id: req.subcategory.id,
          name: req.subcategory.nameEn,
        },
        client: {
          city: req.client.city,
          region: req.client.region,
          country: req.client.country,
          verified: req.client.user.emailVerified && req.client.user.phoneVerified,
          // Name hidden until offer accepted
        },
        offerCount: req._count.offers,
        matchScore, // How well this request matches professional's profile
        createdAt: req.createdAt,
        daysOld: Math.floor(
          (Date.now() - req.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        ),
      };
    });

    // Sort by match score
    formattedRequests.sort((a, b) => b.matchScore - a.matchScore);

    return successResponse(
      { requests: formattedRequests },
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
