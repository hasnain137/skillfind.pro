// src/app/professionals/[id]/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';

type ProProfilePageProps = {
    params: Promise<{ id: string }>;
};

export default async function ProPublicProfilePage({ params }: ProProfilePageProps) {
    const resolvedParams = await params;
    const { userId } = await auth();

    // Fetch professional profile with all related data
    const professional = await prisma.professional.findUnique({
        where: { id: resolvedParams.id },
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    createdAt: true,
                },
            },
            services: {
                include: {
                    subcategory: {
                        include: {
                            category: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            },
            jobs: {
                where: {
                    status: 'COMPLETED',
                },
                include: {
                    review: {
                        where: {
                            moderationStatus: 'APPROVED',
                        },
                        include: {
                            client: {
                                include: {
                                    user: {
                                        select: {
                                            firstName: true,
                                            lastName: true,
                                        },
                                    },
                                },
                            },
                            professionalResponse: true,
                        },
                    },
                },
                orderBy: {
                    completedAt: 'desc',
                },
                take: 5,
            },
        },
    });

    if (!professional) {
        notFound();
    }

    // Check if professional is active
    // Check if professional is active
    if (professional.status === 'SUSPENDED' || professional.status === 'BANNED') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
                <Card padding="lg" className="max-w-md text-center">
                    <div className="text-5xl mb-4">😔</div>
                    <h1 className="text-xl font-bold text-[#333333] mb-2">Profile Unavailable</h1>
                    <p className="text-sm text-[#7C7373]">
                        This professional profile is not currently active.
                    </p>
                    <Link href="/search">
                        <Button className="mt-4">Browse Other Professionals</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    // Get reviews with proper data
    const reviews = professional.jobs
        .map(job => job.review)
        .filter(review => review !== null);

    // Check if current user is a client (can contact)
    const currentUserClient = userId ? await prisma.client.findUnique({
        where: { userId },
    }) : null;

    const memberSince = new Date(professional.user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white text-blue-600 font-bold text-4xl shadow-xl border-4 border-white">
                                {(professional.user.firstName || 'P')[0]}{(professional.user.lastName || '')[0]}
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold">
                                    {professional.user.firstName} {professional.user.lastName}
                                </h1>
                                {professional.isVerified && (
                                    <Badge className="bg-green-500 text-white border-none">
                                        ✓ Verified
                                    </Badge>
                                )}
                            </div>

                            {professional.title && (
                                <p className="text-xl text-blue-100 mb-3">{professional.title}</p>
                            )}

                            {professional.businessName && (
                                <p className="text-lg text-blue-200 mb-3">{professional.businessName}</p>
                            )}

                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                {/* Rating */}
                                {professional.averageRating > 0 && (
                                    <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                                        <span className="text-yellow-300">★</span>
                                        <span className="font-bold">{professional.averageRating.toFixed(1)}</span>
                                        <span className="text-blue-100">({professional.totalReviews} reviews)</span>
                                    </div>
                                )}

                                {/* Location */}
                                {professional.city && (
                                    <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full">
                                        <span>📍</span>
                                        <span>{professional.city}, {professional.country}</span>
                                    </div>
                                )}

                                {/* Remote */}
                                {professional.remoteAvailability && (
                                    <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full">
                                        <span>🌐</span>
                                        <span>Available remotely</span>
                                    </div>
                                )}

                                {/* Member since */}
                                <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full">
                                    <span>📅</span>
                                    <span>Member since {memberSince}</span>
                                </div>
                            </div>

                            {/* Contact Button */}
                            {currentUserClient && (
                                <div className="mt-6">
                                    <Link href={`/client/requests/new?professional=${professional.id}`}>
                                        <Button className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg">
                                            💬 Send Request
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="flex gap-4 md:flex-col">
                            <div className="text-center bg-white/20 p-4 rounded-xl min-w-[100px]">
                                <p className="text-3xl font-bold">{professional.completedJobs}</p>
                                <p className="text-xs text-blue-100">Jobs Done</p>
                            </div>
                            {professional.yearsOfExperience && (
                                <div className="text-center bg-white/20 p-4 rounded-xl min-w-[100px]">
                                    <p className="text-3xl font-bold">{professional.yearsOfExperience}</p>
                                    <p className="text-xs text-blue-100">Years Exp</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* About */}
                        {professional.bio && (
                            <Card padding="lg">
                                <h2 className="text-lg font-bold text-[#333333] mb-4 flex items-center gap-2">
                                    <span>👤</span> About Me
                                </h2>
                                <p className="text-sm text-[#4B5563] leading-relaxed whitespace-pre-wrap">
                                    {professional.bio}
                                </p>
                            </Card>
                        )}

                        {/* Services */}
                        {professional.services.length > 0 && (
                            <Card padding="lg">
                                <h2 className="text-lg font-bold text-[#333333] mb-4 flex items-center gap-2">
                                    <span>💼</span> Services Offered
                                </h2>
                                <div className="space-y-3">
                                    {professional.services.map((service) => (
                                        <div key={service.id} className="border border-[#E5E7EB] rounded-xl p-4 hover:border-blue-300 transition-colors">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-[#333333] mb-1">
                                                        {service.subcategory.nameEn}
                                                    </h3>
                                                    <p className="text-xs text-[#7C7373] mb-2">
                                                        {service.subcategory.category.nameEn}
                                                    </p>
                                                    {service.description && (
                                                        <p className="text-sm text-[#4B5563]">
                                                            {service.description}
                                                        </p>
                                                    )}
                                                </div>
                                                {(service.priceFrom || service.priceTo) && (
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-blue-600">
                                                            €{service.priceFrom}
                                                            {service.priceTo && service.priceTo !== service.priceFrom && (
                                                                <> - €{service.priceTo}</>
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-[#7C7373]">per project</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Reviews */}
                        {reviews.length > 0 && (
                            <Card padding="lg">
                                <h2 className="text-lg font-bold text-[#333333] mb-4 flex items-center gap-2">
                                    <span>⭐</span> Recent Reviews ({professional.totalReviews})
                                </h2>
                                <div className="space-y-4">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="border-b border-[#E5E7EB] pb-4 last:border-0">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <p className="font-semibold text-[#333333]">
                                                        {review.client.user.firstName} {(review.client.user.lastName || '')[0]}.
                                                    </p>
                                                    <p className="text-xs text-[#7C7373]">
                                                        {new Date(review.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className={`${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                                            ★
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            {review.title && (
                                                <h4 className="font-semibold text-sm text-[#333333] mb-1">
                                                    {review.title}
                                                </h4>
                                            )}
                                            <p className="text-sm text-[#4B5563] mb-2">
                                                {review.content}
                                            </p>
                                            {review.wouldRecommend && (
                                                <div className="flex items-center gap-1 text-xs text-green-600">
                                                    <span>✓</span>
                                                    <span>Would recommend</span>
                                                </div>
                                            )}
                                            {review.professionalResponse && (
                                                <div className="mt-3 ml-4 pl-4 border-l-2 border-blue-200 bg-blue-50 p-3 rounded-r-lg">
                                                    <p className="text-xs font-semibold text-blue-800 mb-1">
                                                        Response from professional:
                                                    </p>
                                                    <p className="text-sm text-[#4B5563]">
                                                        {review.professionalResponse.response}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <Card padding="lg" className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                            <h3 className="text-base font-bold text-[#333333] mb-4">Quick Stats</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2 border-b border-[#E5E7EB]">
                                    <span className="text-sm text-[#7C7373]">Profile Completion</span>
                                    <span className="text-sm font-bold text-blue-600">{professional.profileCompletion}%</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-[#E5E7EB]">
                                    <span className="text-sm text-[#7C7373]">Completed Jobs</span>
                                    <span className="text-sm font-bold text-[#333333]">{professional.completedJobs}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-[#E5E7EB]">
                                    <span className="text-sm text-[#7C7373]">Average Rating</span>
                                    <span className="text-sm font-bold text-[#333333]">
                                        {professional.averageRating > 0 ? `${professional.averageRating.toFixed(1)} ⭐` : 'No ratings yet'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-[#7C7373]">Total Reviews</span>
                                    <span className="text-sm font-bold text-[#333333]">{professional.totalReviews}</span>
                                </div>
                            </div>
                        </Card>

                        {/* Call to Action */}
                        {!currentUserClient && (
                            <Card padding="lg" className="bg-gradient-to-br from-green-50 to-white border-green-200 text-center">
                                <div className="text-4xl mb-3">🎯</div>
                                <h3 className="text-base font-bold text-[#333333] mb-2">
                                    Ready to hire {professional.user.firstName}?
                                </h3>
                                <p className="text-sm text-[#7C7373] mb-4">
                                    Sign in to send a request or message this professional
                                </p>
                                <Link href="/signup">
                                    <Button className="w-full mb-2">Get Started</Button>
                                </Link>
                                <Link href="/login">
                                    <Button variant="ghost" className="w-full text-xs">
                                        Already have an account? Sign in
                                    </Button>
                                </Link>
                            </Card>
                        )}

                        {/* Location */}
                        {professional.city && (
                            <Card padding="lg">
                                <h3 className="text-base font-bold text-[#333333] mb-3 flex items-center gap-2">
                                    <span>📍</span> Location
                                </h3>
                                <p className="text-sm text-[#4B5563]">
                                    {professional.city}
                                    {professional.region && `, ${professional.region}`}
                                    <br />
                                    {professional.country}
                                </p>
                                {professional.remoteAvailability && (
                                    <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
                                        <div className="flex items-center gap-2 text-sm text-green-600">
                                            <span>✓</span>
                                            <span>Available for remote work</span>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        )}

                        {/* Experience */}
                        {professional.yearsOfExperience && (
                            <Card padding="lg">
                                <h3 className="text-base font-bold text-[#333333] mb-3 flex items-center gap-2">
                                    <span>🎓</span> Experience
                                </h3>
                                <p className="text-2xl font-bold text-blue-600 mb-1">
                                    {professional.yearsOfExperience} years
                                </p>
                                <p className="text-xs text-[#7C7373]">
                                    of professional experience
                                </p>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
