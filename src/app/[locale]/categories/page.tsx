// src/app/[locale]/categories/page.tsx
// All categories browse page
import { prisma } from '@/lib/prisma';
import { Container } from '@/components/ui/Container';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/Card';
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import {
    Briefcase,
    GraduationCap,
    Heart,
    Home,
    Camera,
    Code,
    Music,
    Car,
    Wrench,
    Palette,
    Users,
    Sparkles
} from 'lucide-react';

// Map category slugs to icons
const categoryIcons: Record<string, React.ElementType> = {
    'tutoring': GraduationCap,
    'coaching': Users,
    'wellness': Heart,
    'home-services': Home,
    'tech': Code,
    'creative': Palette,
    'music': Music,
    'photography': Camera,
    'automotive': Car,
    'repairs': Wrench,
    'beauty': Sparkles,
    'default': Briefcase,
};

async function getCategories() {
    const categories = await prisma.category.findMany({
        where: { isActive: true },
        include: {
            subcategories: {
                where: { isActive: true },
                orderBy: { sortOrder: 'asc' },
            },
            _count: {
                select: {
                    requests: true,
                },
            },
        },
        orderBy: { sortOrder: 'asc' },
    });

    // Get professional counts per category
    const categoriesWithCounts = await Promise.all(
        categories.map(async (cat) => {
            const proCount = await prisma.professional.count({
                where: {
                    status: 'ACTIVE',
                    services: {
                        some: {
                            subcategory: {
                                categoryId: cat.id,
                            },
                        },
                    },
                },
            });
            return { ...cat, professionalCount: proCount };
        })
    );

    return categoriesWithCounts;
}

export default async function CategoriesPage() {
    const t = await getTranslations('Categories');
    const categories = await getCategories();

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 bg-[#FAFAFA] py-8">
                <Container>
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-[#333333] mb-2">
                            {t('title')}
                        </h1>
                        <p className="text-[#7C7373] max-w-2xl mx-auto">
                            {t('subtitle')}
                        </p>
                    </div>

                    {/* Categories Grid */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {categories.map((category) => {
                            const IconComponent = categoryIcons[category.slug] || categoryIcons.default;

                            return (
                                <Link key={category.id} href={`/categories/${category.slug}`}>
                                    <Card
                                        padding="lg"
                                        className="h-full transition-all hover:shadow-lg hover:border-[#2563EB]/30 hover:-translate-y-1 cursor-pointer group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                                                <IconComponent className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-[#333333] group-hover:text-[#2563EB] transition-colors">
                                                    {category.nameEn}
                                                </h3>
                                                <p className="text-xs text-[#7C7373] mt-1">
                                                    {category.professionalCount} {t('professionals')}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Subcategories preview */}
                                        {category.subcategories.length > 0 && (
                                            <div className="mt-4 pt-3 border-t border-[#E5E7EB]">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {category.subcategories.slice(0, 3).map((sub) => (
                                                        <span
                                                            key={sub.id}
                                                            className="inline-flex text-[10px] px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#7C7373]"
                                                        >
                                                            {sub.nameEn}
                                                        </span>
                                                    ))}
                                                    {category.subcategories.length > 3 && (
                                                        <span className="text-[10px] text-[#7C7373]">
                                                            +{category.subcategories.length - 3} {t('more')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                </Container>
            </main>
        </div>
    );
}
