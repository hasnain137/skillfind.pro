// src/app/pro/requests/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";

export default async function ProRequestsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  // 1. Get Professional Profile & Services
  const professional = await prisma.professional.findUnique({
    where: { userId },
    include: {
      services: {
        include: {
          subcategory: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  if (!professional) {
    // If user is logged in but not a professional, redirect to role selection or home
    redirect('/complete-profile');
  }

  // 2. Get Category IDs from Professional's Services
  const serviceCategoryIds = professional.services.map(
    (s) => s.subcategory.category.id
  );

  // Remove duplicates
  const uniqueCategoryIds = [...new Set(serviceCategoryIds)];

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
  });

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Matching requests"
        title="Newest opportunities"
        description="These requests match your services. Respond quickly to increase your chances."
      />

      {requests.length === 0 ? (
        <Card variant="dashed" padding="lg" className="text-center py-12">
          <p className="text-sm text-[#7C7373] mb-2">
            No matching requests found right now.
          </p>
          <p className="text-xs text-[#7C7373]">
            Try adding more services to your profile to see more opportunities.
          </p>
          <div className="mt-4">
            <Link href="/pro/profile">
              <span className="text-sm font-semibold text-[#2563EB] hover:underline">
                Update Services
              </span>
            </Link>
          </div>
        </Card>
      ) : (
        <section className="space-y-3">
          {requests.map((request) => (
            <Card
              key={request.id}
              variant="muted"
              padding="lg"
              className="space-y-3 transition-colors hover:border-[#2563EB]/30"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#333333]">
                    {request.title}
                  </h3>
                  <p className="text-xs text-[#7C7373] mt-1">
                    {request.category.nameEn} · {request.city || 'Location not specified'}
                  </p>
                </div>
                {request._count.offers > 0 && (
                  <Badge variant="neutral">
                    {request._count.offers} offer{request._count.offers !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              <p className="text-sm text-[#4B5563] line-clamp-2">
                {request.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#7C7373]">
                <span className="flex items-center gap-1">
                  🕒 Posted {new Date(request.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  💰 {formatBudget(request)}
                </span>
                {request.preferredStartDate && (
                  <span className="flex items-center gap-1">
                    📅 {new Date(request.preferredStartDate).toLocaleDateString()}
                  </span>
                )}
                {request.urgency && (
                  <span className="flex items-center gap-1">
                    ⏱️ {request.urgency}
                  </span>
                )}
              </div>

              <div className="pt-2">
                <Link
                  href={`/pro/requests/${request.id}/offer`}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1D4FD8] sm:w-auto"
                >
                  View details & send offer
                </Link>
              </div>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}

function formatBudget(request: any) {
  if (request.budgetMin && request.budgetMax) {
    return `€${request.budgetMin} - €${request.budgetMax}`;
  }
  if (request.budgetMin) return `From €${request.budgetMin}`;
  if (request.budgetMax) return `Up to €${request.budgetMax}`;
  return 'Budget not specified';
}

