import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://skillfind.pro';

    // Static pages
    const staticPages = [
        '',
        '/search',
        '/categories',
        '/login',
        '/signup',
    ];

    const staticRoutes = staticPages.flatMap((route) => [
        {
            url: `${baseUrl}/en${route}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: route === '' ? 1 : 0.8,
        },
        {
            url: `${baseUrl}/fr${route}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: route === '' ? 1 : 0.8,
        },
    ]);

    // Dynamic category pages
    let categoryRoutes: MetadataRoute.Sitemap = [];
    try {
        const categories = await prisma.category.findMany({
            where: { isActive: true },
            select: { slug: true, updatedAt: true },
        });

        categoryRoutes = categories.flatMap((category) => [
            {
                url: `${baseUrl}/en/categories/${category.slug}`,
                lastModified: category.updatedAt,
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            },
            {
                url: `${baseUrl}/fr/categories/${category.slug}`,
                lastModified: category.updatedAt,
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            },
        ]);
    } catch (error) {
        console.error('Error fetching categories for sitemap:', error);
    }

    // Dynamic professional pages
    let professionalRoutes: MetadataRoute.Sitemap = [];
    try {
        const professionals = await prisma.professional.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true, updatedAt: true },
            take: 1000, // Limit for performance
        });

        professionalRoutes = professionals.flatMap((pro) => [
            {
                url: `${baseUrl}/en/professionals/${pro.id}`,
                lastModified: pro.updatedAt,
                changeFrequency: 'weekly' as const,
                priority: 0.6,
            },
            {
                url: `${baseUrl}/fr/professionals/${pro.id}`,
                lastModified: pro.updatedAt,
                changeFrequency: 'weekly' as const,
                priority: 0.6,
            },
        ]);
    } catch (error) {
        console.error('Error fetching professionals for sitemap:', error);
    }

    return [...staticRoutes, ...categoryRoutes, ...professionalRoutes];
}
