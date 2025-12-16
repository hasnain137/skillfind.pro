
import { NextRequest, NextResponse } from 'next/server';
import { requireProfessional } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

// Configuration
const UPLOAD_DIR = 'public/uploads';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
];

export async function POST(request: NextRequest) {
    try {
        // 1. Authentication Check
        await requireProfessional();

        // 2. Parse Form Data
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // 3. Validation
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only JPG, PNG, WEBP, and PDF are allowed.' },
                { status: 400 }
            );
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: 'File size too large. Maximum size is 5MB.' },
                { status: 400 }
            );
        }

        // 4. File Processing directly
        const buffer = Buffer.from(await file.arrayBuffer());

        // Generate safe filename
        // Sanitize original name or use generic one
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const extension = path.extname(originalName) || '';
        const uniqueFilename = `${Date.now()}-${randomUUID()}${extension}`;

        // Ensure directory exists
        const uploadPath = path.join(process.cwd(), UPLOAD_DIR);
        await mkdir(uploadPath, { recursive: true });

        // 5. Write File
        const filePath = path.join(uploadPath, uniqueFilename);
        await writeFile(filePath, buffer);

        // 6. Return Public URL
        const publicUrl = `/uploads/${uniqueFilename}`;

        return NextResponse.json({
            url: publicUrl,
            filename: uniqueFilename,
            originalName: file.name,
            size: file.size,
            mimeType: file.type
        });

    } catch (error) {
        console.error('Upload error:', error);

        // Handle auth errors explicitly if possible, otherwise generic 500
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        return NextResponse.json(
            { error: 'Internal server error during upload.' },
            { status: 500 }
        );
    }
}
