import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireProfessional } from '@/lib/auth';
import { successResponse, handleApiError, createdResponse, errorResponse } from '@/lib/api-response';
import { NotFoundError, BadRequestError } from '@/lib/errors';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// GET /api/professionals/documents - List professional's documents
export async function GET() {
    try {
        const { userId } = await requireProfessional();

        const professional = await prisma.professional.findUnique({
            where: { userId },
        });

        if (!professional) {
            throw new NotFoundError('Professional profile');
        }

        const documents = await prisma.verificationDocument.findMany({
            where: { professionalId: professional.id },
            orderBy: { uploadedAt: 'desc' },
        });

        return successResponse({ documents });
    } catch (error) {
        return handleApiError(error);
    }
}

// POST /api/professionals/documents - Upload qualification document
export async function POST(request: NextRequest) {
    try {
        const { userId } = await requireProfessional();

        const professional = await prisma.professional.findUnique({
            where: { userId },
        });

        if (!professional) {
            throw new NotFoundError('Professional profile');
        }

        // Parse FormData
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const docType = (formData.get('type') as string) || 'DIPLOMA';

        if (!file) {
            throw new BadRequestError('No file provided');
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            return errorResponse(400, 'FILE_TOO_LARGE', 'File size must be less than 10MB');
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            return errorResponse(400, 'INVALID_FILE_TYPE', 'Only PDF and image files are allowed');
        }

        // Generate unique filename
        const fileExtension = file.name.split('.').pop();
        const uniqueFilename = `${uuidv4()}.${fileExtension}`;

        // Save file to public/uploads directory
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'documents');
        const filePath = join(uploadDir, uniqueFilename);

        // Create directory if it doesn't exist
        try {
            await writeFile(filePath, buffer);
        } catch (error) {
            console.error('File write error:', error);
            throw new Error('Failed to save file');
        }

        // Create database record
        const document = await prisma.verificationDocument.create({
            data: {
                professionalId: professional.id,
                type: docType as any,
                fileName: file.name,
                fileUrl: `/uploads/documents/${uniqueFilename}`,
                fileSize: file.size,
                mimeType: file.type,
                status: 'PENDING',
            },
        });

        return createdResponse(
            { document },
            'Document uploaded successfully. Awaiting admin review.'
        );
    } catch (error) {
        return handleApiError(error);
    }
}
