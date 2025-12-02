// POST /api/jobs/[id]/dispute - Raise a dispute (either party)
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { NotFoundError, ForbiddenError, BadRequestError } from '@/lib/errors';
import { z } from 'zod';

const createDisputeSchema = z.object({
  reason: z.enum([
    'WORK_NOT_COMPLETED',
    'WORK_NOT_SATISFACTORY',
    'PAYMENT_ISSUE',
    'COMMUNICATION_BREAKDOWN',
    'OTHER',
  ]),
  description: z.string().min(50, 'Description must be at least 50 characters').max(1000),
  evidenceUrls: z.array(z.string().url()).max(5).optional(),
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
    const data = createDisputeSchema.parse(body);

    // Get job
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        disputes: true,
      },
    });

    if (!job) {
      throw new NotFoundError('Job');
    }

    // Verify access
    let raisedBy: 'CLIENT' | 'PROFESSIONAL';

    if (role === 'CLIENT') {
      const client = await prisma.client.findUnique({
        where: { userId },
      });

      if (job.clientId !== client?.id) {
        throw new ForbiddenError('You can only dispute your own jobs');
      }

      raisedBy = 'CLIENT';
    } else if (role === 'PROFESSIONAL') {
      const professional = await prisma.professional.findUnique({
        where: { userId },
      });

      if (job.professionalId !== professional?.id) {
        throw new ForbiddenError('You can only dispute your own jobs');
      }

      raisedBy = 'PROFESSIONAL';
    } else {
      throw new ForbiddenError('Only clients and professionals can raise disputes');
    }

    // Check if job can be disputed
    if (job.status === 'CANCELLED') {
      throw new BadRequestError('Cannot dispute a cancelled job');
    }

    if (job.status === 'DISPUTED') {
      // Check if there's already an open dispute
      const openDispute = job.disputes.find((d) => d.status === 'OPEN' || d.status === 'UNDER_REVIEW');
      if (openDispute) {
        throw new BadRequestError('There is already an open dispute for this job');
      }
    }

    // Create dispute in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create dispute
      const dispute = await tx.dispute.create({
        data: {
          jobId: job.id,
          raisedBy,
          reason: data.reason,
          description: data.description,
          evidenceUrls: data.evidenceUrls || [],
          status: 'OPEN',
        },
      });

      // Update job status to DISPUTED
      const updatedJob = await tx.job.update({
        where: { id },
        data: { status: 'DISPUTED' },
      });

      return { dispute, updatedJob };
    });

    // TODO: Notify admin about new dispute
    // TODO: Notify other party about dispute

    return successResponse(
      {
        dispute: {
          id: result.dispute.id,
          reason: result.dispute.reason,
          description: result.dispute.description,
          status: result.dispute.status,
          raisedBy: result.dispute.raisedBy,
          createdAt: result.dispute.createdAt,
        },
        job: {
          id: result.updatedJob.id,
          status: result.updatedJob.status,
        },
        message: 'Dispute raised successfully. Our admin team will review it within 24-48 hours.',
      },
      'Dispute created successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
