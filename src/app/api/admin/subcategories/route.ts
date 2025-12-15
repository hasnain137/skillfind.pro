import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { z } from 'zod';

const createSubcategorySchema = z.object({
    categoryId: z.string().min(1),
    nameEn: z.string().min(1),
    nameFr: z.string().optional(),
    slug: z.string().min(1),
    description: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        await requireAdmin();

        const body = await request.json();
        const data = createSubcategorySchema.parse(body);

        const subcategory = await prisma.subcategory.create({
            data: {
                ...data,
                sortOrder: 0,
            },
        });

        return successResponse({ subcategory }, 'Subcategory created successfully');
    } catch (error) {
        return handleApiError(error);
    }
}
