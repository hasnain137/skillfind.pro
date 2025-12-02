// src/app/pro/offers/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
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

  if (!userId) {
    redirect('/login');
  }

  const professional = await prisma.professional.findUnique({
    where: { userId },
    include: {
      offers: {
        include: {
          request: {
            include: {
              category: true,
              client: {
                include: {
                  user: true,
                },
              },
              job: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!professional) {
    redirect('/complete-profile');
  }

  const offers = professional.offers;
  const pendingOffers = offers.filter(o => o.status === 'PENDING');
  const acceptedOffers = offers.filter(o => o.status === 'ACCEPTED');
  const rejectedOffers = offers.filter(o => o.status === 'REJECTED');

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Offers"
        title="My Offers"
        description="Track all offers you've sent and their outcomes."
      />

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card padding="lg" className="text-center">
          <p className="text-2xl font-bold text-[#333333]">{offers.length}</p>
          <p className="text-xs text-[#7C7373]">Total Sent</p>
        </Card>
        <Card padding="lg" className="text-center">
          <p className="text-2xl font-bold text-yellow-600">{pendingOffers.length}</p>
          <p className="text-xs text-[#7C7373]">Pending</p>
        </Card>
        <Card padding="lg" className="text-center">
          <p className="text-2xl font-bold text-green-600">{acceptedOffers.length}</p>
          <p className="text-xs text-[#7C7373]">Accepted</p>
        </Card>
        <Card padding="lg" className="text-center">
          <p className="text-2xl font-bold text-[#7C7373]">
            {offers.length > 0 ? ((acceptedOffers.length / offers.length) * 100).toFixed(0) : 0}%
          </p>
          <p className="text-xs text-[#7C7373]">Success Rate</p>
        </Card>
      </div>

      {/* Pending Offers */}
      {pendingOffers.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[#333333]">Pending Offers ({pendingOffers.length})</h2>
          {pendingOffers.map((offer) => (
            <Card key={offer.id} padding="lg" className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-[#333333] mb-1">
                    {offer.request.title}
                  </h3>
                  <p className="text-xs text-[#7C7373]">
                    {offer.request.category.nameEn} · Client: {offer.request.client.user.firstName}
                  </p>
                </div>
                <Badge variant={STATUS_VARIANT[offer.status]}>
                  {STATUS_LABEL[offer.status]}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-[#7C7373]">
                <span>💰 Your offer: €{offer.proposedPrice?.toFixed(2) || '0.00'}</span>
                <span>📅 Sent {new Date(offer.createdAt).toLocaleDateString()}</span>
              </div>

              {offer.message && (
                <div className="pt-3 border-t border-[#E5E7EB]">
                  <p className="text-xs text-[#7C7373] mb-1">Your message:</p>
                  <p className="text-sm text-[#4B5563] italic line-clamp-2">"{offer.message}"</p>
                </div>
              )}
            </Card>
          ))}
        </section>
      )}

      {/* Accepted Offers */}
      {acceptedOffers.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[#333333]">Accepted Offers ({acceptedOffers.length})</h2>
          {acceptedOffers.map((offer) => (
            <Card key={offer.id} padding="lg" className="space-y-3 bg-green-50 border-green-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-[#333333] mb-1">
                    {offer.request.title} ✓
                  </h3>
                  <p className="text-xs text-[#7C7373]">
                    {offer.request.category.nameEn} · Client: {offer.request.client.user.firstName}
                  </p>
                </div>
                <Badge variant="success">
                  {STATUS_LABEL[offer.status]}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-[#7C7373]">
                <span>💰 Agreed price: €{offer.proposedPrice?.toFixed(2) || '0.00'}</span>
                <span>✅ Accepted {new Date(offer.updatedAt).toLocaleDateString()}</span>
              </div>

              {offer.request.job && (
                <div className="pt-3 border-t border-green-200">
                  <Link href={`/pro/jobs/${offer.request.job.id}`}>
                    <Button variant="ghost" className="text-green-700 hover:bg-green-100">
                      View Job Details →
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          ))}
        </section>
      )}

      {/* Rejected Offers */}
      {rejectedOffers.length > 0 && (
        <details className="space-y-3">
          <summary className="text-sm font-semibold text-[#333333] cursor-pointer hover:text-[#2563EB]">
            Not Selected ({rejectedOffers.length}) - Click to view
          </summary>
          <div className="space-y-3 mt-3">
            {rejectedOffers.map((offer) => (
              <Card key={offer.id} padding="lg" variant="muted" className="opacity-60">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-[#333333] mb-1">
                      {offer.request.title}
                    </h3>
                    <p className="text-xs text-[#7C7373]">
                      {offer.request.category.nameEn} · Your offer: €{offer.proposedPrice?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <Badge variant="gray">
                    {STATUS_LABEL[offer.status]}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </details>
      )}

      {/* Empty State */}
      {offers.length === 0 && (
        <Card variant="dashed" padding="lg" className="text-center py-12">
          <p className="text-sm text-[#7C7373] mb-2">
            You haven't sent any offers yet.
          </p>
          <p className="text-xs text-[#7C7373] mb-4">
            Browse matching requests and send your first offer to get hired!
          </p>
          <Link href="/pro/requests">
            <Button>Browse Requests</Button>
          </Link>
        </Card>
      )}

      {/* Tips */}
      <Card padding="lg" variant="muted" className="space-y-2">
        <h3 className="text-sm font-semibold text-[#333333]">💡 Tips to Win More Jobs</h3>
        <ul className="text-xs text-[#7C7373] space-y-1 list-disc list-inside">
          <li>Respond quickly - clients often choose the first few offers</li>
          <li>Write personalized messages showing you understand their needs</li>
          <li>Price competitively but fairly for your expertise</li>
          <li>Complete your profile with portfolio and reviews to build trust</li>
        </ul>
      </Card>
    </div>
  );
}
