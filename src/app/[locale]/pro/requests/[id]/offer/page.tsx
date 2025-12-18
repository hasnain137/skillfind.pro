// src/app/pro/requests/[id]/offer/page.tsx
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getProfessionalByClerkId } from "@/lib/get-professional";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import OfferForm from "./OfferForm";
import { getTranslations } from 'next-intl/server';

type OfferPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProOfferPage({ params }: OfferPageProps) {
  const resolvedParams = await params;
  const { userId } = await auth();
  const t = await getTranslations('OfferForm.page');

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
          eyebrow={t('eyebrow')}
          title={t('closedTitle')}
          description={t('closedDesc')}
        />
        <Card padding="lg" level={2}>
          <p className="text-sm text-[#7C7373]">
            {t('closedMessage')}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />

      <Card padding="lg" className="space-y-3" level={2}>
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
              {!request.budgetMin && !request.budgetMax ? t('budgetSpecified') : ''}
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
