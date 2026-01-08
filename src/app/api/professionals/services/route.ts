// GET /api/professionals/services - List professional's services
// POST /api/professionals/services - Add new service
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireProfessional } from '@/lib/auth';
import { successResponse, handleApiError, createdResponse } from '@/lib/api-response';
import { createServiceSchema } from '@/lib/validations/user';
import { updateProfileCompletionPercentage, canProfessionalBeActive } from '@/lib/services/profile-completion';
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



    // Check service limit (Max 5 services)
    const serviceCount = await prisma.professionalService.count({
      where: { professionalId: professional.id },
    });

    if (serviceCount >= 5) {
      throw new ConflictError('You have reached the limit of 5 services. Please remove one to add another.');
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

    // QUALIFICATION VERIFICATION LOGIC
    // ALL services require qualification documents (diploma, certificate, resume, etc.)
    // Set qualificationVerified to false when professional adds their first service
    if (professional.qualificationVerified) {
      await prisma.professional.update({
        where: { id: professional.id },
        data: { qualificationVerified: false },
      });

      // Recompute verification status (will downgrade isVerified if it was true)
      const { updateProfessionalVerificationStatus } = await import('@/lib/services/verification');
      await updateProfessionalVerificationStatus(professional.id);

      console.log(`[Qualification] Professional ${professional.id} now requires qualification verification for ${subcategory.nameEn}`);
    }

    // Check for existing active requests in this subcategory
    try {
      const matchCount = await prisma.request.count({
        where: {
          subcategoryId: data.subcategoryId,
          status: 'OPEN',
        },
      });

      console.log(`[Service] Found ${matchCount} existing requests for subcategory ${data.subcategoryId}`);

      if (matchCount > 0) {
        const { notifyExistingMatches } = await import('@/lib/services/notifications');
        console.log(`[Service] Notifying professional ${professional.userId} about ${matchCount} matches`);
        await notifyExistingMatches(
          professional.userId,
          subcategory.nameEn,
          matchCount
        );
      }
    } catch (notificationError) {
      console.error('Failed to send existing match notification:', notificationError);
    }

    // Update profile completion
    const completionPercent = await updateProfileCompletionPercentage(professional.id);

    // Auto-activate if requirements are met
    if (professional.status === 'INCOMPLETE' || professional.status === 'PENDING_REVIEW') {
      const { canBeActive } = await canProfessionalBeActive(professional.id);
      if (canBeActive) {
        await prisma.professional.update({
          where: { id: professional.id },
          data: { status: 'ACTIVE' },
        });
      }
    }

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
