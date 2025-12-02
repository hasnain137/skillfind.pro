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
    .filter(j => j !== null) || [];

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Jobs"
        title="My Jobs"
        description="Track your active and completed jobs"
      />

      {jobs.length === 0 ? (
        <Card variant="dashed" padding="lg" className="text-center py-8">
          <p className="text-sm text-[#7C7373] mb-4">
            No jobs yet. Accept an offer on a request to create a job.
          </p>
          <Link href="/client/requests">
            <Button>View Requests</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Link key={job.id} href={`/client/jobs/${job.id}`}>
              <Card padding="lg" className="hover:border-[#2563EB] transition-colors cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-[#333333]">
                        {job.request.title}
                      </h3>
                      <Badge variant={STATUS_VARIANT[job.status]}>
                        {job.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-[#7C7373] mb-2">
                      Professional: {job.professional.user.firstName} {job.professional.user.lastName}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[#7C7373]">
                      <span>📂 {job.request.category.nameEn}</span>
                      <span>📅 Started {new Date(job.startedAt || job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button variant="ghost">View Details</Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
