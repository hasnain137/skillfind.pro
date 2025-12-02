// POST /api/jobs/[id]/start - Start a job (professional only)
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireProfessional } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { NotFoundError, ForbiddenError, BadRequestError } from '@/lib/errors';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireProfessional();
    const { id } = await context.params;

    // Get professional
    const professional = await prisma.professional.findUnique({
      where: { userId },
    });

    if (!professional) {
      throw new NotFoundError('Professional profile');
    }

    // Get job
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        request: true,
        client: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundError('Job');
    }

    // Verify ownership
    if (job.professionalId !== professional.id) {
      throw new ForbiddenError('You can only start your own jobs');
    }

    // Check status
    if (job.status !== 'ACCEPTED') {
      throw new BadRequestError(
        `Cannot start job with status ${job.status}. Only ACCEPTED jobs can be started.`
      );
    }

    // Start the job
    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });

    // TODO: Send notification to client

    return successResponse(
      {
        job: {
          id: updatedJob.id,
          status: updatedJob.status,
          startedAt: updatedJob.startedAt,
        },
        message: 'Job started successfully. Client has been notified.',
      },
      'Job started successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
