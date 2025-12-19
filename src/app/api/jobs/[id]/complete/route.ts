// POST /api/jobs/[id]/complete - Mark job as complete (professional only)
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { NotFoundError, ForbiddenError, BadRequestError } from '@/lib/errors';
import { notifyJobCompleted } from '@/lib/services/notifications';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, role } = await requireAuth();
    const { id } = await context.params;

    // Get job with professional user info for the notification
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        client: {
          include: {
            user: {
              select: { id: true },
            },
          },
        },
        professional: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundError('Job');
    }

    // Verify ownership
    if (role === 'CLIENT') {
      const client = await prisma.client.findUnique({
        where: { userId },
      });
      if (!client || job.clientId !== client.id) {
        throw new ForbiddenError('You can only complete your own jobs');
      }
    }
    // Refactoring the logic completely below


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
      const completedJob = await tx.job.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      // Also mark request as completed so client sees it correctly
      await tx.request.update({
        where: { id: completedJob.requestId },
        data: {
          status: 'COMPLETED',
        },
      });

      // Increment professional's completed jobs count
      await tx.professional.update({
        where: { id: job.professionalId },
        data: {
          completedJobs: { increment: 1 },
        },
      });

      return completedJob;
    });

    // Notify client that job is complete and ask for review (don't block response)
    const proName = `${job.professional.user.firstName} ${job.professional.user.lastName}`.trim() || 'Your professional';
    notifyJobCompleted(
      job.client.user.id,
      proName,
      updatedJob.id
    ).catch(err => console.error('Failed to send notification:', err));

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

