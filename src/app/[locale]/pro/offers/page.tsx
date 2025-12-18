// src/app/pro/offers/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getProfessionalWithRelations } from "@/lib/get-professional";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { getTranslations } from 'next-intl/server';

const STATUS_VARIANT: Record<string, "primary" | "warning" | "success" | "gray"> = {
  PENDING: "warning",
  ACCEPTED: "success",
  REJECTED: "gray",
  WITHDRAWN: "gray",
};

export default async function ProOffersPage() {
  const { userId } = await auth();
  const t = await getTranslations('ProOffers');

  if (!userId) redirect('/login');

  const professional = await getProfessionalWithRelations(userId, {
    offers: {
      include: {
        request: {
          include: {
            category: true,
            client: { include: { user: true } },
          },
        },
        clickEvent: true,
      },
      orderBy: { createdAt: 'desc' },
    },
  });

  if (!professional) redirect('/auth-redirect');

  const offers = professional.offers as any[];
  const pendingOffers = offers.filter(o => o.status === 'PENDING');
  const acceptedOffers = offers.filter(o => o.status === 'ACCEPTED');
  const rejectedOffers = offers.filter(o => o.status === 'REJECTED');
  const clickedOffers = offers.filter(o => o.clickEvent?.clickedAt);
  const successRate = offers.length > 0 ? Math.round((acceptedOffers.length / offers.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />

      {/* Enhanced Stats */}
      {offers.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-4">
          <Card level={2} className="text-center bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-yellow-600">{pendingOffers.length}</p>
              <p className="text-xs text-yellow-700 font-medium">{t('stats.pending')}</p>
            </CardContent>
          </Card>
          <Card level={2} className="text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-green-600">{acceptedOffers.length}</p>
              <p className="text-xs text-green-700 font-medium">{t('stats.accepted')}</p>
            </CardContent>
          </Card>
          <Card level={2} className="text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-purple-600">{clickedOffers.length}</p>
              <p className="text-xs text-purple-700 font-medium">{t('stats.profileViewed')}</p>
            </CardContent>
          </Card>
          <Card level={2} className="text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-blue-600">{successRate}%</p>
              <p className="text-xs text-blue-700 font-medium">{t('stats.successRate')}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {offers.length === 0 ? (
        <Card level={1} className="text-center py-12 border-dashed">
          <CardContent>
            <div className="text-5xl mb-4">📨</div>
            <h3 className="text-lg font-semibold text-[#333333] mb-2">{t('empty.title')}</h3>
            <p className="text-sm text-[#7C7373] mb-6 max-w-md mx-auto">
              {t('empty.desc')}
            </p>
            <Link href="/pro/requests">
              <Button className="shadow-md hover:shadow-lg">{t('empty.action')} →</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Pending Offers */}
          {pendingOffers.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-base font-bold text-[#333333] flex items-center gap-2">
                <span>⏳</span> {t('sections.pending')} ({pendingOffers.length})
              </h2>
              {pendingOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} t={t} />
              ))}
            </section>
          )}

          {/* Accepted Offers */}
          {acceptedOffers.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-base font-bold text-[#333333] flex items-center gap-2">
                <span>✅</span> {t('sections.accepted')} ({acceptedOffers.length})
              </h2>
              {acceptedOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} t={t} />
              ))}
            </section>
          )}

          {/* Rejected Offers */}
          {rejectedOffers.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-base font-bold text-[#333333] flex items-center gap-2">
                <span>⚫</span> {t('sections.rejected')} ({rejectedOffers.length})
              </h2>
              {rejectedOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} t={t} />
              ))}
            </section>
          )}
        </div>
      )}

      {/* Tips */}
      <Card level={2} className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
        <CardContent>
          <h2 className="text-base font-bold text-[#333333] flex items-center gap-2 mb-4">
            <span>💡</span> {t('tips.title')}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <TipCard icon="⚡" title={t('tips.items.respond.title')} description={t('tips.items.respond.desc')} />
            <TipCard icon="✍️" title={t('tips.items.personalize.title')} description={t('tips.items.personalize.desc')} />
            <TipCard icon="💰" title={t('tips.items.price.title')} description={t('tips.items.price.desc')} />
            <TipCard icon="⭐" title={t('tips.items.trust.title')} description={t('tips.items.trust.desc')} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OfferCard({ offer, t }: { offer: any, t: any }) {
  const isClicked = offer.clickedAt;
  const isPending = offer.status === 'PENDING';
  const isAccepted = offer.status === 'ACCEPTED';
  const statusConfig = STATUS_VARIANT[offer.status];

  // Map status to translation key
  const statusKey = offer.status.toLowerCase();
  const statusLabel = t(`status.${statusKey}`) || offer.status;

  return (
    <Card interactive level={1} className="group hover:border-primary-600 transition-all duration-200">
      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-[#333333] group-hover:text-primary-600 transition-colors truncate">
                {offer.request.title}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-[#7C7373]">
                <span className="flex items-center gap-1">👤 {offer.request.client.user.firstName}</span>
                <span>•</span>
                <span className="flex items-center gap-1">📅 {new Date(offer.createdAt).toLocaleDateString()}</span>
                {isClicked && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-purple-600 font-semibold">{t('card.viewed')}</span>
                  </>
                )}
              </div>
            </div>
            <Badge variant={statusConfig}>{statusLabel}</Badge>
          </div>

          {offer.message && (
            <div className="bg-[#F9FAFB] p-4 rounded-xl border border-[#E5E7EB]">
              <p className="text-xs text-[#7C7373] mb-2 font-medium">{t('card.messageLabel')}</p>
              <p className="text-sm text-[#4B5563] leading-relaxed line-clamp-2">"{offer.message}"</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1 font-semibold text-green-600">
                💰 €{offer.proposedPrice?.toFixed(2) || '0.00'}
              </span>
              <span className="flex items-center gap-1 text-[#7C7373]">📂 {offer.request.category.nameEn}</span>
            </div>
            {isPending && <span className="text-xs text-[#7C7373] italic">{t('card.waiting')}</span>}
            {isAccepted && (
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                {t('card.acceptedCheckJobs')}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TipCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 bg-white p-3 rounded-lg border border-[#E5E7EB]">
      <div className="text-2xl">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-[#333333] mb-1">{title}</p>
        <p className="text-xs text-[#7C7373]">{description}</p>
      </div>
    </div>
  );
}
