// GET /api/user/profile - Get current user profile
// PUT /api/user/profile - Update current user profile
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { updateUserProfileSchema } from '@/lib/validations/user';

export async function GET() {
  try {
    const { userId } = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        clientProfile: true,
        professionalProfile: {
          include: {
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
        },
      },
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    return successResponse({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        dateOfBirth: user.dateOfBirth,
        phoneNumber: user.phoneNumber,
        city: user.clientProfile?.city || user.professionalProfile?.city,
        region: user.clientProfile?.region || user.professionalProfile?.region,
        country: user.clientProfile?.country || user.professionalProfile?.country,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
        client: user.clientProfile,
        professional: user.professionalProfile ? {
          id: user.professionalProfile.id,
          title: user.professionalProfile.title,
          bio: user.professionalProfile.bio,
          yearsOfExperience: user.professionalProfile.yearsOfExperience,
          status: user.professionalProfile.status,
          isAvailable: user.professionalProfile.isAvailable,
          remoteAvailability: user.professionalProfile.remoteAvailability,
          profileCompletion: user.professionalProfile.profileCompletion,
          walletBalance: user.professionalProfile.wallet?.balance || 0,
          services: user.professionalProfile.services,
        } : null,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await requireAuth();

    // Parse and validate request body
    const body = await request.json();
    const data = updateUserProfileSchema.parse(body);

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    return successResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          avatar: user.avatar,
        },
      },
      'Profile updated successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await requireAuth();

    // Parse request body
    const body = await request.json();
    
    // Build update data object only with provided fields
    const updateData: any = {};
    
    if (body.dateOfBirth !== undefined) {
      updateData.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null;
    }
    
    if (body.phoneNumber !== undefined) {
      updateData.phoneNumber = body.phoneNumber || null;
    }

    // Update user with only the provided fields
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return successResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          dateOfBirth: user.dateOfBirth,
          phoneNumber: user.phoneNumber,
          avatar: user.avatar,
        },
      },
      'Personal information updated successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
