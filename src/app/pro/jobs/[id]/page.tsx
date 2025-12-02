// src/app/pro/jobs/[id]/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import StartJobButton from "./StartJobButton";
import CompleteJobButton from "./CompleteJobButton";

type ProJobDetailPageProps = {
  params: Promise<{ id: string }>;
};

const STATUS_VARIANT: Record<string, "primary" | "warning" | "success" | "gray"> = {
  ACCEPTED: "primary",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  CANCELLED: "gray",
  DISPUTED: "gray",
};

export default async function ProJobDetailPage({ params }: ProJobDetailPageProps) {
  const resolvedParams = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  const professional = await prisma.professional.findUnique({
    where: { userId },
  });

  if (!professional) {
    redirect('/complete-profile');
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

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Job details"
        title={job.request.title}
        description={`Job ID #${job.id.substring(0, 8)}`}
      />

      {/* Status Card */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge variant={STATUS_VARIANT[job.status]}>
            {job.status === 'ACCEPTED' && 'Ready to Start'}
            {job.status === 'IN_PROGRESS' && 'In Progress'}
            {job.status === 'COMPLETED' && 'Completed'}
            {job.status === 'CANCELLED' && 'Cancelled'}
            {job.status === 'DISPUTED' && 'Disputed'}
          </Badge>
          <p className="text-xs text-[#7C7373]">
            Created {new Date(job.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoRow label="Category" value={job.request.category.nameEn} />
          <InfoRow label="Agreed Price" value={`€${job.agreedPrice?.toFixed(2) || '0.00'}`} />
          <InfoRow label="Client" value={`${job.request.client.user.firstName} ${job.request.client.user.lastName}`} />
          <InfoRow label="Status" value={job.status} />
          {job.startedAt && (
            <InfoRow label="Started" value={new Date(job.startedAt).toLocaleDateString()} />
          )}
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

        {job.status === 'ACCEPTED' && (
          <div className="space-y-2">
            <p className="text-sm text-[#7C7373]">
              This job has been accepted by the client. Start working when you're ready!
            </p>
            <StartJobButton jobId={job.id} />
          </div>
        )}

        {job.status === 'IN_PROGRESS' && (
          <div className="space-y-2">
            <p className="text-sm text-[#7C7373]">
              You're currently working on this job. Mark it as complete when finished.
            </p>
            <CompleteJobButton jobId={job.id} />
          </div>
        )}

        {job.status === 'COMPLETED' && !job.review && (
          <div className="text-sm text-[#7C7373]">
            ✅ Job completed! Waiting for client to leave a review.
          </div>
        )}

        {job.review && (
          <div className="space-y-2">
            <p className="text-sm text-[#7C7373]">
              ⭐ Client left a review: {job.review.rating}/5
            </p>
            <p className="text-sm text-[#4B5563] italic">
              "{job.review.content}"
            </p>
            {!job.review.professionalResponse && (
              <Link href={`/api/reviews/${job.review.id}/respond`}>
                <Button variant="ghost">Respond to Review</Button>
              </Link>
            )}
          </div>
        )}
      </Card>

      {/* Client Contact Info (revealed after job accepted) */}
      <Card padding="lg" className="space-y-3">
        <h3 className="font-semibold text-[#333333]">Client Contact Information</h3>
        <p className="text-xs text-[#7C7373] mb-3">
          Contact details are shared once the offer is accepted.
        </p>
        <div className="text-sm text-[#4B5563] space-y-1">
          <p><strong>Name:</strong> {job.request.client.user.firstName} {job.request.client.user.lastName}</p>
          <p><strong>Email:</strong> {job.request.client.user.email}</p>
          {job.request.client.user.phoneNumber && (
            <p><strong>Phone:</strong> {job.request.client.user.phoneNumber}</p>
          )}
          {job.request.city && (
            <p><strong>Location:</strong> {job.request.city}, {job.request.country}</p>
          )}
        </div>
      </Card>

      {/* Request Details */}
      <Card padding="lg" className="space-y-3">
        <h3 className="font-semibold text-[#333333]">Original Request Details</h3>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between py-2 border-b border-[#E5E7EB]">
            <span className="text-[#7C7373]">Budget Range:</span>
            <span className="font-medium text-[#333333]">
              {job.request.budgetMin && job.request.budgetMax 
                ? `€${job.request.budgetMin} - €${job.request.budgetMax}`
                : 'Not specified'}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#E5E7EB]">
            <span className="text-[#7C7373]">Location Type:</span>
            <span className="font-medium text-[#333333]">{job.request.locationType || 'Not specified'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#E5E7EB]">
            <span className="text-[#7C7373]">Urgency:</span>
            <span className="font-medium text-[#333333]">{job.request.urgency || 'Not specified'}</span>
          </div>
          {job.request.preferredStartDate && (
            <div className="flex justify-between py-2 border-b border-[#E5E7EB]">
              <span className="text-[#7C7373]">Preferred Start:</span>
              <span className="font-medium text-[#333333]">
                {new Date(job.request.preferredStartDate).toLocaleDateString()}
              </span>
            </div>
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
