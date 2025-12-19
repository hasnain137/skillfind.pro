
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q')?.trim();

        if (!query || query.length < 2) {
            return NextResponse.json({ suggestions: [] });
        }

        const term = query;
        const LIMIT_PER_TYPE = 3;

        // Use Raw SQL for Typo Tolerance (pg_trgm)
        // We search Categories, Subcategories, and Pros

        // 1. Categories
        const categoriesFn = prisma.$queryRaw<{ id: string, nameEn: string, score: number }[]>`
        SELECT id, "nameEn", SIMILARITY("nameEn", ${term}) as score
        FROM "categories"
        WHERE "isActive" = true AND (
            "nameEn" % ${term} OR 
            "nameFr" % ${term} OR
            "nameEn" ILIKE ${'%' + term + '%'}
        )
        ORDER BY score DESC
        LIMIT ${LIMIT_PER_TYPE};
    `;

        // 2. Subcategories
        const subcategoriesFn = prisma.$queryRaw<{ id: string, nameEn: string, score: number }[]>`
        SELECT id, "nameEn", SIMILARITY("nameEn", ${term}) as score
        FROM "subcategories"
        WHERE "isActive" = true AND (
            "nameEn" % ${term} OR 
            "nameFr" % ${term} OR
            "nameEn" ILIKE ${'%' + term + '%'} 
        )
        ORDER BY score DESC
        LIMIT ${LIMIT_PER_TYPE};
    `;

        // 3. Professionals
        const professionalsFn = prisma.$queryRaw<{ id: string, businessName: string | null, title: string | null, firstName: string, lastName: string, score: number }[]>`
        SELECT 
            p.id, 
            p."businessName", 
            p."title", 
            u."firstName", 
            u."lastName",
            GREATEST(
                SIMILARITY(p."businessName", ${term}),
                SIMILARITY(p."title", ${term}),
                SIMILARITY(u."firstName", ${term})
            ) as score
        FROM "professionals" p
        JOIN "users" u ON p."userId" = u."id"
        WHERE 
            p."status" = 'ACTIVE' AND (
                p."businessName" % ${term} OR
                p."title" % ${term} OR
                u."firstName" % ${term} OR
                u."lastName" % ${term} OR
                p."businessName" ILIKE ${'%' + term + '%'}
            )
        ORDER BY score DESC
        LIMIT ${LIMIT_PER_TYPE};
    `;

        const [categories, subcategories, professionals] = await Promise.all([
            categoriesFn,
            subcategoriesFn,
            professionalsFn
        ]);

        // Format Response
        const suggestions = [
            ...categories.map(c => ({
                type: 'CATEGORY',
                label: c.nameEn,
                subLabel: 'Category',
                url: `/search?category=${c.id}`,
                id: c.id,
                score: c.score
            })),
            ...subcategories.map(s => ({
                type: 'SUBCATEGORY',
                label: s.nameEn,
                subLabel: 'Service',
                url: `/search?subcategory=${s.id}`,
                id: s.id,
                score: s.score
            })),
            ...professionals.map(p => ({
                type: 'PROFESSIONAL',
                label: p.businessName || `${p.firstName} ${p.lastName}`,
                subLabel: p.title || 'Professional',
                url: `/search?search=${encodeURIComponent(p.businessName || '')}`,
                id: p.id,
                score: p.score
            }))
        ];

        // Optional: Global Sort by Score
        suggestions.sort((a, b) => b.score - a.score);

        return NextResponse.json({ suggestions });

    } catch (error) {
        console.error('Autosuggest Error:', error);
        return NextResponse.json({ suggestions: [] }, { status: 500 });
    }
}

