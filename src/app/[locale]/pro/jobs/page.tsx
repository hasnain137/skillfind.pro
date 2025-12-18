// src/app/pro/jobs/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTranslations } from 'next-intl/server';
import { prisma } from "@/lib/prisma";
import { getProfessionalWithRelations } from "@/lib/get-professional";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";

type JobStatus = "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DISPUTED";

export default async function ProJobsPage() {
  const { userId } = await auth();
  const t = await getTranslations('ProJobs');

  if (!userId) {
    redirect('/login');
  }

  const professional: any = await getProfessionalWithRelations(userId, {
    jobs: {
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
        review: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    },
  });

  if (!professional) {
    redirect('/auth-redirect');
  }

  const jobs = professional.jobs || [];
  const activeJobs = jobs.filter((j: any) => j.status === 'ACCEPTED' || j.status === 'IN_PROGRESS');
  const completedJobs = jobs.filter((j: any) => j.status === 'COMPLETED');

  const totalEarnings = jobs.reduce((sum: number, j: any) => sum + (j.agreedPrice || 0), 0);
  const pendingJobs = jobs.filter((j: any) => j.status === 'ACCEPTED');
  const inProgressJobs = jobs.filter((j: any) => j.status === 'IN_PROGRESS');

  const STATUS_VARIANT = {
    ACCEPTED: "primary" as BadgeVariant,
    IN_PROGRESS: "warning" as BadgeVariant,
    COMPLETED: "success" as BadgeVariant,
    CANCELLED: "gray" as BadgeVariant,
    DISPUTED: "gray" as BadgeVariant,
  };

  const STATUS_LABEL = {
    ACCEPTED: t('status.accepted'),
    IN_PROGRESS: t('status.inProgress'),
    COMPLETED: t('status.completed'),
    CANCELLED: t('status.cancelled'),
    DISPUTED: t('status.disputed'),
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />

      {/* Enhanced Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card level={1} className="text-center bg-gradient-to-br from-yellow-50 to-white border-yellow-200" padding="md">
          <CardContent className="p-3">
            <p className="text-xl font-bold text-yellow-600">{pendingJobs.length}</p>
            <p className="text-[10px] text-yellow-700 font-medium uppercase tracking-wide">{t('stats.ready')}</p>
          </CardContent>
        </Card>
        <Card level={1} className="text-center bg-gradient-to-br from-blue-50 to-white border-blue-200" padding="md">
          <CardContent className="p-3">
            <p className="text-xl font-bold text-blue-600">{inProgressJobs.length}</p>
            <p className="text-[10px] text-blue-700 font-medium uppercase tracking-wide">{t('stats.inProgress')}</p>
          </CardContent>
        </Card>
        <Card level={1} className="text-center bg-gradient-to-br from-green-50 to-white border-green-200" padding="md">
          <CardContent className="p-3">
            <p className="text-xl font-bold text-green-600">{completedJobs.length}</p>
            <p className="text-[10px] text-green-700 font-medium uppercase tracking-wide">{t('stats.completed')}</p>
          </CardContent>
        </Card>
        <Card level={1} className="text-center bg-gradient-to-br from-purple-50 to-white border-purple-200" padding="md">
          <CardContent className="p-3">
            <p className="text-xl font-bold text-purple-600">€{totalEarnings.toFixed(0)}</p>
            <p className="text-[10px] text-purple-700 font-medium uppercase tracking-wide">{t('stats.earned')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-base font-bold text-[#333333] flex items-center gap-2">
            <span>⚡</span> {t('active')} ({activeJobs.length})
          </h2>
          {activeJobs.map((job: any) => {
            const statusConfig = STATUS_VARIANT[job.status as JobStatus];
            const isReadyToStart = job.status === 'ACCEPTED';

            return (
              <Link key={job.id} href={`/pro/jobs/${job.id}`}>
                <Card interactive level={1} className="group hover:border-primary-600 transition-all duration-200">
                  <CardContent className="p-4">
                    {isReadyToStart && (
                      <div className="absolute -top-1 -right-1 bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-md">
                        ✅ {t('card.ready')}
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-[#333333] group-hover:text-[#2563EB] transition-colors truncate">
                            {job.request.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-xs text-[#7C7373]">
                            <span className="flex items-center gap-1">
                              📂 {job.request.category.nameEn}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              👤 {job.request.client.user.firstName}
                            </span>
                          </div>
                        </div>
                        <Badge variant={statusConfig}>
                          {STATUS_LABEL[job.status as JobStatus]}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
                        <div className="flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1 font-semibold text-green-600">
                            💰 €{job.agreedPrice?.toFixed(2) || '0.00'}
                          </span>
                          <span className="flex items-center gap-1 text-[#7C7373]">
                            📅 {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-[#2563EB] group-hover:translate-x-1 transition-transform">
                          {t('card.viewDetails')} →
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </section>
      )}

      {/* Completed Jobs */}
      {completedJobs.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-base font-bold text-[#333333] flex items-center gap-2">
            <span>🟢</span> {t('stats.completed')} ({completedJobs.length})
          </h2>
          {completedJobs.map((job: any) => (
            <Link key={job.id} href={`/pro/jobs/${job.id}`}>
              <Card interactive level={1} className="group hover:border-green-500 transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-[#333333] group-hover:text-green-600 transition-colors truncate">
                          {job.request.title}
                        </h3>
                        {job.review && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                            ✓ {t('card.reviewed')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#7C7373]">
                        <span className="flex items-center gap-1">
                          ✅ {job.completedAt ? new Date(job.completedAt).toLocaleDateString() : 'N/A'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-semibold text-green-600">
                          💰 €{job.agreedPrice?.toFixed(2) || '0.00'}
                        </span>
                        {job.review && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              ⭐ {job.review.rating}/5
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge variant="success">{t('status.completed')}</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
      )}

      {/* Empty State */}
      {jobs.length === 0 && (
        <Card level={1} padding="lg" className="text-center py-12 border-dashed">
          <div className="text-5xl mb-4">💼</div>
          <h3 className="text-lg font-semibold text-[#333333] mb-2">{t('empty.title')}</h3>
          <p className="text-sm text-[#7C7373] mb-6 max-w-md mx-auto">
            {t('empty.desc')}
          </p>
          <Link href="/pro/requests">
            <Button className="shadow-md hover:shadow-lg">
              {t('empty.button')} →
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
