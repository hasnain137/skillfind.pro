
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import ViewOfferProfileButton from '../requests/[id]/ViewOfferProfileButton';
import AcceptOfferButton from '../requests/[id]/AcceptOfferButton';

export default async function ClientOffersPage() {
    const { userId } = await auth();
    const t = await getTranslations('ClientOffers');

    if (!userId) {
        redirect('/login');
    }

    // Fetch all offers for this client's requests
    const offers = await prisma.offer.findMany({
        where: {
            request: {
                client: {
                    user: {
                        clerkId: userId
                    }
                }
            }
        },
        include: {
            request: {
                select: {
                    id: true,
                    title: true,
                    status: true
                }
            },
            professional: {
                include: {
                    user: true,
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    // Calculate stats
    const totalOffers = offers.length;
    const newToday = offers.filter(o => {
        const today = new Date();
        const offerDate = new Date(o.createdAt);
        return offerDate.getDate() === today.getDate() &&
            offerDate.getMonth() === today.getMonth() &&
            offerDate.getFullYear() === today.getFullYear();
    }).length;
    const acceptedOffers = offers.filter(o => o.status === 'ACCEPTED').length;

    return (
        <div className="space-y-6">
            <SectionHeading
                eyebrow={t('eyebrow')}
                title={t('title')}
                description={t('description')}
            />

            {/* Stats Overview */}
            {offers.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card padding="lg" className="text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <p className="text-3xl font-bold text-blue-700 mb-1">{totalOffers}</p>
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">{t('stats.total')}</p>
                    </Card>
                    <Card padding="lg" className="text-center bg-white border-gray-200">
                        <p className="text-3xl font-bold text-[#333333] mb-1">{newToday}</p>
                        <p className="text-xs font-semibold text-[#7C7373] uppercase tracking-wide">{t('stats.new')}</p>
                    </Card>
                    <Card padding="lg" className="text-center bg-white border-gray-200">
                        <p className="text-3xl font-bold text-green-600 mb-1">{acceptedOffers}</p>
                        <p className="text-xs font-semibold text-[#7C7373] uppercase tracking-wide">{t('stats.accepted')}</p>
                    </Card>
                </div>
            )}

            {/* Offers List */}
            {offers.length === 0 ? (
                <Card className="text-center py-16 px-4 bg-gray-50 border-dashed" padding="lg">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-3xl">
                        📭
                    </div>
                    <h3 className="text-lg font-bold text-[#333333] mb-2">{t('empty.title')}</h3>
                    <p className="text-sm text-[#7C7373] max-w-md mx-auto mb-6">
                        {t('empty.desc')}
                    </p>
                    <Link href="/client/requests">
                        <span className="inline-flex items-center justify-center rounded-xl bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#1D4FD8]">
                            {t('empty.action')}
                        </span>
                    </Link>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {offers.map((offer) => (
                        <Card key={offer.id} padding="lg" className="hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row gap-6">

                                {/* Professional Info */}
                                <div className="flex items-start gap-4 md:w-1/3">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#1D4FD8] text-white font-bold text-sm shadow-md">
                                        {offer.professional.user.firstName?.[0]}{offer.professional.user.lastName?.[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[#333333]">
                                            {offer.professional.user.firstName} {offer.professional.user.lastName}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {offer.professional.averageRating > 0 && (
                                                <div className="flex items-center gap-1 text-xs text-[#7C7373]">
                                                    <span>⭐</span>
                                                    <span>{offer.professional.averageRating.toFixed(1)}</span>
                                                </div>
                                            )}
                                            {offer.professional.city && (
                                                <span className="text-xs text-[#7C7373]">• 📍 {offer.professional.city}</span>
                                            )}
                                        </div>
                                        <div className="mt-3">
                                            <Link href={`/client/requests/${offer.request.id}`}>
                                                <Badge variant="gray" className="hover:bg-gray-200 transition-colors cursor-pointer">
                                                    📄 {t('card.forRequest', { title: offer.request.title })}
                                                </Badge>
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Offer Details */}
                                <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="text-lg font-bold text-[#2563EB]">
                                                {offer.proposedPrice ? `€${offer.proposedPrice}` : 'Negotiable'}
                                            </p>
                                            {offer.estimatedDuration && (
                                                <p className="text-xs text-[#7C7373] mt-1">
                                                    ⏱️ {offer.estimatedDuration}
                                                </p>
                                            )}
                                        </div>
                                        <Badge variant={offer.status === 'PENDING' ? 'primary' : offer.status === 'ACCEPTED' ? 'success' : 'gray'}>
                                            {offer.status}
                                        </Badge>
                                    </div>

                                    <p className="text-sm text-[#4B5563] line-clamp-2 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        {offer.message}
                                    </p>

                                    <div className="flex flex-wrap gap-2 justify-end">
                                        <ViewOfferProfileButton
                                            offerId={offer.id}
                                            professionalId={offer.professional.id}
                                            className="text-xs border border-gray-200"
                                        />
                                        {offer.status === 'PENDING' && offer.request.status === 'OPEN' && (
                                            <AcceptOfferButton
                                                offerId={offer.id}
                                                requestId={offer.request.id}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-[#9CA3AF]">
                                <span>Received {new Date(offer.createdAt).toLocaleDateString()}</span>
                                <Link href={`/client/requests/${offer.request.id}`} className="text-blue-600 hover:underline">
                                    View Full Request →
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
