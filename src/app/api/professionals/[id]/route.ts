// GET /api/professionals/[id]
// Public endpoint to view professional profile
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError } from '@/lib/api-response';
import { NotFoundError } from '@/lib/errors';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;

    // Validate ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid professional ID',
          message: 'Professional ID must be provided',
        },
        { status: 400 }
      );
    }

    // Get professional profile
    const professional = await prisma.professional.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            createdAt: true,
          },
        },
        profile: {
          select: {
            hourlyRateMin: true,
            hourlyRateMax: true,
            portfolioImages: true,
            websiteUrl: true,
            linkedinUrl: true,
          },
        },
        services: {
          include: {
            subcategory: {
              select: {
                id: true,
                nameEn: true,
                nameFr: true,
                category: {
                  select: {
                    id: true,
                    nameEn: true,
                    nameFr: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            jobs: true,
            offers: true,
          },
        },
      },
    });

    if (!professional) {
      throw new NotFoundError('Professional profile');
    }

    // Check if professional is active
    if (professional.status !== 'ACTIVE') {
      return NextResponse.json(
        {
          success: false,
          error: 'Profile not available',
          message: 'This professional profile is not currently active',
        },
        { status: 404 }
      );
    }

    // Get recent reviews (approved only)
    const recentReviews = await prisma.review.findMany({
      where: {
        job: {
          professionalId: id,
        },
        moderationStatus: 'APPROVED',
      },
      include: {
        client: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        professionalResponse: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    // Format response
    const formattedProfile = {
      id: professional.id,
      businessName: professional.businessName,
      title: professional.title,
      bio: professional.bio,
      yearsOfExperience: professional.yearsOfExperience,
      hourlyRate: professional.profile
        ? {
            min: professional.profile.hourlyRateMin,
            max: professional.profile.hourlyRateMax,
          }
        : null,
      remoteAvailability: professional.remoteAvailability,
      averageRating: professional.averageRating,
      totalReviews: professional.totalReviews,
      completedJobs: professional.completedJobs,
      totalJobs: professional._count.jobs,
      totalOffers: professional._count.offers,
      profileCompletion: professional.profileCompletion,
      isVerified: professional.isVerified,
      verifiedAt: professional.verifiedAt,
      memberSince: professional.user.createdAt,
      city: professional.city,
      region: professional.region,
      country: professional.country,
      user: {
        firstName: professional.user.firstName,
        lastName: professional.user.lastName,
        avatar: professional.user.avatar,
      },
      portfolio: professional.profile
        ? {
            images: professional.profile.portfolioImages,
            websiteUrl: professional.profile.websiteUrl,
            linkedinUrl: professional.profile.linkedinUrl,
          }
        : null,
      services: professional.services.map((service) => ({
        id: service.id,
        priceFrom: service.priceFrom,
        priceTo: service.priceTo,
        description: service.description,
        subcategory: {
          id: service.subcategory.id,
          name: service.subcategory.nameEn,
          category: {
            id: service.subcategory.category.id,
            name: service.subcategory.category.nameEn,
          },
        },
      })),
      recentReviews: recentReviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        wouldRecommend: review.wouldRecommend,
        createdAt: review.createdAt,
        client: {
          firstName: review.client.user.firstName,
          lastNameInitial: review.client.user.lastName ? review.client.user.lastName.charAt(0) + '.' : '',
          city: review.client.city,
        },
        professionalResponse: review.professionalResponse
          ? {
              response: review.professionalResponse.response,
              createdAt: review.professionalResponse.createdAt,
            }
          : null,
      })),
    };

    return successResponse({ professional: formattedProfile });
  } catch (error) {
    return handleApiError(error);
  }
}
