// src/app/client/requests/page.tsx
import Link from "next/link";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { SectionHeading } from "@/components/ui/SectionHeading";

type RequestStatus = "open" | "with_offers" | "in_progress" | "completed";

type ClientRequest = {
  id: string;
  title: string;
  category: string;
  createdAt: string;
  status: RequestStatus;
  offersCount: number;
};

const MOCK_REQUESTS: ClientRequest[] = [
  {
    id: "1",
    title: "Math tutor for high school exam",
    category: "Tutoring & Education",
    createdAt: "2025-11-10",
    status: "with_offers",
    offersCount: 3,
  },
  {
    id: "2",
    title: "Fix small bugs on my Next.js website",
    category: "Software & Tech",
    createdAt: "2025-11-15",
    status: "open",
    offersCount: 0,
  },
];

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "With offers", value: "with_offers" },
  { label: "In progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
];

const STATUS_VARIANT: Record<RequestStatus, BadgeVariant> = {
  open: "primary",
  with_offers: "success",
  in_progress: "warning",
  completed: "gray",
};

const STATUS_LABEL: Record<RequestStatus, string> = {
  open: "Open",
  with_offers: "With offers",
  in_progress: "In progress",
  completed: "Completed",
};

export default function ClientRequestsPage() {
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

      <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#7C7373]">
        {FILTERS.map((filter, index) => (
          <Pill key={filter.value} active={index === 0}>
            {filter.label}
          </Pill>
        ))}
      </div>

      <section className="space-y-3">
        {MOCK_REQUESTS.length === 0 ? (
          <p className="text-xs text-[#7C7373]">
            You haven&apos;t created any requests yet. Start by describing what
            you need.
          </p>
        ) : (
          MOCK_REQUESTS.map((req) => (
            <Card key={req.id} className="flex flex-col gap-3" padding="lg">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[#333333]">
                    {req.title}
                  </p>
                  <p className="text-[11px] text-[#7C7373]">
                    {req.category} · Created on {req.createdAt}
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
                    {req.offersCount}
                  </span>
                </p>
                <button
                  type="button"
                  className="text-[#2563EB] font-semibold hover:underline"
                >
                  View details
                </button>
              </div>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
