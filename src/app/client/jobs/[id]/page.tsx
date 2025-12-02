// src/app/client/jobs/[id]/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import CompleteJobButton from './CompleteJobButton';

type JobDetailPageProps = {
  params: Promise<{ id: string }>;
};

const STATUS_VARIANT: Record<string, "primary" | "warning" | "success" | "gray"> = {
  PENDING: "primary",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  CANCELLED: "gray",
  DISPUTED: "gray",
};

export default async function ClientJobDetailPage({ params }: JobDetailPageProps) {
  const resolvedParams = await params;
  const { userId } = await auth();
  
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

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Job details"
        title={job.request.title}
        description={`Job ID #${job.id.substring(0, 8)}`}
      />

      <Card padding="lg" className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge variant={STATUS_VARIANT[job.status]}>
            {job.status}
          </Badge>
          <p className="text-xs text-[#7C7373]">
            Started {new Date(job.startedAt || job.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoRow label="Category" value={job.request.category.nameEn} />
          <InfoRow label="Professional" value={`${job.professional.user.firstName} ${job.professional.user.lastName}`} />
          <InfoRow label="Status" value={job.status} />
          {job.completedAt && (
            <InfoRow label="Completed" value={new Date(job.completedAt).toLocaleDateString()} />
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7C7373]">
            Request Description
          </p>
          <p className="mt-2 text-sm text-[#4B5563]">
            {job.request.description}
          </p>
        </div>
      </Card>

      {/* Actions */}
      <Card padding="lg" className="space-y-3">
        <h3 className="font-semibold text-[#333333]">Actions</h3>
        
        {job.status === 'IN_PROGRESS' && (
          <CompleteJobButton jobId={job.id} />
        )}

        {job.status === 'COMPLETED' && !job.review && (
          <Link href={`/client/jobs/${job.id}/review`}>
            <Button>Leave a Review</Button>
          </Link>
        )}

        {job.review && (
          <div className="text-sm text-[#7C7373]">
            ✅ You've already left a review for this job
          </div>
        )}

        <Link href={`/pro/${job.professionalId}`}>
          <Button variant="ghost">View Professional Profile</Button>
        </Link>
      </Card>

      {/* Contact Info */}
      <Card padding="lg" className="space-y-3">
        <h3 className="font-semibold text-[#333333]">Professional Contact</h3>
        <div className="text-sm text-[#4B5563]">
          <p><strong>Name:</strong> {job.professional.user.firstName} {job.professional.user.lastName}</p>
          <p><strong>Email:</strong> {job.professional.user.email}</p>
          {job.professional.user.phoneNumber && (
            <p><strong>Phone:</strong> {job.professional.user.phoneNumber}</p>
          )}
          {job.professional.city && (
            <p><strong>Location:</strong> {job.professional.city}</p>
          )}
        </div>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3">
      <p className="text-[11px] text-[#7C7373]">{label}</p>
      <p className="text-sm font-semibold text-[#333333]">{value}</p>
    </div>
  );
}
