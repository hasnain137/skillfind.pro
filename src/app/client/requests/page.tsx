// src/app/client/requests/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from "next/link";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";

type RequestStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

const STATUS_VARIANT: Record<RequestStatus, BadgeVariant> = {
  OPEN: "primary",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  CANCELLED: "gray",
};

const STATUS_LABEL: Record<RequestStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export default async function ClientRequestsPage() {
  // Get authenticated user
  const { userId } = await auth();
  if (!userId) {
    redirect('/login');
  }

  // Fetch user and their requests
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      clientProfile: {
        include: {
          requests: {
            include: {
              category: true,
              offers: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      },
    },
  });

  const requests = dbUser?.clientProfile?.requests || [];
  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow="Requests"
        title="My requests"
        description="Track everything you've posted, check offer counts, and keep conversations organised."
        actions={
          <Link
            href="/client/requests/new"
            className="inline-flex items-center justify-center rounded-full border border-[#2563EB] px-4 py-2 text-xs font-semibold text-[#2563EB] transition hover:bg-[#EFF6FF]"
          >
            + Create new request
          </Link>
        }
      />

      <section className="space-y-3">
        {requests.length === 0 ? (
          <Card variant="dashed" padding="lg" className="text-center py-8">
            <p className="text-sm text-[#7C7373] mb-4">
              You haven&apos;t created any requests yet. Start by describing what
              you need.
            </p>
            <Link
              href="/client/requests/new"
              className="inline-flex items-center justify-center rounded-full bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
            >
              Create Your First Request
            </Link>
          </Card>
        ) : (
          requests.map((req) => (
            <Link key={req.id} href={`/client/requests/${req.id}`}>
              <Card className="flex flex-col gap-3 hover:border-[#2563EB] transition-colors cursor-pointer" padding="lg">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[#333333]">
                      {req.title}
                    </p>
                    <p className="text-[11px] text-[#7C7373]">
                      {req.category.nameEn} · Created on {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[req.status]}>
                    {STATUS_LABEL[req.status]}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#7C7373]">
                  <p>
                    Offers received:{" "}
                    <span className="font-semibold text-[#333333]">
                      {req.offers.length}
                    </span>
                  </p>
                  <span className="text-[#2563EB] font-semibold hover:underline">
                    View details →
                  </span>
                </div>
              </Card>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}
