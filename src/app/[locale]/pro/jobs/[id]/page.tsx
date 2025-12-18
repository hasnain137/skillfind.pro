// src/app/pro/jobs/[id]/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getTranslations } from 'next-intl/server';
import { prisma } from "@/lib/prisma";
import { getProfessionalByClerkId } from "@/lib/get-professional";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import StartJobButton from "./StartJobButton";
import CompleteJobButton from "./CompleteJobButton";

type ProJobDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProJobDetailPage({ params }: ProJobDetailPageProps) {
  const resolvedParams = await params;
  const { userId } = await auth();
  const t = await getTranslations('ProJobs');

  if (!userId) {
    redirect('/login');
  }

  const professional = await getProfessionalByClerkId(userId);

  if (!professional) {
    redirect('/auth-redirect');
  }

  const job = await prisma.job.findUnique({
    where: { id: resolvedParams.id },
    include: {
      request: {
        include: {
          category: true,
          client: {
            include: {
              user: true,
            },
          },
        },
      },
      professional: {
        include: {
          user: true,
        },
      },
      review: {
        include: {
          professionalResponse: true,
        },
      },
    },
  });

  if (!job) {
    notFound();
  }

  // Verify this job belongs to the professional
  if (job.professionalId !== professional.id) {
    redirect('/pro/jobs');
  }

  const STATUS_CONFIG = {
    ACCEPTED: { variant: "primary" as BadgeVariant, label: t('status.accepted'), icon: "🔵", color: "text-blue-600", bgColor: "bg-blue-50" },
    IN_PROGRESS: { variant: "warning" as BadgeVariant, label: t('status.inProgress'), icon: "🟡", color: "text-yellow-600", bgColor: "bg-yellow-50" },
    COMPLETED: { variant: "success" as BadgeVariant, label: t('status.completed'), icon: "🟢", color: "text-green-600", bgColor: "bg-green-50" },
    CANCELLED: { variant: "gray" as BadgeVariant, label: t('status.cancelled'), icon: "⚫", color: "text-gray-600", bgColor: "bg-gray-50" },
    DISPUTED: { variant: "gray" as BadgeVariant, label: t('status.disputed'), icon: "⚠️", color: "text-orange-600", bgColor: "bg-orange-50" },
  };

  const statusConfig = STATUS_CONFIG[job.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.ACCEPTED;
  const canStart = job.status === 'ACCEPTED';
  const canComplete = job.status === 'IN_PROGRESS';
  const isCompleted = job.status === 'COMPLETED';

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <Card className={`bg-gradient-to-br ${isCompleted ? 'from-green-50 to-white border-green-200' : 'from-blue-50 to-white border-blue-200'}`} padding="lg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{statusConfig.icon}</span>
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#333333] mb-2">
              {job.request.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#7C7373]">
              <span className="flex items-center gap-1">📂 {job.request.category.nameEn}</span>
              <span>•</span>
              <span className="flex items-center gap-1">🆔 {t('detail.job_id', { id: job.id.substring(0, 8) })}</span>
              {job.startedAt && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">📅 {t('detail.started_date', { date: new Date(job.startedAt).toLocaleDateString() })}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Job Details */}
        <Card className="lg:col-span-2 space-y-4" padding="lg">
          <h2 className="text-base font-bold text-[#333333] flex items-center gap-2">
            <span>📋</span> {t('detail.section_details')}
          </h2>

          {job.request.description && (
            <div className="bg-[#F9FAFB] p-4 rounded-xl border border-[#E5E7EB]">
              <p className="text-xs font-medium text-[#7C7373] mb-2">{t('detail.description_label')}</p>
              <p className="text-sm text-[#4B5563] leading-relaxed whitespace-pre-wrap">
                {job.request.description}
              </p>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <InfoBox icon="📂" label="Category" value={job.request.category.nameEn} />
            <InfoBox icon="💰" label={t('detail.agreed_price')} value={job.agreedPrice ? `€${job.agreedPrice.toFixed(2)}` : 'Not specified'} />
            <InfoBox icon="📅" label={t('detail.created_label')} value={new Date(job.createdAt).toLocaleDateString()} />
            {job.startedAt && (
              <InfoBox icon="🚀" label={t('detail.started_label')} value={new Date(job.startedAt).toLocaleDateString()} />
            )}
            {job.completedAt && (
              <InfoBox icon="✅" label={t('detail.completed_label')} value={new Date(job.completedAt).toLocaleDateString()} />
            )}
          </div>

          {/* Review Display */}
          {job.review && (
            <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
              <h3 className="text-sm font-bold text-[#333333] flex items-center gap-2 mb-3">
                <span>⭐</span> {t('detail.client_review')}
              </h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-base ${i < job.review!.rating ? 'text-yellow-500' : 'text-gray-300'}`}>
                      ★
                    </span>
                  ))}
                  <span className="text-sm font-bold text-yellow-700">{job.review.rating}/5</span>
                </div>
                {job.review.content && (
                  <p className="text-sm text-gray-700 leading-relaxed mb-2">"{job.review.content}"</p>
                )}
                {!job.review.professionalResponse && (
                  <Link href={`/pro/reviews/${job.review.id}/respond`}>
                    <Button variant="ghost" className="text-xs mt-2 border border-yellow-300">
                      💬 {t('detail.respond_review')}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Additional Request Details */}
          <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
            <h3 className="text-sm font-bold text-[#333333] mb-3">{t('detail.original_request')}</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between py-2 border-b border-[#E5E7EB]">
                <span className="text-[#7C7373]">{t('detail.budget_range')}:</span>
                <span className="font-medium text-[#333333]">
                  {job.request.budgetMin && job.request.budgetMax
                    ? `€${job.request.budgetMin} - €${job.request.budgetMax}`
                    : 'Not specified'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#E5E7EB]">
                <span className="text-[#7C7373]">{t('detail.location_type')}:</span>
                <span className="font-medium text-[#333333]">{job.request.locationType || 'Not specified'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#E5E7EB]">
                <span className="text-[#7C7373]">{t('detail.urgency')}:</span>
                <span className="font-medium text-[#333333]">{job.request.urgency || 'Not specified'}</span>
              </div>
              {job.request.preferredStartDate && (
                <div className="flex justify-between py-2">
                  <span className="text-[#7C7373]">{t('detail.preferred_start')}:</span>
                  <span className="font-medium text-[#333333]">
                    {new Date(job.request.preferredStartDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
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

          {/* Client Card */}
          <Card className="space-y-4" padding="lg">
            <h2 className="text-base font-bold text-[#333333] flex items-center gap-2">
              <span>👤</span> {t('detail.client_section')}
            </h2>

            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#1D4FD8] text-white font-bold text-lg shadow-md">
                {(job.request.client.user.firstName || 'C')[0]}{(job.request.client.user.lastName || '')[0]}
              </div>
              <div>
                <p className="text-sm font-bold text-[#333333]">
                  {job.request.client.user.firstName} {job.request.client.user.lastName}
                </p>
                <p className="text-xs text-[#7C7373] mt-1">{t('detail.client_label')}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-[#7C7373]">
                <span>📧</span>
                <span className="text-xs">{job.request.client.user.email}</span>
              </div>
              {job.request.client.user.phoneNumber && (
                <div className="flex items-center gap-2 text-[#7C7373]">
                  <span>📱</span>
                  <span className="text-xs">{job.request.client.user.phoneNumber}</span>
                </div>
              )}
              {job.request.city && (
                <div className="flex items-center gap-2 text-[#7C7373]">
                  <span>📍</span>
                  <span className="text-xs">{job.request.city}, {job.request.country}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <Card padding="lg" className="space-y-3">
        <h3 className="text-base font-bold text-[#333333] flex items-center gap-2">
          <span>⚡</span> {t('detail.actions_section')}
        </h3>

        {canStart && (
          <div className="space-y-2">
            <p className="text-sm text-[#7C7373]">
              🎉 {t('detail.start_hint')}
            </p>
            <StartJobButton jobId={job.id} />
          </div>
        )}

        {canComplete && (
          <div className="space-y-2">
            <p className="text-sm text-[#7C7373]">
              🔨 {t('detail.complete_hint')}
            </p>
            <CompleteJobButton jobId={job.id} />
          </div>
        )}

        {isCompleted && !job.review && (
          <div className="flex items-center gap-2 rounded-lg bg-green-100 border border-green-200 px-4 py-3 text-sm text-green-700">
            <span>✅</span>
            <span>{t('detail.completed_hint')}</span>
          </div>
        )}
      </Card>
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
