// src/app/client/requests/[id]/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Link } from '@/i18n/routing';
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import AcceptOfferButton from './AcceptOfferButton';
import CloseRequestButton from './CloseRequestButton';
import { getTranslations } from 'next-intl/server';

type RequestDetailPageProps = {
  params: Promise<{ id: string }>;
};

const STATUS_STYLES = {
  OPEN: { variant: "primary" as const, icon: "🔵", color: "text-blue-600", bgColor: "bg-blue-50" },
  IN_PROGRESS: { variant: "warning" as const, icon: "🟡", color: "text-yellow-600", bgColor: "bg-yellow-50" },
  COMPLETED: { variant: "success" as const, icon: "🟢", color: "text-green-600", bgColor: "bg-green-50" },
  CLOSED: { variant: "gray" as const, icon: "⚫", color: "text-gray-600", bgColor: "bg-gray-50" },
};

export default async function ClientRequestDetailPage({ params }: RequestDetailPageProps) {
  const resolvedParams = await params;
  const { userId } = await auth();
  if (!userId) redirect('/login');

  const t = await getTranslations('Request');

  const request = await prisma.request.findUnique({
    where: { id: resolvedParams.id },
    include: {
      category: true,
      client: { include: { user: true } },
      offers: {
        include: { professional: { include: { user: true } } },
        orderBy: { createdAt: 'desc' },
      },
      job: { include: { professional: { include: { user: true } } } },
    },
  });

  if (!request) notFound();
  if (request.client.user.clerkId !== userId) redirect('/client');

  const statusStyle = STATUS_STYLES[request.status as keyof typeof STATUS_STYLES] || STATUS_STYLES.OPEN;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OPEN': return t('status.open');
      case 'IN_PROGRESS': return t('status.inProgress');
      case 'COMPLETED': return t('status.completed');
      case 'CLOSED': return t('status.closed');
      default: return status;
    }
  };

  const statusLabel = getStatusLabel(request.status);
  const hasOffers = request.offers.length > 0;

  const formatBudget = () => {
    if (!request.budgetMin && !request.budgetMax) return t('budget.notSpecified');
    if (request.budgetMin && request.budgetMax) return `€${t('budget.range', { min: request.budgetMin, max: request.budgetMax })}`;
    if (request.budgetMin) return t('budget.from', { amount: `€${request.budgetMin}` });
    if (request.budgetMax) return t('budget.upTo', { amount: `€${request.budgetMax}` });
    return t('budget.notSpecified');
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200" padding="lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{statusStyle.icon}</span>
              <Badge variant={statusStyle.variant}>{statusLabel}</Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#333333] mb-2">
              {request.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#7C7373]">
              <span className="flex items-center gap-1">📂 {request.category.nameEn}</span>
              <span>•</span>
              <span className="flex items-center gap-1">📅 {t('fields.posted')} {new Date(request.createdAt).toLocaleDateString()}</span>
              {request.city && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">📍 {request.city}</span>
                </>
              )}
            </div>
          </div>
          {request.status === 'OPEN' && <CloseRequestButton requestId={request.id} />}
        </div>
      </Card>

      {/* Details Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-4" padding="lg">
          <h2 className="text-base font-bold text-[#333333] flex items-center gap-2">
            <span>📋</span> {t('details')}
          </h2>

          {request.description && (
            <div className="bg-[#F9FAFB] p-4 rounded-xl border border-[#E5E7EB]">
              <p className="text-sm text-[#4B5563] leading-relaxed whitespace-pre-wrap">
                {request.description}
              </p>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <InfoBox icon="📂" label={t('fields.category')} value={request.category.nameEn} />
            <InfoBox icon="📍" label={t('fields.location')} value={`${request.city || t('budget.notSpecified')} · ${request.locationType === 'REMOTE' ? 'Remote' : 'On-site'}`} />
            <InfoBox icon="💰" label={t('fields.budget')} value={formatBudget()} />
            {request.preferredStartDate && (
              <InfoBox icon="📅" label={t('fields.startDate')} value={new Date(request.preferredStartDate).toLocaleDateString()} />
            )}
            {request.urgency && <InfoBox icon="⏱️" label={t('fields.urgency')} value={request.urgency} />}
            <InfoBox icon="📬" label={t('fields.offers')} value={`${request.offers.length} ${t('fields.received').toLowerCase()}`} />
          </div>

          {request.job && (
            <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
              <p className="text-sm font-semibold text-[#333333] mb-2 flex items-center gap-2">
                <span>💼</span> {t('activeJob')}
              </p>
              <Link href={`/client/jobs/${request.job.id}`}>
                <Button variant="ghost" className="text-xs">{t('viewJob')} →</Button>
              </Link>
            </div>
          )}
        </Card>

        <Card className="space-y-4" padding="lg">
          <h2 className="text-base font-bold text-[#333333] flex items-center gap-2">
            <span>📊</span> {t('overview')}
          </h2>

          <div className="space-y-3">
            <div className={`rounded-lg ${statusStyle.bgColor} border border-[#E5E7EB] p-4 text-center`}>
              <div className="text-2xl mb-1">{statusStyle.icon}</div>
              <p className={`text-xl font-bold ${statusStyle.color} mb-1`}>{statusLabel}</p>
              <p className="text-xs text-[#7C7373]">Current Status</p>
            </div>

            <div className={`rounded-lg ${hasOffers ? 'bg-green-50' : 'bg-gray-50'} border border-[#E5E7EB] p-4 text-center`}>
              <div className="text-2xl mb-1">📬</div>
              <p className={`text-xl font-bold ${hasOffers ? 'text-green-600' : 'text-gray-600'} mb-1`}>{request.offers.length}</p>
              <p className="text-xs text-[#7C7373]">{t('fields.offers')} {t('fields.received')}</p>
            </div>

            <div className="rounded-lg bg-purple-50 border border-[#E5E7EB] p-4 text-center">
              <div className="text-2xl mb-1">👁️</div>
              <p className="text-xl font-bold text-purple-600 mb-1">0</p>
              <p className="text-xs text-[#7C7373]">Profile Views</p>
            </div>
          </div>

          {request.status === 'OPEN' && !hasOffers && (
            <div className="pt-4 border-t border-[#E5E7EB]">
              <p className="text-xs text-[#7C7373]">
                💡 <strong>{t('status.open')}</strong>: {t('noOffers.desc')}
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Offers Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-[#333333] flex items-center gap-2">
          <span>📬</span> {t('fields.offers')} {t('fields.received')} ({request.offers.length})
        </h2>

        {request.offers.length === 0 ? (
          <Card level={1} padding="lg" className="text-center py-12 border-dashed">
            <div className="text-5xl mb-4">📬</div>
            <h3 className="text-lg font-semibold text-[#333333] mb-2">{t('noOffers.title')}</h3>
            <p className="text-sm text-[#7C7373] max-w-md mx-auto">
              {t('noOffers.desc')}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {request.offers.map((offer) => (
              <Card key={offer.id} className="group hover:border-[#2563EB] hover:shadow-md transition-all duration-200" padding="lg">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#1D4FD8] text-white font-bold text-base shadow-md">
                        {(offer.professional.user.firstName || 'P')[0]}{(offer.professional.user.lastName || '')[0]}
                      </div>
                      <div>
                        <p className="text-base font-bold text-[#333333] group-hover:text-[#2563EB] transition-colors">
                          {offer.professional.user.firstName} {offer.professional.user.lastName}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-[#7C7373] mt-1">
                          {offer.professional.city && <span className="flex items-center gap-1">📍 {offer.professional.city}</span>}
                          {offer.professional.averageRating > 0 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">⭐ {offer.professional.averageRating.toFixed(1)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge variant={offer.status === 'PENDING' ? 'primary' : offer.status === 'ACCEPTED' ? 'success' : 'gray'}>
                      {getStatusLabel(offer.status)}
                    </Badge>
                  </div>

                  <div className="bg-[#F9FAFB] p-4 rounded-xl border border-[#E5E7EB]">
                    <p className="text-sm text-[#4B5563] leading-relaxed">{offer.message}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    {offer.proposedPrice && (
                      <span className="flex items-center gap-1 font-semibold text-green-600">
                        💰 €{offer.proposedPrice}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[#7C7373]">
                      📅 {t('fields.received')} {new Date(offer.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-3 border-t border-[#E5E7EB]">
                    <Link href={`/professionals/${offer.professionalId}`}>
                      <Button variant="ghost" className="border border-[#E5E7EB] px-4 py-2 text-xs hover:border-[#2563EB]">
                        {t('viewProfile')}
                      </Button>
                    </Link>
                    {offer.status === 'PENDING' && request.status === 'OPEN' && (
                      <AcceptOfferButton offerId={offer.id} requestId={request.id} />
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function InfoBox({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{icon}</span>
        <p className="text-xs font-medium text-[#7C7373]">{label}</p>
      </div>
      <p className="text-sm font-semibold text-[#333333]">{value}</p>
    </div>
  );
}
