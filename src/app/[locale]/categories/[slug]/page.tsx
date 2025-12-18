// src/app/[locale]/categories/[slug]/page.tsx
// Individual category page with professionals
import { prisma } from '@/lib/prisma';
import { Container } from '@/components/ui/Container';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Star, MapPin, CheckCircle } from 'lucide-react';

async function getCategoryWithProfessionals(slug: string) {
    const category = await prisma.category.findFirst({
        where: { slug, isActive: true },
        include: {
            subcategories: {
                where: { isActive: true },
                orderBy: { sortOrder: 'asc' },
            },
        },
    });

    if (!category) return null;

    // Get professionals in this category
    const professionals = await prisma.professional.findMany({
        where: {
            status: 'ACTIVE',
            services: {
                some: {
                    subcategory: {
                        categoryId: category.id,
                    },
                },
            },
        },
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    avatar: true,
                },
            },
            services: {
                where: {
                    subcategory: {
                        categoryId: category.id,
                    },
                },
                include: {
                    subcategory: true,
                },
            },
        },
        orderBy: [
            { averageRating: 'desc' },
            { totalReviews: 'desc' },
        ],
        take: 20,
    });

    return { category, professionals };
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
    const { slug } = await params;
    const t = await getTranslations('Categories');
    const data = await getCategoryWithProfessionals(slug);

    if (!data) {
        notFound();
    }

    const { category, professionals } = data;

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 bg-[#FAFAFA]">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 py-12 text-white">
                    <Container>
                        <Link
                            href="/categories"
                            className="text-sm text-white/70 hover:text-white mb-4 inline-block"
                        >
                            ← {t('backToCategories')}
                        </Link>
                        <h1 className="text-3xl font-bold mb-2">{category.nameEn}</h1>
                        {category.descriptionEn && (
                            <p className="text-white/80 max-w-2xl">
                                {category.descriptionEn}
                            </p>
                        )}
                        <div className="mt-4 flex gap-2 text-sm">
                            <Badge className="bg-white/20 text-white border-0">
                                {professionals.length} {t('professionalsAvailable')}
                            </Badge>
                            <Badge className="bg-white/20 text-white border-0">
                                {category.subcategories.length} {t('subcategories')}
                            </Badge>
                        </div>
                    </Container>
                </div>

                <Container className="py-8">
                    <div className="grid gap-8 lg:grid-cols-4">
                        {/* Sidebar - Subcategories */}
                        <div className="lg:col-span-1">
                            <Card padding="lg" className="sticky top-4">
                                <h3 className="font-semibold text-[#333333] mb-4">
                                    {t('subcategoriesTitle')}
                                </h3>
                                <div className="space-y-2">
                                    {category.subcategories.map((sub) => (
                                        <Link
                                            key={sub.id}
                                            href={`/search?subcategory=${sub.id}`}
                                            className="block text-sm text-[#7C7373] hover:text-[#2563EB] hover:bg-[#F3F4F6] px-3 py-2 rounded-lg transition-colors"
                                        >
                                            {sub.nameEn}
                                        </Link>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                                    <Link
                                        href={`/search?category=${category.id}`}
                                        className="text-sm text-[#2563EB] hover:underline"
                                    >
                                        {t('viewAllInCategory')}
                                    </Link>
                                </div>
                            </Card>
                        </div>

                        {/* Main Content - Professionals */}
                        <div className="lg:col-span-3">
                            <h2 className="text-xl font-semibold text-[#333333] mb-4">
                                {t('topProfessionals')}
                            </h2>

                            {professionals.length === 0 ? (
                                <Card padding="lg" className="text-center">
                                    <p className="text-[#7C7373]">{t('noProfessionals')}</p>
                                </Card>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {professionals.map((pro) => (
                                        <Link key={pro.id} href={`/professionals/${pro.id}`}>
                                            <Card
                                                padding="lg"
                                                className="h-full hover:shadow-lg hover:border-[#2563EB]/30 transition-all cursor-pointer"
                                            >
                                                <div className="flex items-start gap-4">
                                                    {/* Avatar */}
                                                    <div className="relative">
                                                        {pro.user.avatar ? (
                                                            <img
                                                                src={pro.user.avatar}
                                                                alt={`${pro.user.firstName} ${pro.user.lastName}`}
                                                                className="h-14 w-14 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="h-14 w-14 rounded-full bg-[#2563EB]/10 flex items-center justify-center text-lg font-semibold text-[#2563EB]">
                                                                {pro.user.firstName?.[0]}{pro.user.lastName?.[0]}
                                                            </div>
                                                        )}
                                                        {pro.isVerified && (
                                                            <CheckCircle className="absolute -bottom-0.5 -right-0.5 h-5 w-5 text-green-500 bg-white rounded-full" />
                                                        )}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-[#333333] truncate">
                                                            {pro.user.firstName} {pro.user.lastName}
                                                        </h3>
                                                        {pro.title && (
                                                            <p className="text-sm text-[#7C7373] truncate">
                                                                {pro.title}
                                                            </p>
                                                        )}

                                                        {/* Rating */}
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="flex items-center gap-1">
                                                                <Star className="h-3.5 w-3.5 text-yellow-400 fill-current" />
                                                                <span className="text-sm font-medium text-[#333333]">
                                                                    {pro.averageRating?.toFixed(1) || 'New'}
                                                                </span>
                                                            </div>
                                                            {pro.totalReviews > 0 && (
                                                                <span className="text-xs text-[#7C7373]">
                                                                    ({pro.totalReviews} {t('reviews')})
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Location */}
                                                        {pro.city && (
                                                            <div className="flex items-center gap-1 mt-1 text-xs text-[#7C7373]">
                                                                <MapPin className="h-3 w-3" />
                                                                {pro.city}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Services */}
                                                {pro.services.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
                                                        <div className="flex flex-wrap gap-1">
                                                            {pro.services.slice(0, 2).map((service) => (
                                                                <Badge
                                                                    key={service.id}
                                                                    variant="secondary"
                                                                    className="text-[10px]"
                                                                >
                                                                    {service.subcategory.nameEn}
                                                                </Badge>
                                                            ))}
                                                            {pro.services.length > 2 && (
                                                                <span className="text-xs text-[#7C7373]">
                                                                    +{pro.services.length - 2}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </Container>
            </main>
        </div>
    );
}
