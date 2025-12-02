// src/app/pro/jobs/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
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

  const professional = await prisma.professional.findUnique({
    where: { userId },
    include: {
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
    },
  });

  if (!professional) {
    redirect('/complete-profile');
  }

  const jobs = professional.jobs;
  const activeJobs = jobs.filter(j => j.status === 'ACCEPTED' || j.status === 'IN_PROGRESS');
  const completedJobs = jobs.filter(j => j.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Jobs"
        title="My Jobs"
        description="Track your hired jobs, start work, and mark them complete when finished."
      />

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card padding="lg" className="text-center">
          <p className="text-2xl font-bold text-[#333333]">{activeJobs.length}</p>
          <p className="text-xs text-[#7C7373]">Active Jobs</p>
        </Card>
        <Card padding="lg" className="text-center">
          <p className="text-2xl font-bold text-[#333333]">{completedJobs.length}</p>
          <p className="text-xs text-[#7C7373]">Completed</p>
        </Card>
        <Card padding="lg" className="text-center">
          <p className="text-2xl font-bold text-[#333333]">
            €{jobs.reduce((sum, j) => sum + (j.agreedPrice || 0), 0).toFixed(2)}
          </p>
          <p className="text-xs text-[#7C7373]">Total Earnings</p>
        </Card>
      </div>

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[#333333]">Active Jobs</h2>
          {activeJobs.map((job) => (
            <Link key={job.id} href={`/pro/jobs/${job.id}`}>
              <Card padding="lg" className="hover:border-[#2563EB] transition-colors cursor-pointer">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-[#333333] mb-1">
                      {job.request.title}
                    </h3>
                    <p className="text-xs text-[#7C7373]">
                      {job.request.category.nameEn} · Client: {job.request.client.user.firstName}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[job.status]}>
                    {STATUS_LABEL[job.status]}
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
                  <div className="flex items-center gap-4 text-xs text-[#7C7373]">
                    <span>💰 €{job.agreedPrice?.toFixed(2) || '0.00'}</span>
                    <span>📅 {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="text-xs font-semibold text-[#2563EB] hover:underline">
                    View details →
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </section>
      )}

      {/* Completed Jobs */}
      {completedJobs.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[#333333]">Completed Jobs</h2>
          {completedJobs.map((job) => (
            <Link key={job.id} href={`/pro/jobs/${job.id}`}>
              <Card padding="lg" variant="muted" className="hover:border-[#2563EB] transition-colors cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-[#333333]">
                        {job.request.title}
                      </h3>
                      {job.review && (
                        <span className="text-xs text-green-600">✓ Reviewed</span>
                      )}
                    </div>
                    <p className="text-xs text-[#7C7373]">
                      Completed {job.completedAt ? new Date(job.completedAt).toLocaleDateString() : 'N/A'} · €{job.agreedPrice?.toFixed(2) || '0.00'}
                    </p>
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
          <p className="text-sm text-[#7C7373] mb-2">
            No jobs yet. Start sending offers to get hired!
          </p>
          <p className="text-xs text-[#7C7373] mb-4">
            Browse matching requests and send competitive offers to win jobs.
          </p>
          <Link href="/pro/requests">
            <Button>Browse Requests</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
