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
