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

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CLOSED: "Closed",
};

const STATUS_VARIANT: Record<string, "primary" | "warning" | "success" | "gray"> = {
  OPEN: "primary",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  CLOSED: "gray",
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

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Request detail"
        title={request.title}
        description={`Request ID #${request.id.substring(0, 8)}`}
        actions={
          request.status === 'OPEN' ? (
            <CloseRequestButton requestId={request.id} />
          ) : undefined
        }
      />

      <Card padding="lg" className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={STATUS_VARIANT[request.status]}>
            {STATUS_LABEL[request.status]}
          </Badge>
          <p className="text-xs text-[#7C7373]">
            Created on {new Date(request.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoRow label="Category" value={request.category.nameEn} />
          <InfoRow label="Location" value={`${request.city || 'Not specified'} · ${request.locationType === 'REMOTE' ? 'Remote' : 'On-site'}`} />
          <InfoRow label="Budget" value={formatBudget()} />
          <InfoRow label="Offers" value={`${request.offers.length} received`} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7C7373]">
            Description
          </p>
          <p className="mt-2 text-sm text-[#4B5563]">
            {request.description}
          </p>
        </div>

        {request.urgency && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7C7373]">
              Urgency
            </p>
            <p className="mt-2 text-sm text-[#4B5563]">
              {request.urgency}
            </p>
          </div>
        )}

        {request.preferredStartDate && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7C7373]">
              Preferred Start Date
            </p>
            <p className="mt-2 text-sm text-[#4B5563]">
              {new Date(request.preferredStartDate).toLocaleDateString()}
            </p>
          </div>
        )}

        {request.job && (
          <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
            <p className="text-sm font-semibold text-[#333333] mb-2">
              Active Job
            </p>
            <Link href={`/client/jobs/${request.job.id}`}>
              <Button variant="ghost">View Job Details</Button>
            </Link>
          </div>
        )}
      </Card>

      <section className="space-y-3">
        <SectionHeading
          variant="section"
          title={`Offers from professionals (${request.offers.length})`}
          description={
            request.offers.length > 0
              ? "Review each offer carefully and view the professional's profile to learn more."
              : "No offers yet. Professionals matching your request will be notified."
          }
        />

        {request.offers.length === 0 ? (
          <Card variant="muted" padding="lg" className="text-sm text-[#7C7373]">
            No offers yet. You can update your request details or share more
            context to attract the right professionals.
          </Card>
        ) : (
          <div className="space-y-3">
            {request.offers.map((offer) => (
              <Card key={offer.id} padding="lg" className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[#333333]">
                      {offer.professional.user.firstName || 'Professional'} {offer.professional.user.lastName || ''}
                    </p>
                    <p className="text-xs text-[#7C7373]">
                      Professional
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-[#2563EB]">
                    {offer.proposedPrice ? `€${offer.proposedPrice}` : 'Price negotiable'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#7C7373]">
                  <Badge variant={offer.status === 'PENDING' ? 'primary' : offer.status === 'ACCEPTED' ? 'success' : 'gray'}>
                    {offer.status}
                  </Badge>
                  <span>Sent {new Date(offer.createdAt).toLocaleDateString()}</span>
                </div>

                <p className="text-sm text-[#4B5563]">{offer.message}</p>

                <div className="flex flex-wrap gap-2">
                  <Link href={`/pro/${offer.professionalId}`}>
                    <Button
                      variant="ghost"
                      className="border border-[#E5E7EB] px-4 py-2 text-xs"
                    >
                      View profile
                    </Button>
                  </Link>
                  {offer.status === 'PENDING' && request.status === 'OPEN' && (
                    <AcceptOfferButton 
                      offerId={offer.id} 
                      requestId={request.id}
                    />
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3">
      <p className="text-[11px] text-[#7C7373]">{label}</p>
      <p className="text-sm font-semibold text-[#333333]">{value}</p>
    </div>
  );
}
