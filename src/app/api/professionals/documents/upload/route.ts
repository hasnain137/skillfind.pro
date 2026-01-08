// POST /api/professionals/documents/upload
// Upload verification documents (ID, certificates, etc.)
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireProfessional } from '@/lib/auth';
import { successResponse, handleApiError, createdResponse } from '@/lib/api-response';
import { z } from 'zod';
import { NotFoundError, BadRequestError } from '@/lib/errors';

// Validation schema
const uploadDocumentSchema = z.object({
  type: z.enum([
    'IDENTITY_CARD',
    'PASSPORT',
    'DRIVERS_LICENSE',
    'BUSINESS_LICENSE',
    'DIPLOMA',
    'CERTIFICATION',
    'PORTFOLIO_SAMPLE',
    'OTHER',
  ]),
  fileUrl: z.string().url('Invalid file URL'),
  fileName: z.string().min(1, 'File name is required'),
  fileSize: z.number().int().positive().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireProfessional();

    // Get professional profile
    const professional = await prisma.professional.findUnique({
      where: { userId },
    });

    if (!professional) {
      throw new NotFoundError('Professional profile');
    }

    // Parse and validate request body
    const body = await request.json();
    const data = uploadDocumentSchema.parse(body);

    // Check if professional already has 10 documents (limit)
    const documentCount = await prisma.verificationDocument.count({
      where: { professionalId: professional.id },
    });

    if (documentCount >= 10) {
      throw new BadRequestError('Maximum of 10 documents allowed. Please delete old documents first.');
    }

    // Create document record
    const document = await prisma.verificationDocument.create({
      data: {
        professionalId: professional.id,
        type: data.type,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        status: 'PENDING', // Admin will verify
      },
    });

    // Update professional profile completion if first document
    if (documentCount === 0) {
      // Recalculate profile completion
      const services = await prisma.professionalService.count({
        where: { professionalId: professional.id },
      });

      // Get professional profile for hourly rate
      const profile = await prisma.professionalProfile.findUnique({
        where: { professionalId: professional.id },
      });

      let completionPercent = 0;
      if (professional.title) completionPercent += 20;
      if (professional.bio) completionPercent += 20;
      if (profile?.hourlyRateMin || profile?.hourlyRateMax) completionPercent += 15;
      if (services > 0) completionPercent += 25;
      if (documentCount + 1 > 0) completionPercent += 20; // Documents uploaded

      await prisma.professional.update({
        where: { id: professional.id },
        data: { profileCompletion: completionPercent },
      });
    }

    return createdResponse(
      {
        document: {
          id: document.id,
          type: document.type,
          fileName: document.fileName,
          status: document.status,
          uploadedAt: document.uploadedAt,
        },
      },
      'Document uploaded successfully. It will be reviewed by our admin team.'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

// GET /api/professionals/documents/upload - List professional's documents
export async function GET() {
  try {
    const { userId } = await requireProfessional();

    // Get professional profile
    const professional = await prisma.professional.findUnique({
      where: { userId },
    });

    if (!professional) {
      throw new NotFoundError('Professional profile');
    }

    // Get all documents
    const documents = await prisma.verificationDocument.findMany({
      where: { professionalId: professional.id },
      orderBy: { uploadedAt: 'desc' },
    });

    return successResponse({
      documents: documents.map((doc) => ({
        id: doc.id,
        type: doc.type,
        fileName: doc.fileName,
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

// DELETE /api/professionals/documents/upload?documentId=xxx - Delete a document
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await requireProfessional();

    // Get professional profile
    const professional = await prisma.professional.findUnique({
      where: { userId },
    });

    if (!professional) {
      throw new NotFoundError('Professional profile');
    }

    // Get document ID from query
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      throw new BadRequestError('Document ID is required');
    }

    // Find document
    const document = await prisma.verificationDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundError('Document');
    }

    // Check ownership
    if (document.professionalId !== professional.id) {
      throw new BadRequestError('You can only delete your own documents');
    }

    // Can't delete approved documents
    if (document.status === 'APPROVED') {
      throw new BadRequestError('Cannot delete approved documents. Contact support if needed.');
    }

    // Delete document
    await prisma.verificationDocument.delete({
      where: { id: documentId },
    });

    return successResponse(
      { message: 'Document deleted successfully' },
      'Document deleted successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
