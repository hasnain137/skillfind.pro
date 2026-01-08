// GET /api/professionals/search
// Public endpoint to search and filter professionals
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError } from '@/lib/api-response';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Validation schema for search parameters (unchanged)
const searchProfessionalsSchema = z.object({
  page: z.string().nullable().transform(val => val ? parseInt(val) : 1).pipe(z.number().int().min(1)).catch(1),
  limit: z.string().nullable().transform(val => val ? parseInt(val) : 20).pipe(z.number().int().min(1).max(100)).catch(20),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  country: z.string().optional(),
  location: z.string().optional(),
  remote: z.string().optional().transform(val => val === 'true'),
  minRating: z.string().optional().transform(val => val ? parseFloat(val) : undefined).pipe(z.number().min(0).max(5).optional()),
  minPrice: z.string().optional().transform(val => val ? parseInt(val) : undefined).pipe(z.number().int().min(0).optional()),
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
      country: searchParams.get('country'),
      location: searchParams.get('location'),
      remote: searchParams.get('remote'),
      minRating: searchParams.get('minRating'),
      minPrice: searchParams.get('minPrice'),
      maxPrice: searchParams.get('maxPrice'),
      search: searchParams.get('search'),
    };

    // Use defaults if parsing fails
    const filters = {
      page: params.page ? parseInt(params.page) || 1 : 1,
      limit: params.limit ? parseInt(params.limit) || 20 : 20,
      category: params.category || undefined,
      subcategory: params.subcategory || undefined,
      country: params.country || undefined,
      location: params.location || undefined,
      remote: params.remote === 'true',
      minRating: params.minRating ? parseFloat(params.minRating) : undefined,
      minPrice: params.minPrice ? parseInt(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? parseInt(params.maxPrice) : undefined,
      search: params.search || undefined,
    };

    // Ensure limit is within bounds
    filters.limit = Math.min(Math.max(filters.limit, 1), 100);

    // ============================================================
    // SEARCH STRATEGY:
    // 1. If 'search' term is present: Use RAW SQL with pg_trgm for fuzzy matching and ranking.
    // 2. If NO 'search' term: Use standard Prisma findMany (faster/simpler).
    // ============================================================

    let professionalIds: string[] | null = null;
    let scoreMap = new Map<string, number>();

    if (filters.search && filters.search.trim().length > 0) {
      const searchTerm = filters.search.trim();

      // Construct RAW SQL for Search
      // We look in: properties.businessName, properties.title, properties.bio, user.firstName, user.lastName
      // Note: We need to join relations manually in SQL or just select from flattened view if it existed.
      // Since data is normalized, we join.

      const searchSql = Prisma.sql`
        SELECT 
          p.id,
          GREATEST(
            SIMILARITY(p."businessName", ${searchTerm}),
            SIMILARITY(p."title", ${searchTerm}),
            SIMILARITY(p."bio", ${searchTerm}),
            SIMILARITY(u."firstName", ${searchTerm}),
            SIMILARITY(u."lastName", ${searchTerm}),
            SIMILARITY(ps."description", ${searchTerm})
          ) as score
        FROM "professionals" p
        JOIN "users" u ON p."userId" = u."id"
        LEFT JOIN "professional_services" ps ON p."id" = ps."professionalId"
        WHERE 
          p."status" IN ('ACTIVE', 'INCOMPLETE', 'PENDING_REVIEW')
          AND (
            p."businessName" % ${searchTerm} OR
            p."title" % ${searchTerm} OR
            p."bio" % ${searchTerm} OR
            u."firstName" % ${searchTerm} OR
            u."lastName" % ${searchTerm} OR
            ps."description" % ${searchTerm}
          )
        GROUP BY p.id, u.id
        ORDER BY score DESC
        LIMIT 100 -- Cap fuzzy search results for performance
      `;

      try {
        const rawResults = await prisma.$queryRaw<{ id: string, score: number }[]>(searchSql);

        // Remove duplicates if any (though GROUP BY should handle it) and map scores
        professionalIds = [];
        for (const row of rawResults) {
          if (!scoreMap.has(row.id)) {
            scoreMap.set(row.id, row.score);
            professionalIds.push(row.id);
          }
        }

      } catch (err) {
        console.error("Search Query Error:", err);
        // Fallback to empty if raw query fails
        professionalIds = [];
      }
    }

    // Build Prisma Where Clause
    const whereClause: any = {
      status: { in: ['ACTIVE', 'INCOMPLETE', 'PENDING_REVIEW'] },
    };

    // If we have IDs from the search step, filter by them
    if (professionalIds !== null) {
      if (professionalIds.length === 0) {
        return successResponse(
          { professionals: [] },
          'No professionals found matching your criteria',
          { page: filters.page, limit: filters.limit, total: 0, totalPages: 0 }
        );
      }
      whereClause.id = { in: professionalIds };
    }

    // Apply Standard Filters (Category, Location, Price, Rating)
    // ---------------------------------------------------------

    // Rating
    if (filters.minRating) {
      whereClause.averageRating = { gte: filters.minRating };
    }

    // Country
    if (filters.country) {
      whereClause.country = filters.country;
    }

    // Location
    if (filters.location) {
      // Simple case-insensitive contains for location (city) if provided
      // Note: For advanced radius search we'd need PostGIS, but let's stick to simple logic for now
      whereClause.OR = [
        { city: { contains: filters.location, mode: 'insensitive' } },
        { remoteAvailability: { in: ['YES_AND_ONSITE', 'ONLY_REMOTE'] } }
      ];
    } else if (filters.remote === true) {
      whereClause.remoteAvailability = { in: ['YES_AND_ONSITE', 'ONLY_REMOTE'] };
    }

    // Price
    if (filters.minPrice || filters.maxPrice) {
      const priceFilter: any = {};
      if (filters.minPrice) priceFilter.gte = filters.minPrice;
      if (filters.maxPrice) priceFilter.lte = filters.maxPrice;
      whereClause.services = { some: { priceFrom: priceFilter } };
    }

    // Category / Subcategory
    if (filters.category || filters.subcategory) {
      const serviceWhere: any = {};
      if (filters.subcategory) {
        serviceWhere.subcategoryId = filters.subcategory;
      } else if (filters.category) {
        serviceWhere.subcategory = { categoryId: filters.category };
      }
      // Merge with existing services filter if any
      if (whereClause.services) {
        whereClause.services.some = { ...whereClause.services.some, ...serviceWhere };
      } else {
        whereClause.services = { some: serviceWhere };
      }
    }

    // Count Total
    let total = 0;
    try {
      total = await prisma.professional.count({ where: whereClause });
    } catch (e) { console.error(e); }

    if (total === 0) {
      return successResponse({ professionals: [] }, 'No professionals found', {
        page: filters.page, limit: filters.limit, total: 0, totalPages: 0
      });
    }

    // Fetch Professionals
    // Note: If we had a search term, we want to respect the 'professionalIds' order.
    // However, Prisma 'in' filter does NOT guarantee order.
    // So we fetch matching records and sort them in code.
    const professionals = await prisma.professional.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        profile: { select: { hourlyRateMin: true, hourlyRateMax: true, portfolioImages: true } },
        services: {
          include: {
            subcategory: {
              select: {
                id: true, nameEn: true, nameFr: true,
                category: { select: { id: true, nameEn: true, nameFr: true } }
              }
            }
          }
        },
        _count: { select: { jobs: true } }
      },
      // Sort: If search active, we sort manually. Else default sort.
      orderBy: professionalIds ? undefined : [
        { averageRating: 'desc' },
        { totalReviews: 'desc' },
        { createdAt: 'desc' }
      ],
      // Pagination: If search active, we paginate manually after sort. Else DB paginate.
      skip: professionalIds ? undefined : (filters.page - 1) * filters.limit,
      take: professionalIds ? undefined : filters.limit,
    });

    // Post-Process Sorting for Search Results
    let finalResults = professionals;
    if (professionalIds) {
      // Sort by score
      finalResults.sort((a, b) => {
        const scoreA = scoreMap.get(a.id) || 0;
        const scoreB = scoreMap.get(b.id) || 0;
        return scoreB - scoreA; // Descending
      });

      // Manual Pagination
      const start = (filters.page - 1) * filters.limit;
      finalResults = finalResults.slice(start, start + filters.limit);
    }

    // Format Response
    const formattedProfessionals = finalResults.map((pro) => ({
      id: pro.id,
      businessName: pro.businessName,
      title: pro.title,
      bio: pro.bio,
      yearsOfExperience: pro.yearsOfExperience,
      hourlyRate: pro.profile ? { min: pro.profile.hourlyRateMin, max: pro.profile.hourlyRateMax } : null,
      remoteAvailability: pro.remoteAvailability,
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
