import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { z } from 'zod';

const updateSubcategorySchema = z.object({
    nameEn: z.string().min(1).optional(),
    nameFr: z.string().optional(),
    description: z.string().optional(),
    slug: z.string().min(1).optional(),
    isActive: z.boolean().optional(),
});

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

export async function PUT(request: NextRequest, context: RouteParams) {
    try {
        await requireAdmin();
        const { id } = await context.params;

        const body = await request.json();
        const data = updateSubcategorySchema.parse(body);

        const subcategory = await prisma.subcategory.update({
            where: { id },
            data,
        });

        return successResponse({ subcategory }, 'Subcategory updated successfully');
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(request: NextRequest, context: RouteParams) {
    try {
        await requireAdmin();
        const { id } = await context.params;

        // Check for dependencies
        const subcategory = await prisma.subcategory.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { requests: true, professionalServices: true },
                },
            },
        });

        if (!subcategory) {
            throw new Error('Subcategory not found');
        }

        if (subcategory._count.professionalServices > 0 || subcategory._count.requests > 0) {
            throw new Error(`Cannot delete subcategory with dependencies.`);
        }

        await prisma.subcategory.delete({
            where: { id },
        });

        return successResponse(null, 'Subcategory deleted successfully');
    } catch (error) {
        return handleApiError(error);
    }
}
