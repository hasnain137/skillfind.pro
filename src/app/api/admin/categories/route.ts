import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { z } from 'zod';

const createCategorySchema = z.object({
    nameEn: z.string().min(1),
    slug: z.string().min(1),
    icon: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        await requireAdmin();

        const body = await request.json();
        const data = createCategorySchema.parse(body);

        const category = await prisma.category.create({
            data: {
                ...data,
                sortOrder: 0, // Default sort order
            },
        });

        return successResponse({ category }, 'Category created successfully');
    } catch (error) {
        return handleApiError(error);
    }
}
