// GET /api/professionals/profile - Get current professional profile
// PUT /api/professionals/profile - Update professional profile
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireProfessional } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { updateProfessionalProfileSchema } from '@/lib/validations/user';
import { updateProfileCompletionPercentage, canProfessionalBeActive } from '@/lib/services/profile-completion';
import { NotFoundError } from '@/lib/errors';

export async function GET() {
  try {
    const { userId } = await requireProfessional();

    const professional = await prisma.professional.findUnique({
      where: { userId },
      include: {
        user: true,
        wallet: true,
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

    return successResponse({
      professional: {
        id: professional.id,
        userId: professional.userId,
        title: professional.title,
        bio: professional.bio,
        yearsOfExperience: professional.yearsOfExperience,
        city: professional.city,
        region: professional.region,
        country: professional.country,
        isAvailable: professional.isAvailable,
        remoteAvailability: professional.remoteAvailability,
        profileCompletion: professional.profileCompletion,
        status: professional.status,
        createdAt: professional.createdAt,
        user: {
          email: professional.user.email,
          firstName: professional.user.firstName,
          lastName: professional.user.lastName,
          phoneNumber: professional.user.phoneNumber,
          avatar: professional.user.avatar,
          emailVerified: professional.user.emailVerified,
          phoneVerified: professional.user.phoneVerified,
        },
        wallet: {
          balance: professional.wallet?.balance || 0,
        },
        services: professional.services,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await requireProfessional();

    // Parse and validate request body
    const body = await request.json();
    const data = updateProfessionalProfileSchema.parse(body);

    // Get professional
    const existingProfessional = await prisma.professional.findUnique({
      where: { userId },
    });

    if (!existingProfessional) {
      throw new NotFoundError('Professional profile');
    }

    // Update professional profile
    const professional = await prisma.professional.update({
      where: { id: existingProfessional.id },
      data,
    });

    // Recalculate profile completion
    const completionPercent = await updateProfileCompletionPercentage(professional.id);

    // Auto-activate if requirements are met
    if (professional.status === 'INCOMPLETE' || professional.status === 'PENDING_REVIEW') {
      const { canBeActive } = await canProfessionalBeActive(professional.id);
      if (canBeActive) {
        await prisma.professional.update({
          where: { id: professional.id },
          data: { status: 'ACTIVE' },
        });
        // Update local object for response
        professional.status = 'ACTIVE';
      }
    }

    return successResponse(
      {
        professional: {
          id: professional.id,
          title: professional.title,
          bio: professional.bio,
          yearsOfExperience: professional.yearsOfExperience,
          city: professional.city,
          region: professional.region,
          country: professional.country,
          isAvailable: professional.isAvailable,
          remoteAvailability: professional.remoteAvailability,
          profileCompletion: completionPercent,
        },
      },
      'Professional profile updated successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
