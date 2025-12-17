import { prisma } from '@/lib/prisma';

export type CompletionStatus = {
  canBeActive: boolean;
  isPendingReview: boolean;
  reasons: string[];
};

export async function checkProfileCompletion(professionalId: string): Promise<CompletionStatus> {
  const professional = await prisma.professional.findUnique({
    where: { id: professionalId },
    include: {
      user: true,
      services: true,
      documents: true,
    },
  });

  if (!professional) {
    throw new Error('Professional not found');
  }

  const reasons: string[] = [];

  // Basic checks
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

  // Check if they are ready for review (everything done EXCEPT manual admin verification)
  const isReadyForReview =
    professional.user.emailVerified &&
    professional.user.phoneVerified &&
    professional.bio && professional.bio.length >= 50 &&
    professional.services.length > 0 &&
    !!professional.city && !!professional.country;

  return {
    canBeActive: reasons.length === 0, // must have isVerified = true
    isPendingReview: !!isReadyForReview,
    reasons,
  };
}

// Legacy alias / Wrapper for backward compatibility
export async function canProfessionalBeActive(professionalId: string) {
  const status = await checkProfileCompletion(professionalId);
  return {
    canBeActive: status.canBeActive,
    isPendingReview: status.isPendingReview,
    reasons: status.reasons
  };
}

export async function calculateProfileCompletion(professionalId: string) {
  const professional = await prisma.professional.findUnique({
    where: { id: professionalId },
    include: { profile: true, services: true, user: true }
  });

  if (!professional) return { percentage: 0, missingSteps: [], completedSteps: [] };

  let score = 0;
  const missing: string[] = [];
  const completed: string[] = [];
  const totalWeight = 100;

  // Define steps and weights
  const steps = [
    { label: 'Basic Info (Title)', check: !!professional.title, weight: 10 },
    { label: 'Bio (>50 chars)', check: !!(professional.bio && professional.bio.length >= 50), weight: 20 },
    { label: 'Location', check: !!professional.city, weight: 10 },
    { label: 'Services', check: professional.services.length > 0, weight: 20 },
    { label: 'Phone Verification', check: professional.user.phoneVerified, weight: 10 },
    { label: 'Identity Verification', check: professional.isVerified, weight: 20 },
    { label: 'Profile Picture', check: !!professional.user.imageUrl, weight: 10 }, // Assuming Clerk handles this often
  ];

  let currentScore = 0;

  for (const step of steps) {
    if (step.check) {
      currentScore += step.weight;
      completed.push(step.label);
    } else {
      missing.push(step.label);
    }
  }

  return {
    percentage: Math.min(currentScore, 100),
    missingSteps: missing,
    completedSteps: completed
  };
}

export async function updateProfileCompletionPercentage(professionalId: string) {
  const { percentage } = await calculateProfileCompletion(professionalId);

  await prisma.professional.update({
    where: { id: professionalId },
    data: { profileCompletion: percentage }
  });

  return percentage;
}
