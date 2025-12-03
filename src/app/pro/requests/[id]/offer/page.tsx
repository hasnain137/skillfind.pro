// src/app/pro/requests/[id]/offer/page.tsx
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getProfessionalByClerkId } from "@/lib/get-professional";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import OfferForm from "./OfferForm";

type OfferPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProOfferPage({ params }: OfferPageProps) {
  const resolvedParams = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  // Verify professional role
  const professional = await getProfessionalByClerkId(userId);

  if (!professional) {
    redirect('/auth-redirect');
  }

  // Fetch request details
  const request = await prisma.request.findUnique({
    where: { id: resolvedParams.id },
    include: {
      category: true,
      client: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!request) {
    notFound();
  }

  // Check if request is open
  if (request.status !== 'OPEN') {
    return (
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Send offer"
          title="Request Closed"
          description="This request is no longer accepting offers."
        />
        <Card padding="lg" variant="muted">
          <p className="text-sm text-[#7C7373]">
            The client has closed this request or accepted another offer.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Send offer"
        title="Reply to this client request"
        description="Share your proposed price, timing and a friendly message. Clients see the first 10 qualified offers."
      />

      <Card padding="lg" className="space-y-3" variant="muted">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-semibold text-[#333333]">
              {request.title}
            </p>
            <p className="text-xs text-[#7C7373]">
              {request.category.nameEn} · {request.city ? `${request.city}, ${request.country}` : request.locationType}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-[#333333]">
              {request.budgetMin ? `€${request.budgetMin}` : ''}
              {request.budgetMin && request.budgetMax ? ' - ' : ''}
              {request.budgetMax ? `€${request.budgetMax}` : ''}
              {!request.budgetMin && !request.budgetMax ? 'Budget not specified' : ''}
            </p>
          </div>
        </div>
        <p className="text-sm text-[#333333]">{request.description}</p>
        <div className="flex gap-4 text-xs text-[#7C7373]">
          {request.preferredStartDate && (
            <p><strong>Start:</strong> {new Date(request.preferredStartDate).toLocaleDateString()}</p>
          )}
          <p><strong>Urgency:</strong> {request.urgency}</p>
        </div>
      </Card>

      <OfferForm requestId={request.id} requestTitle={request.title} />
    </div>
  );
}

