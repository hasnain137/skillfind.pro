// POST /api/jobs/[id]/cancel - Cancel a job (either party can cancel)
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { NotFoundError, ForbiddenError, BadRequestError } from '@/lib/errors';
import { z } from 'zod';

const cancelJobSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500),
  refundRequested: z.boolean().optional().default(false),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, role } = await requireAuth();
    const { id } = await context.params;

    // Parse body
    const body = await request.json();
    const data = cancelJobSchema.parse(body);

    // Get job
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        client: { include: { user: true } },
        professional: { include: { user: true } },
      },
    });

    if (!job) {
      throw new NotFoundError('Job');
    }

    // Verify access
    let cancelledBy: 'CLIENT' | 'PROFESSIONAL';

    if (role === 'CLIENT') {
      const client = await prisma.client.findUnique({
        where: { userId },
      });

      if (job.clientId !== client?.id) {
        throw new ForbiddenError('You can only cancel your own jobs');
      }

      cancelledBy = 'CLIENT';
    } else if (role === 'PROFESSIONAL') {
      const professional = await prisma.professional.findUnique({
        where: { userId },
      });

      if (job.professionalId !== professional?.id) {
        throw new ForbiddenError('You can only cancel your own jobs');
      }

      cancelledBy = 'PROFESSIONAL';
    } else {
      throw new ForbiddenError('Only clients and professionals can cancel jobs');
    }

    // Check status
    if (job.status === 'COMPLETED') {
      throw new BadRequestError('Cannot cancel a completed job');
    }

    if (job.status === 'CANCELLED') {
      throw new BadRequestError('Job is already cancelled');
    }

    // Cancel the job
    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    });

    // TODO: Create cancellation record for audit (needs JobCancellation model in schema)
    // TODO: Handle refund if requested and appropriate
    // Send email to the OTHER party
    const targetEmail = cancelledBy === 'CLIENT'
      ? job.professional.user.email
      : job.client.user.email;
    const targetName = cancelledBy === 'CLIENT'
      ? job.professional.user.firstName
      : job.client.user.firstName;
    const actorName = cancelledBy === 'CLIENT'
      ? `${job.client.user.firstName} ${job.client.user.lastName}`
      : `${job.professional.user.firstName} ${job.professional.user.lastName}`;

    await import('@/lib/services/mail').then(mod =>
      mod.sendNotificationEmail(
        targetEmail,
        'Job Cancelled - SkillFind.pro',
        `Hello ${targetName}, \n\nThe job (ID: ${job.id}) has been cancelled by ${actorName}. \n\nReason: "${data.reason}" \n\nPlease visit the dashboard for more details.`,
        '/dashboard/jobs'
      )
    ).catch(err => console.error('Failed to send cancellation email:', err));

    return successResponse(
      {
        job: {
          id: updatedJob.id,
          status: updatedJob.status,
        },
        cancellation: {
          cancelledBy,
          reason: data.reason,
          refundRequested: data.refundRequested,
        },
        message: data.refundRequested
          ? 'Job cancelled. Refund request will be reviewed by admin.'
          : 'Job cancelled successfully.',
      },
      'Job cancelled successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
