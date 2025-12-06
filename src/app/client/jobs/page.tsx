// src/app/client/jobs/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';

const STATUS_VARIANT: Record<string, "primary" | "warning" | "success" | "gray"> = {
  PENDING: "primary",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  CANCELLED: "gray",
  DISPUTED: "gray",
};

export default async function ClientJobsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/login');
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      clientProfile: {
        include: {
          requests: {
            include: {
              job: {
                include: {
                  professional: {
                    include: {
                      user: true,
                    },
                  },
                  request: {
                    include: {
                      category: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const jobs = dbUser?.clientProfile?.requests
    .map(r => r.job)
    .filter((j): j is NonNullable<typeof j> => j !== null) || [];

  const activeJobs = jobs.filter(j => (j.status as string) === 'PENDING' || (j.status as string) === 'IN_PROGRESS');
  const completedJobs = jobs.filter(j => (j.status as string) === 'COMPLETED');
  const totalSpent = jobs.reduce((sum, j) => sum + (j.agreedPrice || 0), 0);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Jobs"
        title="My Jobs"
        description="Track your active and completed jobs"
      />

      {/* Stats Overview */}
      {jobs.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-4">
          <Card padding="lg" className="text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <p className="text-2xl font-bold text-blue-600">{activeJobs.length}</p>
            <p className="text-xs text-blue-700 font-medium">Active Jobs</p>
          </Card>
          <Card padding="lg" className="text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <p className="text-2xl font-bold text-green-600">{completedJobs.length}</p>
            <p className="text-xs text-green-700 font-medium">Completed</p>
          </Card>
          <Card padding="lg" className="text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <p className="text-2xl font-bold text-purple-600">{jobs.length}</p>
            <p className="text-xs text-purple-700 font-medium">Total Jobs</p>
          </Card>
          <Card padding="lg" className="text-center bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <p className="text-2xl font-bold text-orange-600">€{totalSpent.toFixed(0)}</p>
            <p className="text-xs text-orange-700 font-medium">Total Spent</p>
          </Card>
        </div>
      )}

      {jobs.length === 0 ? (
        <Card level={1} padding="lg" className="text-center py-12 border-dashed">
          <div className="text-5xl mb-4">💼</div>
          <h3 className="text-lg font-semibold text-[#333333] mb-2">No jobs yet</h3>
          <p className="text-sm text-[#7C7373] mb-6 max-w-md mx-auto">
            Accept an offer on your requests to create a job and start working with a professional.
          </p>
          <Link href="/client/requests">
            <Button className="shadow-md hover:shadow-lg">
              View Requests →
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Active Jobs */}
          {activeJobs.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-base font-bold text-[#333333] flex items-center gap-2">
                <span>⚡</span> Active Jobs ({activeJobs.length})
              </h2>
              {activeJobs.map((job) => {
                const statusConfig = STATUS_VARIANT[job.status as string] || "gray";
                const canComplete = (job.status as string) === 'IN_PROGRESS';

                return (
                  <Link key={job.id} href={`/client/jobs/${job.id}`}>
                    <Card className="group hover:border-[#2563EB] hover:shadow-md transition-all duration-200 cursor-pointer" padding="lg">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-bold text-[#333333] group-hover:text-[#2563EB] transition-colors truncate">
                              {job.request.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 text-xs text-[#7C7373]">
                              <span className="flex items-center gap-1">
                                👤 {job.professional.user.firstName || 'Professional'} {job.professional.user.lastName || ''}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                📂 {job.request.category.nameEn}
                              </span>
                            </div>
                          </div>
                          <Badge variant={statusConfig}>{job.status}</Badge>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
                          <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1 font-semibold text-green-600">
                              💰 €{job.agreedPrice?.toFixed(2) || '0.00'}
                            </span>
                            <span className="flex items-center gap-1 text-[#7C7373]">
                              📅 Started {new Date(job.startedAt || job.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {canComplete && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                              Can Complete
                            </span>
                          )}
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
                <Link key={job.id} href={`/client/jobs/${job.id}`}>
                  <Card className="group hover:border-green-500 hover:shadow-md transition-all duration-200 cursor-pointer bg-gradient-to-br from-green-50 to-white border-green-200" padding="lg">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-[#333333] group-hover:text-green-600 transition-colors truncate">
                          {job.request.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-[#7C7373] mt-1">
                          <span className="flex items-center gap-1">
                            ✅ Completed {job.completedAt ? new Date(job.completedAt).toLocaleDateString() : 'N/A'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-semibold text-green-600">
                            💰 €{job.agreedPrice?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                      </div>
                      <Badge variant="success">Completed</Badge>
                    </div>
                  </Card>
                </Link>
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
