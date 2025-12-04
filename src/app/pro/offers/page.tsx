// src/app/pro/offers/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getProfessionalWithRelations } from "@/lib/get-professional";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";

const STATUS_VARIANT: Record<string, "primary" | "warning" | "success" | "gray"> = {
  PENDING: "warning",
  ACCEPTED: "success",
  REJECTED: "gray",
  WITHDRAWN: "gray",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted ✓",
  REJECTED: "Not Selected",
  WITHDRAWN: "Withdrawn",
};

export default async function ProOffersPage() {
  const { userId } = await auth();
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
      <SectionHeading eyebrow="Offers" title="My Offers" description="Track all offers you've sent and their outcomes." />

      {/* Enhanced Stats */}
      {offers.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-4">
          <Card padding="lg" className="text-center bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <p className="text-2xl font-bold text-yellow-600">{pendingOffers.length}</p>
            <p className="text-xs text-yellow-700 font-medium">Pending</p>
          </Card>
          <Card padding="lg" className="text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <p className="text-2xl font-bold text-green-600">{acceptedOffers.length}</p>
            <p className="text-xs text-green-700 font-medium">Accepted</p>
          </Card>
          <Card padding="lg" className="text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <p className="text-2xl font-bold text-purple-600">{clickedOffers.length}</p>
            <p className="text-xs text-purple-700 font-medium">Profile Viewed</p>
          </Card>
          <Card padding="lg" className="text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <p className="text-2xl font-bold text-blue-600">{successRate}%</p>
            <p className="text-xs text-blue-700 font-medium">Success Rate</p>
          </Card>
        </div>
      )}

      {offers.length === 0 ? (
        <Card variant="dashed" padding="lg" className="text-center py-12">
          <div className="text-5xl mb-4">📨</div>
          <h3 className="text-lg font-semibold text-[#333333] mb-2">No offers sent yet</h3>
          <p className="text-sm text-[#7C7373] mb-6 max-w-md mx-auto">
            Browse matching requests and send your first offer to get hired!
          </p>
          <Link href="/pro/requests">
            <Button className="shadow-md hover:shadow-lg">Browse Requests →</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Pending Offers */}
          {pendingOffers.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-base font-bold text-[#333333] flex items-center gap-2">
                <span>⏳</span> Pending Offers ({pendingOffers.length})
              </h2>
              {pendingOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </section>
          )}

          {/* Accepted Offers */}
          {acceptedOffers.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-base font-bold text-[#333333] flex items-center gap-2">
                <span>✅</span> Accepted Offers ({acceptedOffers.length})
              </h2>
              {acceptedOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </section>
          )}

          {/* Rejected Offers */}
          {rejectedOffers.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-base font-bold text-[#333333] flex items-center gap-2">
                <span>⚫</span> Not Selected ({rejectedOffers.length})
              </h2>
              {rejectedOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </section>
          )}
        </div>
      )}

      {/* Tips */}
      <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200" padding="lg">
        <h2 className="text-base font-bold text-[#333333] flex items-center gap-2 mb-4">
          <span>💡</span> Tips for Winning More Offers
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <TipCard icon="⚡" title="Respond Quickly" description="Clients value fast replies. Be among the first to send an offer." />
          <TipCard icon="✍️" title="Personalize Messages" description="Show you understand their specific needs in your offer." />
          <TipCard icon="💰" title="Price Fairly" description="Be competitive but reflect your expertise and value." />
          <TipCard icon="⭐" title="Build Trust" description="Complete profile with portfolio and collect positive reviews." />
        </div>
      </Card>
    </div>
  );
}

function OfferCard({ offer }: { offer: any }) {
  const isClicked = offer.clickedAt;
  const isPending = offer.status === 'PENDING';
  const isAccepted = offer.status === 'ACCEPTED';
  const statusConfig = STATUS_VARIANT[offer.status];

  return (
    <Card className="group hover:border-[#2563EB] hover:shadow-md transition-all duration-200" padding="lg">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-[#333333] group-hover:text-[#2563EB] transition-colors truncate">
              {offer.request.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-[#7C7373]">
              <span className="flex items-center gap-1">👤 {offer.request.client.user.firstName}</span>
              <span>•</span>
              <span className="flex items-center gap-1">📅 {new Date(offer.createdAt).toLocaleDateString()}</span>
              {isClicked && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-purple-600 font-semibold">👁️ Viewed</span>
                </>
              )}
            </div>
          </div>
          <Badge variant={statusConfig}>{STATUS_LABEL[offer.status]}</Badge>
        </div>

        {offer.message && (
          <div className="bg-[#F9FAFB] p-4 rounded-xl border border-[#E5E7EB]">
            <p className="text-xs text-[#7C7373] mb-2 font-medium">Your offer message:</p>
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
          {isPending && <span className="text-xs text-[#7C7373] italic">⏳ Waiting for response</span>}
          {isAccepted && (
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
              ✓ Accepted - Check Jobs
            </span>
          )}
        </div>
      </div>
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
