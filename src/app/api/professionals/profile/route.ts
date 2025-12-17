import { prisma } from '@/lib/prisma';
import { handleApiError, successResponse, unauthorizedResponse, notFoundResponse, validationErrorResponse } from '@/lib/api-utils';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { checkProfileCompletion } from '@/lib/services/profile-completion';

// Schema for updating professional profile
const profileSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  bio: z.string().min(50).max(2000).optional(),
  yearsOfExperience: z.coerce.number().min(0).max(100).optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(), // 'FR'
  isAvailable: z.boolean().optional(),
  remoteAvailability: z.enum(['YES_AND_ONSITE', 'ONLY_REMOTE', 'NO_REMOTE']).optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  hourlyRateMin: z.coerce.number().min(0).optional(),
  hourlyRateMax: z.coerce.number().min(0).optional(),
});

export async function PUT(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validatedData = profileSchema.safeParse(body);

    if (!validatedData.success) {
      return validationErrorResponse(validatedData.error);
    }

    // Get professional record
    const professional = await prisma.professional.findUnique({
      where: { userId },
      include: {
        profile: true,
      },
    });

    if (!professional) {
      return notFoundResponse('Professional profile not found');
    }

    // Update Professional (Core Info)
    await prisma.professional.update({
      where: { id: professional.id },
      data: {
        title: validatedData.data.title,
        bio: validatedData.data.bio,
        yearsOfExperience: validatedData.data.yearsOfExperience,
        city: validatedData.data.city,
        region: validatedData.data.region,
        country: validatedData.data.country,
        isAvailable: validatedData.data.isAvailable,
        remoteAvailability: validatedData.data.remoteAvailability,
      },
    });

    // Update ProfessionalProfile (Extra Info)
    const profileData = {
      websiteUrl: validatedData.data.websiteUrl || null,
      linkedinUrl: validatedData.data.linkedinUrl || null,
      hourlyRateMin: validatedData.data.hourlyRateMin,
      hourlyRateMax: validatedData.data.hourlyRateMax,
    };

    if (professional.profile) {
      await prisma.professionalProfile.update({
        where: { id: professional.profile.id },
        data: profileData,
      });
    } else {
      await prisma.professionalProfile.create({
        data: {
          professionalId: professional.id,
          ...profileData,
        },
      });
    }

    // Calculate completion score
    // Simple logic: Base 20 + fields presence
    // In a real app, use the `checkProfileCompletion` logic to drive score too.
    let completionPercent = 0;
    if (validatedData.data.title) completionPercent += 10;
    if (validatedData.data.bio) completionPercent += 20;
    if (validatedData.data.city) completionPercent += 10;

    // Update completion
    // We could do this properly but for now let's just trigger status check

    // Check Status Transition
    const { canBeActive, isPendingReview } = await checkProfileCompletion(professional.id);

    // If they aren't fully verified yet (isVerified=false), we can auto-move them to PENDING_REVIEW if ready
    if (!professional.isVerified) {
      if (canBeActive) {
        // If checking logic says they can be active (implies verified), we might auto-activate? 
        // Actually, `canBeActive` usually means `isVerified` is true. 
        // So if !isVerified, `canBeActive` will be false.
      } else if (isPendingReview && professional.status !== 'PENDING_REVIEW') {
        // If not ready for active but ready for review
        await prisma.professional.update({
          where: { id: professional.id },
          data: { status: 'PENDING_REVIEW' },
        });
        professional.status = 'PENDING_REVIEW';
      }
    }

    return successResponse(
      {
        professional: {
          id: professional.id,
          title: validatedData.data.title, // use updated
          // ... return updated fields
        },
        status: professional.status
      },
      'Professional profile updated successfully'
    );
  } catch (error) {
    console.error(error);
    return handleApiError(error);
  }
}
