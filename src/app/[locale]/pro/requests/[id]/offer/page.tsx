// src/app/pro/requests/[id]/offer/page.tsx
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getProfessionalWithRelations } from "@/lib/get-professional";
import { getMinimumWalletBalance } from "@/lib/services/wallet";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import OfferForm from "./OfferForm";
import { getTranslations } from 'next-intl/server';
import { Link } from "@/i18n/routing";
import { Professional, Wallet } from "@prisma/client";

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
  const professional = await getProfessionalWithRelations(userId, { wallet: true }) as (Professional & { wallet: Wallet | null }) | null;

  if (!professional) {
    redirect('/auth-redirect');
  }

  // Check professional status and wallet balance
  const isProfessionalActive = professional.status === 'ACTIVE';
  const minBalance = await getMinimumWalletBalance();
  const hasMinBalance = (professional.wallet?.balance || 0) >= minBalance;

  if (!isProfessionalActive || !hasMinBalance) {
    const tRestrict = await getTranslations('OfferForm.restrictions');
    return (
      <div className="space-y-6">
        <SectionHeading
          eyebrow={t('eyebrow')}
          title={!isProfessionalActive ? tRestrict('notActive') : tRestrict('lowBalance')}
          description={!isProfessionalActive ? "Veuillez contacter le support pour plus d'informations." : "Rechargez votre portefeuille pour continuer à proposer vos services."}
        />
        {!hasMinBalance && (
          <Card padding="lg" level={2} className="text-center py-12">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-lg font-semibold text-[#333333] mb-4">{tRestrict('lowBalance')}</h3>
            <Link
              href="/pro/wallet"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2563EB] px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#1D4FD8] hover:shadow-lg"
            >
              {tRestrict('recharge')}
            </Link>
          </Card>
        )}
      </div>
    );
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

      <OfferForm
        requestId={request.id}
        requestTitle={request.title}
        requestDetails={{
          budgetMin: request.budgetMin,
          budgetMax: request.budgetMax,
          description: request.description,
          city: request.city,
          locationType: request.locationType,
          createdAt: request.createdAt,
          categoryName: request.category.nameEn
        }}
      />
    </div>
  );
}
