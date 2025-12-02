// GET /api/professionals/profile/completion - Get profile completion status
import { requireProfessional } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { calculateProfileCompletion } from '@/lib/services/profile-completion';
import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';

export async function GET() {
  try {
    const { userId } = await requireProfessional();

    const professional = await prisma.professional.findUnique({
      where: { userId },
    });

    if (!professional) {
      throw new NotFoundError('Professional profile');
    }

    const completion = await calculateProfileCompletion(professional.id);

    return successResponse({
      completion: {
        percentage: completion.percentage,
        isComplete: completion.isComplete,
        completedSteps: completion.completedSteps,
        missingSteps: completion.missingSteps,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
