// POST /api/admin/users/[id]/verify
// Admin endpoint to verify professional documents
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { z } from 'zod';
import { NotFoundError, BadRequestError } from '@/lib/errors';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Validation schema
const verifyUserSchema = z.object({
  documentId: z.string().min(1, 'Document ID is required'),
  action: z.enum(['APPROVE', 'REJECT']),
  rejectionReason: z.string().min(10).max(500).optional(),
});

export async function POST(request: NextRequest, context: RouteParams) {
  try {
    const { userId: adminUserId } = await requireAdmin();
    const { id: userId } = await context.params;

    // Validate user ID
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid user ID',
          message: 'User ID must be provided',
        },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const data = verifyUserSchema.parse(body);

    // Validate rejection reason for REJECT action
    if (data.action === 'REJECT' && !data.rejectionReason) {
      throw new BadRequestError('Rejection reason is required when rejecting documents');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        professionalProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Get professional profile
    const professional = await prisma.professional.findUnique({
      where: { userId: user.id },
    });

    // Check if user is a professional
    if (user.role !== 'PROFESSIONAL' || !professional) {
      throw new BadRequestError('User is not a professional');
    }

    // Find document
    const document = await prisma.verificationDocument.findUnique({
      where: { id: data.documentId },
    });

    if (!document) {
      throw new NotFoundError('Document');
    }

    // Check if document belongs to this professional
    if (document.professionalId !== professional.id) {
      throw new BadRequestError('Document does not belong to this professional');
    }

    // Check if document is already verified or rejected
    if (document.status === 'APPROVED') {
      throw new BadRequestError('Document is already approved');
    }

    // Update document status
    const updatedDocument = await prisma.verificationDocument.update({
      where: { id: data.documentId },
      data: {
        status: data.action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        reviewedAt: data.action === 'APPROVE' ? new Date() : null,
        reviewedBy: data.action === 'APPROVE' ? adminUserId : null,
        rejectionReason: data.action === 'REJECT' ? data.rejectionReason : null,
      },
    });

    // If approved, check if this is the first verified document
    if (data.action === 'APPROVE') {
      const verifiedCount = await prisma.verificationDocument.count({
        where: {
          professionalId: professional.id,
          status: 'APPROVED',
        },
      });

      // If this is the first verified document, mark professional as verified
      if (verifiedCount === 1) {
        await prisma.professional.update({
          where: { id: professional.id },
          data: {
            isVerified: true,
            verifiedAt: new Date(),
          },
        });
      }

      // Recalculate profile completion
      const services = await prisma.professionalService.count({
        where: { professionalId: professional.id },
      });

      // Get professional profile for additional fields
      const professionalProfile = await prisma.professionalProfile.findUnique({
        where: { professionalId: professional.id },
      });

      let completionPercent = 0;
      if (professional.title) completionPercent += 20;
      if (professional.bio) completionPercent += 20;
      if (professionalProfile?.hourlyRateMin) completionPercent += 15;
      if (services > 0) completionPercent += 25;
      if (verifiedCount > 0) completionPercent += 20;

      await prisma.professional.update({
        where: { id: professional.id },
        data: { profileCompletion: completionPercent },
      });
    }

    // TODO: Send email notification to professional

    return successResponse(
      {
        document: {
          id: updatedDocument.id,
          type: updatedDocument.type,
          status: updatedDocument.status,
          reviewedAt: updatedDocument.reviewedAt,
          rejectionReason: updatedDocument.rejectionReason,
        },
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
      data.action === 'APPROVE'
        ? 'Document verified successfully'
        : 'Document rejected successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

// GET /api/admin/users/[id]/verify - Get all documents for a professional
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    await requireAdmin();
    const { id: userId } = await context.params;

    // Validate user ID
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid user ID',
          message: 'User ID must be provided',
        },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    if (user.role !== 'PROFESSIONAL') {
      throw new BadRequestError('User is not a professional');
    }

    // Get professional with documents
    const professional = await prisma.professional.findUnique({
      where: { userId: user.id },
      include: {
        documents: {
          orderBy: {
            uploadedAt: 'desc',
          },
        },
      },
    });

    if (!professional) {
      throw new BadRequestError('Professional profile not found');
    }

    return successResponse({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      professional: {
        id: professional.id,
        isVerified: professional.isVerified,
        verifiedAt: professional.verifiedAt,
      },
      documents: professional.documents.map((doc) => ({
        id: doc.id,
        type: doc.type,
        fileName: doc.fileName,
        fileUrl: doc.fileUrl,
        fileSize: doc.fileSize,
        status: doc.status,
        uploadedAt: doc.uploadedAt,
        reviewedAt: doc.reviewedAt,
        reviewedBy: doc.reviewedBy,
        rejectionReason: doc.rejectionReason,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
