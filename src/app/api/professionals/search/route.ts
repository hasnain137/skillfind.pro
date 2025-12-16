// GET /api/professionals/search
// Public endpoint to search and filter professionals
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError } from '@/lib/api-response';
import { z } from 'zod';

// Validation schema for search parameters
const searchProfessionalsSchema = z.object({
  page: z.string().nullable().transform(val => val ? parseInt(val) : 1).pipe(z.number().int().min(1)).catch(1),
  limit: z.string().nullable().transform(val => val ? parseInt(val) : 20).pipe(z.number().int().min(1).max(100)).catch(20),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  location: z.string().optional(),
  remote: z.string().optional().transform(val => val === 'true'),
  minRating: z.string().optional().transform(val => val ? parseFloat(val) : undefined).pipe(z.number().min(0).max(5).optional()),
  maxPrice: z.string().optional().transform(val => val ? parseInt(val) : undefined).pipe(z.number().int().min(0).optional()),
  search: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      category: searchParams.get('category'),
      subcategory: searchParams.get('subcategory'),
      location: searchParams.get('location'),
      remote: searchParams.get('remote'),
      minRating: searchParams.get('minRating'),
      maxPrice: searchParams.get('maxPrice'),
      search: searchParams.get('search'),
    };

    // Use defaults if parsing fails
    const filters = {
      page: params.page ? parseInt(params.page) || 1 : 1,
      limit: params.limit ? parseInt(params.limit) || 20 : 20,
      category: params.category || undefined,
      subcategory: params.subcategory || undefined,
      location: params.location || undefined,
      remote: params.remote === 'true',
      minRating: params.minRating ? parseFloat(params.minRating) : undefined,
      maxPrice: params.maxPrice ? parseInt(params.maxPrice) : undefined,
      search: params.search || undefined,
    };

    // Ensure limit is within bounds
    filters.limit = Math.min(Math.max(filters.limit, 1), 100);

    // Build where clause
    const whereClause: any = {
      // ONLY show ACTIVE professionals in public search
      status: 'ACTIVE',
    };

    // Filter by rating
    if (filters.minRating) {
      whereClause.averageRating = {
        gte: filters.minRating,
      };
    }

    // Filter by location or remote availability
    if (filters.location) {
      whereClause.OR = [
        {
          city: {
            contains: filters.location,
            mode: 'insensitive',
          },
        },
        {
          remoteAvailability: {
            in: ['YES_AND_ONSITE', 'ONLY_REMOTE'],
          },
        },
      ];
    } else if (filters.remote === true) {
      whereClause.remoteAvailability = {
        in: ['YES_AND_ONSITE', 'ONLY_REMOTE'],
      };
    }

    // Filter by hourly rate (from profile)
    if (filters.maxPrice) {
      whereClause.profile = {
        hourlyRateMax: {
          lte: filters.maxPrice,
        },
      };
    }

    // Filter by services (category or subcategory)
    if (filters.category || filters.subcategory) {
      const serviceWhere: any = {};

      if (filters.subcategory) {
        serviceWhere.subcategoryId = filters.subcategory;
      } else if (filters.category) {
        serviceWhere.subcategory = {
          categoryId: filters.category,
        };
      }

      whereClause.services = {
        some: serviceWhere,
      };
    }

    // Search in name, bio, title, business name
    if (filters.search) {
      whereClause.OR = [
        {
          user: {
            OR: [
              {
                firstName: {
                  contains: filters.search,
                  mode: 'insensitive',
                },
              },
              {
                lastName: {
                  contains: filters.search,
                  mode: 'insensitive',
                },
              },
            ],
          },
        },
        {
          bio: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          title: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          businessName: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Get total count
    let total = 0;
    try {
      total = await prisma.professional.count({ where: whereClause });
    } catch (countError) {
      console.error('Count error:', countError);
      return successResponse(
        { professionals: [] },
        'No professionals found',
        {
          page: filters.page,
          limit: filters.limit,
          total: 0,
          totalPages: 0,
        }
      );
    }

    // If no professionals, return empty
    if (total === 0) {
      return successResponse(
        { professionals: [] },
        'No professionals found matching your criteria',
        {
          page: filters.page,
          limit: filters.limit,
          total: 0,
          totalPages: 0,
        }
      );
    }

    // Get professionals
    let professionals;
    try {
      professionals = await prisma.professional.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          profile: {
            select: {
              hourlyRateMin: true,
              hourlyRateMax: true,
              portfolioImages: true,
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
          },
          _count: {
            select: {
              jobs: true,
            },
          },
        },
        orderBy: [
          { averageRating: 'desc' },
          { totalReviews: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      });
    } catch (queryError) {
      console.error('Query error:', queryError);
      return successResponse(
        { professionals: [] },
        'Error fetching professionals',
        {
          page: filters.page,
          limit: filters.limit,
          total: 0,
          totalPages: 0,
        }
      );
    }

    // Format response
    const formattedProfessionals = professionals.map((pro) => ({
      id: pro.id,
      businessName: pro.businessName,
      title: pro.title,
      bio: pro.bio,
      yearsOfExperience: pro.yearsOfExperience,
      hourlyRate: pro.profile
        ? {
          min: pro.profile.hourlyRateMin,
          max: pro.profile.hourlyRateMax,
        }
        : null,
      remoteAvailability: pro.remoteAvailability,
      isVerified: pro.isVerified,
      averageRating: pro.averageRating,
      totalReviews: pro.totalReviews,
      completedJobs: pro.completedJobs,
      totalJobs: pro._count.jobs,
      profileCompletion: pro.profileCompletion,
      city: pro.city,
      region: pro.region,
      country: pro.country,
      user: {
        firstName: pro.user.firstName,
        lastName: pro.user.lastName,
        avatar: pro.user.avatar,
      },
      services: pro.services.map((service) => ({
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
    }));

    return successResponse(
      { professionals: formattedProfessionals },
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
