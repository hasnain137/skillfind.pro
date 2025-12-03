// GET /api/requests - List user's requests
// POST /api/requests - Create new request
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireClient } from '@/lib/auth';
import { getClientByClerkId } from '@/lib/get-professional';
import { successResponse, handleApiError, createdResponse } from '@/lib/api-response';
import { createRequestSchema, listRequestsSchema } from '@/lib/validations/request';
import { NotFoundError, BadRequestError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const { userId, role } = await requireAuth();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      status: searchParams.get('status'),
      categoryId: searchParams.get('categoryId'),
      subcategoryId: searchParams.get('subcategoryId'),
    };

    const filters = listRequestsSchema.parse(params);

    // Build where clause based on role
    let whereClause: any = {};

    if (role === 'CLIENT') {
      // Clients see only their own requests
      const client = await getClientByClerkId(userId);

      if (!client) {
        throw new NotFoundError('Client profile');
      }

      whereClause.clientId = client.id;
    } else if (role === 'PROFESSIONAL') {
      // Professionals see open requests (for matching)
      whereClause.status = 'OPEN';
    }

    // Apply filters
    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.categoryId) {
      whereClause.categoryId = filters.categoryId;
    }

    if (filters.subcategoryId) {
      whereClause.subcategoryId = filters.subcategoryId;
    }

    // Get total count for pagination
    const total = await prisma.request.count({ where: whereClause });

    // Get requests with pagination
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
        _count: {
          select: {
            offers: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    });

    // Format response
    const formattedRequests = requests.map((req) => ({
      id: req.id,
      title: req.title,
      description: req.description,
      status: req.status,
      budgetMin: req.budgetMin,
      budgetMax: req.budgetMax,
      locationType: req.locationType,
      city: req.city,
      region: req.region,
      country: req.country,
      address: req.address,
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
      client: role === 'CLIENT' ? {
        firstName: req.client.user.firstName,
        lastName: req.client.user.lastName,
        city: req.client.city,
        avatar: req.client.user.avatar,
      } : undefined,
      offerCount: req._count.offers,
      createdAt: req.createdAt,
      updatedAt: req.updatedAt,
    }));

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

export async function POST(request: NextRequest) {
  try {
    const { clerkId } = await requireClient();

    console.log('🔍 Looking up client with Clerk ID:', clerkId);

    // Use helper function to get client by Clerk ID
    const client = await getClientByClerkId(clerkId);

    console.log('👤 Found client:', client ? { id: client.id, userId: client.userId } : 'NOT FOUND');

    if (!client) {
      throw new NotFoundError('Client profile - Please complete your profile at /auth-redirect');
    }

    // Parse and validate request body
    const body = await request.json();
    const data = createRequestSchema.parse(body);

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new NotFoundError('Category');
    }

    // Verify subcategory exists and belongs to category
    const subcategory = await prisma.subcategory.findUnique({
      where: { id: data.subcategoryId },
    });

    if (!subcategory) {
      throw new NotFoundError('Subcategory');
    }

    if (subcategory.categoryId !== data.categoryId) {
      throw new BadRequestError('Subcategory does not belong to the specified category');
    }

    // Create request
    const newRequest = await prisma.request.create({
      data: {
        clientId: client.id,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId,
        title: data.title,
        description: data.description,
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        locationType: data.locationType,
        city: data.city,
        region: data.region,
        country: data.country,
        address: data.address,
        urgency: data.urgency,
        preferredStartDate: data.preferredStartDate,
        status: 'OPEN',
      },
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
      },
    });

    return createdResponse(
      {
        request: {
          id: newRequest.id,
          title: newRequest.title,
          description: newRequest.description,
          status: newRequest.status,
          budgetMin: newRequest.budgetMin,
          budgetMax: newRequest.budgetMax,
          locationType: newRequest.locationType,
          city: newRequest.city,
          region: newRequest.region,
          country: newRequest.country,
          address: newRequest.address,
          urgency: newRequest.urgency,
          preferredStartDate: newRequest.preferredStartDate,
          category: {
            id: newRequest.category.id,
            name: newRequest.category.nameEn,
          },
          subcategory: {
            id: newRequest.subcategory.id,
            name: newRequest.subcategory.nameEn,
          },
          createdAt: newRequest.createdAt,
        },
      },
      'Request created successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
