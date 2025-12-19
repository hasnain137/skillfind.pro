'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState, use } from 'react';
import {
    Briefcase,
    Clock,
    ExternalLink,
    User,
    CheckCircle2,
    Calendar,
    Euro,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { toast } from 'sonner';

interface Offer {
    id: string;
    proposedPrice: number;
    message: string;
    status: string;
    createdAt: string;
    professional: {
        id: string;
        user: {
            firstName: string;
            lastName: string;
            avatar: string;
        };
        title: string;
    };
    request: {
        id: string;
        title: string;
    };
}

export default function ClientOffersPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = use(params);
    const t = useTranslations('ClientOffers');
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, today: 0, accepted: 0 });

    const dateLocale = locale === 'fr' ? fr : enUS;

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const response = await fetch('/api/offers?limit=50');
                const data = await response.json();

                if (data.success) {
                    const fetchedOffers = data.data.offers;
                    setOffers(fetchedOffers);

                    // Calculate stats
                    const total = fetchedOffers.length;
                    const accepted = fetchedOffers.filter((o: Offer) => o.status === 'ACCEPTED').length;
                    const today = fetchedOffers.filter((o: Offer) => {
                        const date = new Date(o.createdAt);
                        const now = new Date();
                        return date.toDateString() === now.toDateString();
                    }).length;

                    setStats({ total, today, accepted });
                }
            } catch (error) {
                console.error('Error fetching offers:', error);
                toast.error('Failed to load offers');
            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, []);

    const handleAccept = async (offerId: string) => {
        if (!confirm('Are you sure you want to accept this offer? This will create a job and close other offers for this request.')) {
            return;
        }

        try {
            const response = await fetch(`/api/offers/${offerId}/accept`, {
                method: 'POST'
            });
            const data = await response.json();

            if (data.success) {
                toast.success('Offer accepted successfully!');
                // Refresh offers
                const res = await fetch('/api/offers?limit=50');
                const newData = await res.json();
                if (newData.success) setOffers(newData.data.offers);
            } else {
                toast.error(data.error || 'Failed to accept offer');
            }
        } catch (error) {
            console.error('Error accepting offer:', error);
            toast.error('Failed to accept offer');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <SectionHeading
                eyebrow={t('eyebrow')}
                title={t('title')}
                description={t('description')}
            />

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6 bg-blue-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t('stats.total')}</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 bg-emerald-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                            <Clock className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t('stats.new')}</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 bg-purple-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t('stats.accepted')}</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.accepted}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-2xl" />
                    ))}
                </div>
            ) : offers.length === 0 ? (
                <Card className="p-12 text-center flex flex-col items-center justify-center bg-gray-50/50 border-dashed">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                        <Briefcase className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('empty.title')}</h3>
                    <p className="text-gray-500 max-w-md mb-8">{t('empty.desc')}</p>
                    <Link href={`/${locale}/client/requests`}>
                        <Button className="flex items-center gap-2">
                            {t('empty.action')}
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {offers.map(offer => (
                        <OfferCard
                            key={offer.id}
                            offer={offer}
                            locale={locale}
                            onAccept={handleAccept}
                            dateLocale={dateLocale}
                            t={t}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function OfferCard({ offer, locale, onAccept, dateLocale, t }: {
    offer: Offer,
    locale: string,
    onAccept: (id: string) => void,
    dateLocale: any,
    t: any
}) {
    const proName = `${offer.professional.user.firstName} ${offer.professional.user.lastName}`.trim();

    return (
        <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {offer.professional.user.avatar ? (
                            <img
                                src={offer.professional.user.avatar}
                                alt={proName}
                                className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-50"
                            />
                        ) : (
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-blue-600" />
                            </div>
                        )}
                        <div>
                            <h4 className="font-bold text-gray-900">{proName}</h4>
                            <p className="text-sm text-gray-500">{offer.professional.title}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">€{offer.proposedPrice}</div>
                        <Badge variant={offer.status === 'ACCEPTED' ? 'success' : offer.status === 'PENDING' ? 'warning' : 'secondary'}>
                            {offer.status}
                        </Badge>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-xs text-blue-600 font-semibold mb-1 uppercase tracking-wider">{t('card.forRequest', { title: '' })}</p>
                    <Link href={`/${locale}/client/requests/${offer.request.id}`} className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors">
                        {offer.request.title}
                    </Link>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <p className="text-sm text-gray-700 italic line-clamp-3">
                        "{offer.message}"
                    </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
                    <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDistanceToNow(new Date(offer.createdAt), { addSuffix: true, locale: dateLocale })}
                    </span>
                    <span className="flex items-center gap-1">
                        <Euro className="w-3.5 h-3.5" />
                        Fixed Price
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <Link href={`/${locale}/client/requests/${offer.request.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                            {t('card.viewRequest')}
                        </Button>
                    </Link>
                    {offer.status === 'PENDING' && (
                        <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            size="sm"
                            onClick={() => onAccept(offer.id)}
                        >
                            {t('card.accept')}
                        </Button>
                    )}
                </div>
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <Link
                    href={`/${locale}/pro/profile/${offer.professional.id}`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                    {t('card.viewProfile')}
                    <ExternalLink className="w-3 h-3" />
                </Link>
            </div>
        </Card>
    );
}
