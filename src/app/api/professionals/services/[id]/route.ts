// PUT /api/professionals/services/[id] - Update service
// DELETE /api/professionals/services/[id] - Delete service
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireProfessional } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { updateServiceSchema } from '@/lib/validations/user';
import { updateProfileCompletionPercentage } from '@/lib/services/profile-completion';
import { NotFoundError, ForbiddenError } from '@/lib/errors';

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

    // Get existing service
    const existingService = await prisma.professionalService.findUnique({
      where: { id },
    });

    if (!existingService) {
      throw new NotFoundError('Service');
    }

    // Verify ownership
    if (existingService.professionalId !== professional.id) {
      throw new ForbiddenError('You can only update your own services');
    }

    // Parse and validate request body
    const body = await request.json();
    const data = updateServiceSchema.parse(body);

    // Update service
    const updatedService = await prisma.professionalService.update({
      where: { id },
      data,
      include: {
        subcategory: {
          include: {
            category: true,
          },
        },
      },
    });

    return successResponse(
      {
        service: {
          id: updatedService.id,
          category: updatedService.subcategory.category.nameEn,
          subcategory: updatedService.subcategory.nameEn,
          priceFrom: updatedService.priceFrom,
          priceTo: updatedService.priceTo,
          description: updatedService.description,
        },
      },
      'Service updated successfully'
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

    // Get existing service
    const existingService = await prisma.professionalService.findUnique({
      where: { id },
    });

    if (!existingService) {
      throw new NotFoundError('Service');
    }

    // Verify ownership
    if (existingService.professionalId !== professional.id) {
      throw new ForbiddenError('You can only delete your own services');
    }

    // Delete service
    await prisma.professionalService.delete({
      where: { id },
    });

    // Update profile completion
    const completionPercent = await updateProfileCompletionPercentage(professional.id);

    return successResponse(
      {
        message: 'Service deleted successfully',
        profileCompletion: completionPercent,
      },
      'Service deleted successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
