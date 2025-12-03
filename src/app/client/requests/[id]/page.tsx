// src/app/client/requests/[id]/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import AcceptOfferButton from './AcceptOfferButton';
import CloseRequestButton from './CloseRequestButton';

type RequestDetailPageProps = {
  params: Promise<{ id: string }>;
};

const STATUS_CONFIG = {
  OPEN: { variant: "primary" as const, label: "Open", icon: "🔵", color: "text-blue-600", bgColor: "bg-blue-50" },
  IN_PROGRESS: { variant: "warning" as const, label: "In Progress", icon: "🟡", color: "text-yellow-600", bgColor: "bg-yellow-50" },
  COMPLETED: { variant: "success" as const, label: "Completed", icon: "🟢", color: "text-green-600", bgColor: "bg-green-50" },
  CLOSED: { variant: "gray" as const, label: "Closed", icon: "⚫", color: "text-gray-600", bgColor: "bg-gray-50" },
};

export default async function ClientRequestDetailPage({
  params,
}: RequestDetailPageProps) {
  const resolvedParams = await params;

  // Get authenticated user
  const { userId } = await auth();
  if (!userId) {
    redirect('/login');
  }

  // Fetch request with all related data
  const request = await prisma.request.findUnique({
    where: { id: resolvedParams.id },
    include: {
      category: true,
      client: {
        include: {
          user: true,
        },
      },
      offers: {
        include: {
          professional: {
            include: {
              user: true,
              services: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      job: {
        include: {
          professional: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  if (!request) {
    notFound();
  }

  // Verify this request belongs to the current user
  if (request.client.user.clerkId !== userId) {
    redirect('/client');
  }

  const formatBudget = () => {
    if (!request.budgetMin && !request.budgetMax) return 'Not specified';
    if (request.budgetMin && request.budgetMax) return `€${request.budgetMin}-${request.budgetMax}`;
    if (request.budgetMin) return `From €${request.budgetMin}`;
    if (request.budgetMax) return `Up to €${request.budgetMax}`;
    return 'Not specified';
  };

  const statusConfig = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.OPEN;
  const hasOffers = request.offers.length > 0;

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200" padding="lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{statusConfig.icon}</span>
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#333333] mb-2">
              {request.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#7C7373]">
              <span className="flex items-center gap-1">📂 {request.category.nameEn}</span>
              <span>•</span>
              <span className="flex items-center gap-1">📅 Posted {new Date(request.createdAt).toLocaleDateString()}</span>
              {request.city && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">📍 {request.city}</span>
                </>
              )}
            </div>
          </div>
          {request.status === 'OPEN' && (
            <CloseRequestButton requestId={request.id} />
          )}
        </div>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Request Details */}
        <Card className="lg:col-span-2 space-y-4" padding="lg">
          <h2 className="text-base font-bold text-[#333333] flex items-center gap-2">
            <span>📋</span> Request Details
          </h2>

          {request.description && (
            <div className="bg-[#F9FAFB] p-4 rounded-xl border border-[#E5E7EB]">
              <p className="text-xs font-medium text-[#7C7373] mb-2">Description</p>
              <p className="text-sm text-[#4B5563] leading-relaxed whitespace-pre-wrap">
                {request.description}
              </p>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <InfoBox icon="📂" label="Category" value={request.category.nameEn} />
            <InfoBox icon="💰" label="Budget" value={formatBudget()} />
            <InfoBox icon="📍" label="Location" value={request.city ? `${request.city}, ${request.country}` : 'Not specified'} />
            <InfoBox icon="🏢" label="Type" value={request.locationType === 'REMOTE' ? 'Remote' : 'On-site'} />
            {request.urgency && (
              <InfoBox icon="⚡" label="Urgency" value={request.urgency} />
            )}
            {request.preferredStartDate && (
              <InfoBox icon="📅" label="Start Date" value={new Date(request.preferredStartDate).toLocaleDateString()} />
            )}
          </div>

          {request.job && (
            <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
              <h3 className="text-sm font-bold text-[#333333] flex items-center gap-2 mb-3">
                <span>✅</span> Active Job
              </h3>
              <Link href={`/client/jobs/${request.job.id}`}>
                <Button variant="ghost" className="w-full sm:w-auto border border-[#E5E7EB]">
                  View Job Details →
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status Card */}
          <Card className={`${statusConfig.bgColor} border-2`} padding="lg">
            <div className="text-center">
              <div className="text-3xl mb-2">{statusConfig.icon}</div>
              <p className={`text-lg font-bold ${statusConfig.color} mb-1`}>
                {statusConfig.label}
              </p>
              <p className="text-xs text-[#7C7373]">Current Status</p>
            </div>
          </Card>

          {/* Stats Card */}
          <Card className="space-y-3" padding="lg">
            <h3 className="text-base font-bold text-[#333333] flex items-center gap-2">
              <span>📊</span> Overview
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-[#E5E7EB]">
                <span className="text-xs text-[#7C7373]">Offers Received</span>
                <span className="text-sm font-bold text-[#2563EB]">{request.offers.length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#E5E7EB]">
                <span className="text-xs text-[#7C7373]">Created</span>
                <span className="text-xs font-medium text-[#333333]">{new Date(request.createdAt).toLocaleDateString()}</span>
              </div>
              {request.updatedAt && new Date(request.updatedAt).getTime() !== new Date(request.createdAt).getTime() && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-[#7C7373]">Last Updated</span>
                  <span className="text-xs font-medium text-[#333333]">{new Date(request.updatedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Offers Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#333333] flex items-center gap-2">
              <span>💼</span> Offers from Professionals
            </h2>
            <p className="text-sm text-[#7C7373] mt-1">
              {hasOffers ? "Review each offer carefully and view the professional's profile to learn more." : "No offers yet. Professionals matching your request will be notified."}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-lg">📬</span>
            <span className="text-sm font-bold text-blue-700">{request.offers.length}</span>
          </div>
        </div>

        {!hasOffers ? (
          <Card variant="muted" padding="lg" className="text-center">
            <div className="py-8">
              <span className="text-5xl mb-3 block">📭</span>
              <p className="text-sm font-medium text-[#7C7373] mb-2">No offers yet</p>
              <p className="text-xs text-[#B0B0B0] max-w-md mx-auto">
                Professionals matching your request will be notified. You can update your request details or share more context to attract the right professionals.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {request.offers.map((offer) => (
              <Card key={offer.id} padding="lg" className="hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  {/* Professional Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#1D4FD8] text-white font-bold text-sm shadow-md">
                        {offer.professional.user.firstName?.[0]}{offer.professional.user.lastName?.[0]}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#333333]">
                          {offer.professional.user.firstName || 'Professional'} {offer.professional.user.lastName || ''}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {offer.professional.averageRating > 0 && (
                            <div className="flex items-center gap-1 text-xs text-[#7C7373]">
                              <span>⭐</span>
                              <span>{offer.professional.averageRating.toFixed(1)}</span>
                              <span>({offer.professional.totalReviews})</span>
                            </div>
                          )}
                          {offer.professional.city && (
                            <>
                              <span className="text-[#E5E7EB]">•</span>
                              <span className="text-xs text-[#7C7373]">📍 {offer.professional.city}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#2563EB]">
                        {offer.proposedPrice ? `€${offer.proposedPrice}` : 'Negotiable'}
                      </p>
                      <Badge variant={offer.status === 'PENDING' ? 'primary' : offer.status === 'ACCEPTED' ? 'success' : 'gray'} className="mt-1">
                        {offer.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="bg-[#F9FAFB] p-3 rounded-lg border border-[#E5E7EB]">
                    <p className="text-sm text-[#4B5563] leading-relaxed">{offer.message}</p>
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#7C7373]">
                    <span className="flex items-center gap-1">
                      📅 Sent {new Date(offer.createdAt).toLocaleDateString()}
                    </span>
                    {offer.estimatedDuration && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">⏱️ {offer.estimatedDuration}</span>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-[#E5E7EB]">
                    <Link href={`/professionals/${offer.professionalId}`}>
                      <Button
                        variant="ghost"
                        className="border border-[#E5E7EB] px-4 py-2 text-xs hover:bg-gray-50"
                      >
                        👤 View Profile
                      </Button>
                    </Link>
                    {offer.status === 'PENDING' && request.status === 'OPEN' && (
                      <AcceptOfferButton
                        offerId={offer.id}
                        requestId={request.id}
                      />
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
