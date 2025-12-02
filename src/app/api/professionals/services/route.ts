// GET /api/professionals/services - List professional's services
// POST /api/professionals/services - Add new service
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireProfessional } from '@/lib/auth';
import { successResponse, handleApiError, createdResponse } from '@/lib/api-response';
import { createServiceSchema } from '@/lib/validations/user';
import { updateProfileCompletionPercentage } from '@/lib/services/profile-completion';
import { NotFoundError, ConflictError } from '@/lib/errors';

export async function GET() {
  try {
    const { userId } = await requireProfessional();

    // Get professional profile
    const professional = await prisma.professional.findUnique({
      where: { userId },
    });

    if (!professional) {
      throw new NotFoundError('Professional profile');
    }

    // Get services
    const services = await prisma.professionalService.findMany({
      where: { professionalId: professional.id },
      include: {
        subcategory: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse({
      services: services.map((service) => ({
        id: service.id,
        category: {
          id: service.subcategory.category.id,
          name: service.subcategory.category.nameEn,
        },
        subcategory: {
          id: service.subcategory.id,
          name: service.subcategory.nameEn,
        },
        priceFrom: service.priceFrom,
        priceTo: service.priceTo,
        description: service.description,
        createdAt: service.createdAt,
      })),
    });
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
    });

    if (!professional) {
      throw new NotFoundError('Professional profile');
    }

    // Parse and validate request body
    const body = await request.json();
    const data = createServiceSchema.parse(body);

    // Verify subcategory exists
    const subcategory = await prisma.subcategory.findUnique({
      where: { id: data.subcategoryId },
      include: {
        category: true,
      },
    });

    if (!subcategory) {
      throw new NotFoundError('Subcategory');
    }

    // Check if service already exists
    const existingService = await prisma.professionalService.findFirst({
      where: {
        professionalId: professional.id,
        subcategoryId: data.subcategoryId,
      },
    });

    if (existingService) {
      throw new ConflictError('You already have a service for this subcategory');
    }

    // Create service
    const service = await prisma.professionalService.create({
      data: {
        professionalId: professional.id,
        subcategoryId: data.subcategoryId,
        priceFrom: data.priceFrom,
        priceTo: data.priceTo,
        description: data.description,
      },
    });

    // Update profile completion
    const completionPercent = await updateProfileCompletionPercentage(professional.id);

    return createdResponse(
      {
        service: {
          id: service.id,
          category: subcategory.category.nameEn,
          subcategory: subcategory.nameEn,
          priceFrom: service.priceFrom,
          priceTo: service.priceTo,
          description: service.description,
        },
        profileCompletion: completionPercent,
      },
      'Service added successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
