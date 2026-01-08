import { prisma } from '@/lib/prisma';
import CategoriesClient from './CategoriesClient';

export default async function AdminCategoriesPage() {
    const categories = await prisma.category.findMany({
        include: {
            subcategories: {
                orderBy: { nameEn: 'asc' },
            },
            _count: {
                select: { requests: true },
            },
        },
        orderBy: { sortOrder: 'asc' },
    }) as any;

    return <CategoriesClient categories={categories} />;
}
