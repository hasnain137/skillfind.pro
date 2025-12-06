// POST /api/jobs/[id]/complete - Mark job as complete (professional only)
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { NotFoundError, ForbiddenError, BadRequestError } from '@/lib/errors';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, role } = await requireAuth();
    const { id } = await context.params;

    // Get job
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        client: true,
        professional: true,
      },
    });

    if (!job) {
      throw new NotFoundError('Job');
    }

    // Verify ownership
    if (role === 'PROFESSIONAL') {
      // Get professional profile
      const professional = await prisma.professional.findUnique({
        where: { userId },
      });

      if (!professional || job.professionalId !== professional.id) {
        throw new ForbiddenError('You can only complete your own jobs');
      }
    } else if (role !== 'ADMIN') {
      // Clients cannot complete jobs via this API anymore
      throw new ForbiddenError('Only professionals can complete jobs');
    }

    // Check status
    if (job.status === 'COMPLETED') {
      throw new BadRequestError('Job is already completed');
    }

    if (job.status === 'CANCELLED') {
      throw new BadRequestError('Cannot complete a cancelled job');
    }

    if (job.status === 'DISPUTED') {
      throw new BadRequestError('Cannot complete a disputed job');
    }

    // Complete the job and request in a transaction
    const updatedJob = await prisma.$transaction(async (tx) => {
      const job = await tx.job.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      // Also mark request as completed so client sees it correctly
      await tx.request.update({
        where: { id: job.requestId },
        data: {
          status: 'COMPLETED',
        },
      });

      return job;
    });

    // TODO: Send notification to client asking for review

    return successResponse(
      {
        job: {
          id: updatedJob.id,
          status: updatedJob.status,
          completedAt: updatedJob.completedAt,
        },
        message: 'Job marked as complete. Client will be asked to leave a review.',
      },
      'Job completed successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
