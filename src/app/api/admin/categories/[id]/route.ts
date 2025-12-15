import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { z } from 'zod';

const updateCategorySchema = z.object({
    nameEn: z.string().min(1).optional(),
    nameFr: z.string().optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
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
        const data = updateCategorySchema.parse(body);

        const category = await prisma.category.update({
            where: { id },
            data,
        });

        return successResponse({ category }, 'Category updated successfully');
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(request: NextRequest, context: RouteParams) {
    try {
        await requireAdmin();
        const { id } = await context.params;

        // Check for dependencies
        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { subcategories: true, requests: true },
                },
            },
        });

        if (!category) {
            throw new Error('Category not found');
        }

        if (category._count.subcategories > 0 || category._count.requests > 0) {
            // Cannot delete if dependencies exist
            throw new Error(`Cannot delete category with ${category._count.subcategories} subcategories and ${category._count.requests} requests.`);
        }

        await prisma.category.delete({
            where: { id },
        });

        return successResponse(null, 'Category deleted successfully');
    } catch (error) {
        return handleApiError(error);
    }
}
