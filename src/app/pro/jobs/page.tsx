// src/app/pro/jobs/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getProfessionalWithRelations } from "@/lib/get-professional";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";

const STATUS_VARIANT: Record<string, "primary" | "warning" | "success" | "gray"> = {
  ACCEPTED: "primary",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  CANCELLED: "gray",
  DISPUTED: "gray",
};

const STATUS_LABEL: Record<string, string> = {
  ACCEPTED: "Accepted - Ready to start",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  DISPUTED: "Disputed",
};

export default async function ProJobsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  const professional = await getProfessionalWithRelations(userId, {
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

  const jobs = professional.jobs as any[];
  const activeJobs = jobs.filter(j => j.status === 'ACCEPTED' || j.status === 'IN_PROGRESS');
  const completedJobs = jobs.filter(j => j.status === 'COMPLETED');

  const totalEarnings = jobs.reduce((sum, j) => sum + (j.agreedPrice || 0), 0);
  const pendingJobs = jobs.filter(j => j.status === 'ACCEPTED');
  const inProgressJobs = jobs.filter(j => j.status === 'IN_PROGRESS');

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Jobs"
        title="My Jobs"
        description="Track your hired jobs, start work, and mark them complete when finished."
      />

      {/* Enhanced Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card padding="lg" className="text-center bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <p className="text-2xl font-bold text-yellow-600">{pendingJobs.length}</p>
          <p className="text-xs text-yellow-700 font-medium">Ready to Start</p>
        </Card>
        <Card padding="lg" className="text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <p className="text-2xl font-bold text-blue-600">{inProgressJobs.length}</p>
          <p className="text-xs text-blue-700 font-medium">In Progress</p>
        </Card>
        <Card padding="lg" className="text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <p className="text-2xl font-bold text-green-600">{completedJobs.length}</p>
          <p className="text-xs text-green-700 font-medium">Completed</p>
        </Card>
        <Card padding="lg" className="text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <p className="text-2xl font-bold text-purple-600">€{totalEarnings.toFixed(0)}</p>
          <p className="text-xs text-purple-700 font-medium">Total Earned</p>
        </Card>
      </div>

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-base font-bold text-[#333333] flex items-center gap-2">
            <span>⚡</span> Active Jobs ({activeJobs.length})
          </h2>
          {activeJobs.map((job) => {
            const statusConfig = STATUS_VARIANT[job.status];
            const isReadyToStart = job.status === 'ACCEPTED';

            return (
              <Link key={job.id} href={`/pro/jobs/${job.id}`}>
                <Card className="group relative hover:border-[#2563EB] hover:shadow-md transition-all duration-200 cursor-pointer" padding="lg">
                  {isReadyToStart && (
                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-md">
                      ✅ Ready
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
                        {STATUS_LABEL[job.status]}
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
                        View details →
                      </span>
                    </div>
                  </div>
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
            <span>🟢</span> Completed Jobs ({completedJobs.length})
          </h2>
          {completedJobs.map((job) => (
            <Link key={job.id} href={`/pro/jobs/${job.id}`}>
              <Card className="group hover:border-green-500 hover:shadow-md transition-all duration-200 cursor-pointer bg-gradient-to-br from-green-50 to-white border-green-200" padding="lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-[#333333] group-hover:text-green-600 transition-colors truncate">
                        {job.request.title}
                      </h3>
                      {job.review && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                          ✓ Reviewed
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
                  <Badge variant="success">Completed</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </section>
      )}

      {/* Empty State */}
      {jobs.length === 0 && (
        <Card variant="dashed" padding="lg" className="text-center py-12">
          <div className="text-5xl mb-4">💼</div>
          <h3 className="text-lg font-semibold text-[#333333] mb-2">No jobs yet</h3>
          <p className="text-sm text-[#7C7373] mb-6 max-w-md mx-auto">
            Browse matching requests and send competitive offers to win your first job!
          </p>
          <Link href="/pro/requests">
            <Button className="shadow-md hover:shadow-lg">
              Browse Requests →
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
