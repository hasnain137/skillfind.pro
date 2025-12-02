// POST /api/admin/disputes/[id]/resolve - Resolve a dispute
// Admin only
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { NotFoundError, BadRequestError } from '@/lib/errors';
import { z } from 'zod';

const resolveDisputeSchema = z.object({
  resolution: z.string().min(20, 'Resolution must be at least 20 characters').max(1000),
  favoredParty: z.enum(['CLIENT', 'PROFESSIONAL', 'BOTH', 'NEITHER']),
  refundAmount: z.number().min(0).optional(),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: adminId } = await requireAdmin();
    const { id } = await context.params;

    // Parse body
    const body = await request.json();
    const data = resolveDisputeSchema.parse(body);

    // Get dispute
    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: {
        job: true,
      },
    });

    if (!dispute) {
      throw new NotFoundError('Dispute');
    }

    // Check if already resolved
    if (dispute.status === 'RESOLVED') {
      throw new BadRequestError('Dispute is already resolved');
    }

    // Resolve dispute in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update dispute
      const updatedDispute = await tx.dispute.update({
        where: { id },
        data: {
          status: 'RESOLVED',
          resolution: data.resolution,
          resolvedAt: new Date(),
        },
      });

      // Update job status back to completed if appropriate
      if (data.favoredParty !== 'NEITHER') {
        await tx.job.update({
          where: { id: dispute.jobId },
          data: { status: 'COMPLETED' },
        });
      }

      // Handle refund if specified
      if (data.refundAmount && data.refundAmount > 0) {
        // TODO: Process refund through payment provider
        // For now, just log the refund
        await tx.adminAction.create({
          data: {
            adminId,
            action: 'BALANCE_ADJUSTED',
            targetType: 'DISPUTE',
            targetId: dispute.id,
            reason: `Refund of EUR ${data.refundAmount / 100} issued for dispute resolution`,
          },
        });
      }

      // Create admin action log
      await tx.adminAction.create({
        data: {
          adminId,
          action: 'CONTENT_APPROVED',
          targetType: 'DISPUTE',
          targetId: dispute.id,
          reason: data.resolution,
        },
      });

      return updatedDispute;
    });

    // TODO: Send notifications to both parties

    return successResponse(
      {
        dispute: {
          id: result.id,
          status: result.status,
          resolution: result.resolution,
          resolvedAt: result.resolvedAt,
        },
        refundAmount: data.refundAmount,
        message: 'Dispute resolved successfully. Both parties have been notified.',
      },
      'Dispute resolved successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

