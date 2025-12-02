// Profile completion calculator service
import 'server-only';
import { prisma } from '../prisma';

export interface ProfileCompletionResult {
  percentage: number;
  completedSteps: string[];
  missingSteps: string[];
  isComplete: boolean;
}

/**
 * Calculate profile completion percentage for a professional
 */
export async function calculateProfileCompletion(
  professionalId: string
): Promise<ProfileCompletionResult> {
  const professional = await prisma.professional.findUnique({
    where: { id: professionalId },
    include: {
      user: true,
      services: true,
      documents: true,
      wallet: true,
    },
  });

  if (!professional) {
    throw new Error('Professional not found');
  }

  const steps = {
    profilePhoto: {
      completed: !!professional.user.avatar,
      label: 'Profile photo uploaded',
    },
    bio: {
      completed: !!professional.bio && professional.bio.length >= 50,
      label: 'Professional bio completed',
    },
    services: {
      completed: professional.services.length > 0,
      label: 'At least one service added',
    },
    pricing: {
      completed: professional.services.some(
        (s) => s.priceFrom !== null || s.priceTo !== null
      ),
      label: 'Pricing information added',
    },
    location: {
      completed: !!professional.city && !!professional.country,
      label: 'Location information added',
    },
    remoteAvailability: {
      completed: professional.remoteAvailability !== null,
      label: 'Remote availability set',
    },
    emailVerified: {
      completed: professional.user.emailVerified,
      label: 'Email verified',
    },
    phoneVerified: {
      completed: professional.user.phoneVerified,
      label: 'Phone verified',
    },
    isVerified: {
      completed: professional.isVerified,
      label: 'Professional verification completed',
    },
    walletSetup: {
      completed: !!professional.wallet,
      label: 'Wallet initialized',
    },
  };

  const completedSteps = Object.entries(steps)
    .filter(([_, step]) => step.completed)
    .map(([_, step]) => step.label);

  const missingSteps = Object.entries(steps)
    .filter(([_, step]) => !step.completed)
    .map(([_, step]) => step.label);

  const totalSteps = Object.keys(steps).length;
  const completedCount = completedSteps.length;
  const percentage = Math.round((completedCount / totalSteps) * 100);

  return {
    percentage,
    completedSteps,
    missingSteps,
    isComplete: percentage === 100,
  };
}

/**
 * Update professional's profile completion percentage in database
 */
export async function updateProfileCompletionPercentage(
  professionalId: string
): Promise<number> {
  const result = await calculateProfileCompletion(professionalId);

  await prisma.professional.update({
    where: { id: professionalId },
    data: { profileCompletion: result.percentage },
  });

  return result.percentage;
}

/**
 * Check if professional meets minimum requirements to be active
 */
export async function canProfessionalBeActive(
  professionalId: string
): Promise<{ canBeActive: boolean; reasons: string[] }> {
  const professional = await prisma.professional.findUnique({
    where: { id: professionalId },
    include: {
      user: true,
      services: true,
    },
  });

  if (!professional) {
    return { canBeActive: false, reasons: ['Professional not found'] };
  }

  const reasons: string[] = [];

  // Required checks
  if (!professional.user.emailVerified) {
    reasons.push('Email not verified');
  }

  if (!professional.user.phoneVerified) {
    reasons.push('Phone not verified');
  }

  if (!professional.isVerified) {
    reasons.push('Professional verification not completed');
  }

  if (!professional.bio || professional.bio.length < 50) {
    reasons.push('Professional bio incomplete');
  }

  if (professional.services.length === 0) {
    reasons.push('No services added');
  }

  if (!professional.city || !professional.country) {
    reasons.push('Location information missing');
  }

  return {
    canBeActive: reasons.length === 0,
    reasons,
  };
}
