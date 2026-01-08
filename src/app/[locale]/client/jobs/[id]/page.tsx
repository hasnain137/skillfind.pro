// src/app/client/jobs/[id]/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { Link } from '@/i18n/routing';
import { Card } from '@/components/ui/Card';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import CompleteJobButton from './CompleteJobButton';

type JobDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ClientJobDetailPage({ params, searchParams }: JobDetailPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const showSuccessBanner = resolvedSearchParams.accepted === 'true';

  const { userId } = await auth();
  const t = await getTranslations('ClientJobs');

  if (!userId) {
    redirect('/login');
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
      review: true,
    },
  });

  if (!job) {
    notFound();
  }

  // Verify this job belongs to the current user
  if (job.request.client.user.clerkId !== userId) {
    redirect('/client');
  }

  const STATUS_CONFIG = {
    PENDING: { variant: "primary" as BadgeVariant, label: t('status.pending'), icon: "🔵", color: "text-blue-600", bgColor: "bg-blue-50" },
    IN_PROGRESS: { variant: "warning" as BadgeVariant, label: t('status.inProgress'), icon: "🟡", color: "text-yellow-600", bgColor: "bg-yellow-50" },
    COMPLETED: { variant: "success" as BadgeVariant, label: t('status.completed'), icon: "🟢", color: "text-green-600", bgColor: "bg-green-50" },
    CANCELLED: { variant: "gray" as BadgeVariant, label: t('status.cancelled'), icon: "⚫", color: "text-gray-600", bgColor: "bg-gray-50" },
    DISPUTED: { variant: "gray" as BadgeVariant, label: t('status.disputed'), icon: "⚠️", color: "text-orange-600", bgColor: "bg-orange-50" },
  };

  const statusConfig = STATUS_CONFIG[job.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
  const canComplete = job.status === 'IN_PROGRESS';
  const isCompleted = job.status === 'COMPLETED';
  const hasReview = !!job.review;

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      {showSuccessBanner && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="text-2xl">🎉</div>
          <div>
            <h3 className="text-emerald-800 font-bold text-lg mb-1">Offer Accepted!</h3>
            <p className="text-emerald-700 text-sm">
              You can now contact each other directly using the details below.
            </p>
          </div>
        </div>
      )}
      {/* Enhanced Header */}
      <Card className={`bg-gradient-to-br ${isCompleted ? 'from-green-50 to-white border-green-200' : 'from-blue-50 to-white border-blue-200'}`} padding="lg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{statusConfig.icon}</span>
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
              <Badge variant="success" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                📞 {t('detail.contact_exchanged')}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#333333] mb-2">
              {job.request.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#7C7373]">
              <span className="flex items-center gap-1">
                📂 {job.request.category.nameEn}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                📅 {t('detail.started_date', { date: new Date(job.startedAt || job.createdAt).toLocaleDateString() })}
              </span>
              {job.completedAt && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    ✅ {t('detail.completed_date', { date: new Date(job.completedAt).toLocaleDateString() })}
                  </span>
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
            <InfoBox icon="📅" label={t('detail.started_label')} value={new Date(job.startedAt || job.createdAt).toLocaleDateString()} />
            {job.completedAt && (
              <InfoBox icon="✅" label={t('detail.completed_label')} value={new Date(job.completedAt).toLocaleDateString()} />
            )}
          </div>

          {/* Review Display */}
          {job.review && (
            <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
              <h3 className="text-sm font-bold text-[#333333] flex items-center gap-2 mb-3">
                <span>⭐</span> {t('detail.review_label')}
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
                  <p className="text-sm text-gray-700 leading-relaxed">"{job.review.content}"</p>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Professional Card */}
          <Card className="space-y-4" padding="lg">
            <h2 className="text-base font-bold text-[#333333] flex items-center gap-2">
              <span>👤</span> {t('detail.pro_section')}
            </h2>

            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#1D4FD8] text-white font-bold text-lg shadow-md">
                {(job.professional.user.firstName || 'P')[0]}{(job.professional.user.lastName || 'P')[0]}
              </div>
              <div>
                <p className="text-sm font-bold text-[#333333]">
                  {job.professional.user.firstName || 'Professional'} {job.professional.user.lastName || ''}
                </p>
                {job.professional.averageRating > 0 && (
                  <div className="flex items-center gap-1 text-xs text-[#7C7373] mt-1">
                    <span>⭐</span>
                    <span>{job.professional.averageRating.toFixed(1)}</span>
                    <span>({job.professional.totalReviews})</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-[#7C7373]">
                <span>📧</span>
                <span className="text-xs">{job.professional.user.email}</span>
              </div>
              {job.professional.user.phoneNumber && (
                <div className="flex items-center gap-2 text-[#7C7373]">
                  <span>📱</span>
                  <span className="text-xs">{job.professional.user.phoneNumber}</span>
                </div>
              )}
              {job.professional.city && (
                <div className="flex items-center gap-2 text-[#7C7373]">
                  <span>📍</span>
                  <span className="text-xs">{job.professional.city}</span>
                </div>
              )}
            </div>

            <Link href={`/professionals/${job.professionalId}`}>
              <Button variant="ghost" className="w-full text-xs border border-[#E5E7EB]">
                {t('detail.view_profile')}
              </Button>
            </Link>
          </Card>

          {/* Status Card */}
          <Card className={`${statusConfig.bgColor} border-2`} padding="lg">
            <div className="text-center">
              <div className="text-3xl mb-2">{statusConfig.icon}</div>
              <p className={`text-lg font-bold ${statusConfig.color} mb-1`}>
                {statusConfig.label}
              </p>
              <p className="text-xs text-[#7C7373]">{t('detail.current_status')}</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <Card padding="lg" className="space-y-3">
        <h3 className="text-base font-bold text-[#333333] flex items-center gap-2">
          <span>⚡</span> {t('detail.actions_section')}
        </h3>

        <div className="flex flex-wrap gap-3">
          {canComplete && (
            <CompleteJobButton jobId={job.id} />
          )}

          {isCompleted && !hasReview && (
            <Link href={`/client/jobs/${job.id}/review`}>
              <Button className="shadow-md">
                ⭐ {t('detail.leave_review')}
              </Button>
            </Link>
          )}

          {hasReview && (
            <div className="flex items-center gap-2 rounded-lg bg-green-100 border border-green-200 px-4 py-2 text-sm text-green-700">
              <span>✅</span>
              <span>{t('detail.review_submitted')}</span>
            </div>
          )}

          <Link href={`/professionals/${job.professionalId}`}>
            <Button variant="ghost" className="border border-[#E5E7EB]">
              👤 {t('detail.view_pro_profile')}
            </Button>
          </Link>
        </div>
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
