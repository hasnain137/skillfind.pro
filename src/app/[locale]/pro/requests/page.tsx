// src/app/pro/requests/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Link } from '@/i18n/routing';
import { prisma } from "@/lib/prisma";
import { getProfessionalWithRelations } from "@/lib/get-professional";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { StatusBanner, getProfessionalStatusBanner } from "@/components/ui/StatusBanner";

export default async function ProRequestsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/login');

  const professional: any = await getProfessionalWithRelations(userId, {
    services: { include: { subcategory: { include: { category: true } } } },
  });

  if (!professional) redirect('/auth-redirect');

  // 2. Get Category IDs from Professional's Services
  const serviceCategoryIds = professional.services.map(
    (s: any) => s.subcategory.category.id
  );

  // Remove duplicates
  const uniqueCategoryIds = [...new Set(serviceCategoryIds)] as string[];

  // 3. Fetch Matching Open Requests
  const requests = await prisma.request.findMany({
    where: {
      status: 'OPEN',
      categoryId: {
        in: uniqueCategoryIds,
      },
      // Optional: Filter by location if professional has location preferences
    },
    include: {
      category: true,
      client: {
        include: {
          user: {
            select: {
              firstName: true,
            },
          },
        },
      },
      _count: {
        select: { offers: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  }) as any[];

  const newRequests = requests.filter(r => {
    const daysSincePosted = Math.floor((Date.now() - r.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    return daysSincePosted === 0;
  });

  const urgentRequests = requests.filter(r => r.urgency === 'URGENT');

  // Get status banner for non-active professionals
  const statusBannerProps = professional.status !== 'ACTIVE'
    ? getProfessionalStatusBanner(professional.status)
    : null;

  return (
    <div className="space-y-6">
      {/* Status Banner - Using reusable component */}
      {statusBannerProps && (
        <StatusBanner {...statusBannerProps} />
      )}

      <SectionHeading
        eyebrow="Matching requests"
        title="Newest opportunities"
        description="These requests match your services. Respond quickly to increase your chances."
      />

      {/* Stats Overview */}
      {requests.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-4">
          <Card padding="lg" className="text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <p className="text-2xl font-bold text-blue-600">{requests.length}</p>
            <p className="text-xs text-blue-700 font-medium">Total Matches</p>
          </Card>
          <Card padding="lg" className="text-center bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <p className="text-2xl font-bold text-red-600">{newRequests.length}</p>
            <p className="text-xs text-red-700 font-medium">New Today</p>
          </Card>
          <Card padding="lg" className="text-center bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <p className="text-2xl font-bold text-orange-600">{urgentRequests.length}</p>
            <p className="text-xs text-orange-700 font-medium">Urgent</p>
          </Card>
          <Card padding="lg" className="text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <p className="text-2xl font-bold text-green-600">{professional.services.length}</p>
            <p className="text-xs text-green-700 font-medium">Your Services</p>
          </Card>
        </div>
      )}

      {requests.length === 0 ? (
        <Card level={1} padding="lg" className="text-center py-12 border-dashed">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-[#333333] mb-2">No matching requests</h3>
          <p className="text-sm text-[#7C7373] mb-6 max-w-md mx-auto">
            Try adding more services to your profile to see more opportunities.
          </p>
          <Link href="/pro/profile">
            <span className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#1D4FD8] hover:shadow-lg">
              <span>⚙️</span> Update Services
            </span>
          </Link>
        </Card>
      ) : (
        <section className="space-y-4">
          {requests.map((request) => {
            const isNew = (Date.now() - new Date(request.createdAt).getTime()) < 24 * 60 * 60 * 1000;
            const isUrgent = request.urgency === 'URGENT';
            const hasMultipleOffers = request._count.offers >= 3;

            return (
              <Card
                key={request.id}
                className="group relative overflow-hidden hover:border-[#2563EB] hover:shadow-md transition-all duration-200 cursor-pointer"
                padding="lg"
              >
                {/* Badges */}
                {isNew && (
                  <div className="absolute -top-1 -right-1 bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-md">
                    🔥 NEW
                  </div>
                )}
                {isUrgent && !isNew && (
                  <div className="absolute -top-1 -right-1 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-md">
                    ⚡ URGENT
                  </div>
                )}

                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-[#333333] group-hover:text-[#2563EB] transition-colors">
                        {request.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-[#7C7373]">
                        <span className="flex items-center gap-1">
                          📂 {request.category.nameEn}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          📅 Posted {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {hasMultipleOffers && (
                      <Badge variant="neutral">
                        {request._count.offers} offers
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  {request.description && (
                    <p className="text-sm text-[#4B5563] line-clamp-2 leading-relaxed">
                      {request.description}
                    </p>
                  )}

                  {/* Details */}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 rounded-lg bg-[#EEF2FF] px-2.5 py-1 font-semibold text-[#2563EB]">
                      <span>💰</span> {formatBudget(request)}
                    </span>

                    {request.city && (
                      <span className="flex items-center gap-1 text-[#7C7373]">
                        <span>📍</span> {request.city}
                      </span>
                    )}

                    {request.locationType === 'REMOTE' && (
                      <span className="flex items-center gap-1 rounded-lg bg-[#DCFCE7] px-2.5 py-1 font-semibold text-[#166534]">
                        <span>💻</span> Remote
                      </span>
                    )}

                    {request.preferredStartDate && (
                      <span className="flex items-center gap-1 text-[#7C7373]">
                        <span>📅</span> Start: {new Date(request.preferredStartDate).toLocaleDateString()}
                      </span>
                    )}

                    {request.urgency && (
                      <span className="flex items-center gap-1 rounded-lg bg-[#FEF3C7] px-2.5 py-1 font-semibold text-[#92400E]">
                        <span>⏱️</span> {request.urgency}
                      </span>
                    )}
                  </div>

                  {/* Client Info */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#1D4FD8] text-white text-xs font-bold">
                        {(request.client.user.firstName || 'C')[0]}
                      </div>
                      <span className="text-xs text-[#7C7373]">
                        Client: {request.client.user.firstName || 'Client'}
                      </span>
                    </div>
                    {professional.status === 'ACTIVE' ? (
                      <Link
                        href={`/pro/requests/${request.id}/offer`}
                        className="inline-flex items-center justify-center gap-1 rounded-full bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-[#1D4FD8] hover:shadow-lg"
                      >
                        Send Offer →
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="inline-flex items-center justify-center gap-1 rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-400 cursor-not-allowed"
                      >
                        {professional.status === 'PENDING_REVIEW' ? 'Pending Approval' : 'Account Inactive'}
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}

function formatBudget(request: any) {
  if (request.budgetMin && request.budgetMax) {
    return `€${request.budgetMin}-€${request.budgetMax}`;
  }
  if (request.budgetMin) return `From €${request.budgetMin}`;
  if (request.budgetMax) return `Up to €${request.budgetMax}`;
  return 'Budget TBD';
}
