
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

        // Limit results for speed
        const LIMIT_PER_TYPE = 3;

        // Parallel queries for speed
        const [categories, subcategories, professionals] = await Promise.all([
            // 1. Categories
            prisma.category.findMany({
                where: {
                    OR: [
                        { nameEn: { contains: query, mode: 'insensitive' } },
                        { nameFr: { contains: query, mode: 'insensitive' } }
                    ],
                    isActive: true
                },
                take: LIMIT_PER_TYPE,
                select: { id: true, nameEn: true, slug: true }
            }),

            // 2. Subcategories
            prisma.subcategory.findMany({
                where: {
                    OR: [
                        { nameEn: { contains: query, mode: 'insensitive' } },
                        { nameFr: { contains: query, mode: 'insensitive' } }
                    ],
                    isActive: true
                },
                take: LIMIT_PER_TYPE,
                select: { id: true, nameEn: true, slug: true, category: { select: { slug: true } } }
            }),

            // 3. Professionals (Business Name or Title)
            prisma.professional.findMany({
                where: {
                    OR: [
                        { businessName: { contains: query, mode: 'insensitive' } },
                        { title: { contains: query, mode: 'insensitive' } }
                    ],
                    status: 'ACTIVE'
                },
                take: LIMIT_PER_TYPE,
                select: { id: true, businessName: true, title: true, user: { select: { firstName: true, lastName: true } } }
            })
        ]);

        // Format Response
        const suggestions = [
            ...categories.map(c => ({
                type: 'CATEGORY',
                label: c.nameEn,
                subLabel: 'Category',
                url: `/search?category=${c.id}`,
                id: c.id
            })),
            ...subcategories.map(s => ({
                type: 'SUBCATEGORY',
                label: s.nameEn,
                subLabel: 'Service',
                url: `/search?subcategory=${s.id}`,
                id: s.id
            })),
            ...professionals.map(p => ({
                type: 'PROFESSIONAL',
                label: p.businessName || `${p.user.firstName} ${p.user.lastName}`,
                subLabel: p.title || 'Professional',
                // Direct link to pro profile would be better, but for search suggestion we might want to just search for them
                // or go to their profile. Let's start with searching for them to show the card.
                // Actually, "Going to profile" is usually expected behavior for a specific person.
                // But we don't have a public profile route clearly defined in my context yet (e.g. /pro/slug).
                // Let's stick to search filter for now.
                url: `/search?search=${encodeURIComponent(p.businessName || '')}`,
                id: p.id
            }))
        ];

        return NextResponse.json({ suggestions });

    } catch (error) {
        console.error('Autosuggest Error:', error);
        return NextResponse.json({ suggestions: [] }, { status: 500 });
    }
}
