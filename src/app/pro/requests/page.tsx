// src/app/pro/requests/page.tsx
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";

type MatchingRequest = {
  id: string;
  title: string;
  category: string;
  location: string;
  createdAt: string;
  budget: string;
  shortDescription: string;
};

const REQUESTS: MatchingRequest[] = [
  {
    id: "1",
    title: "Algebra tutor for 11th grade",
    category: "Tutoring & Education",
    location: "Vienna · Online",
    createdAt: "Posted 2 hours ago",
    budget: "€30/hour",
    shortDescription:
      "Student needs weekly sessions before exams, prefers evening lessons and structured homework.",
  },
  {
    id: "2",
    title: "Career coaching for job transition",
    category: "Business & Career",
    location: "Munich",
    createdAt: "Posted 6 hours ago",
    budget: "up to €300",
    shortDescription:
      "Client is moving from marketing to tech product roles and needs interview prep plus roadmap planning.",
  },
  {
    id: "3",
    title: "Mindfulness & stress guidance",
    category: "Health & Wellness",
    location: "Remote",
    createdAt: "Posted 1 day ago",
    budget: "€45/session",
    shortDescription:
      "Looking for 4 guided sessions to build a daily routine. Morning availability preferred.",
  },
];

export default function ProRequestsPage() {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Matching requests"
        title="Newest opportunities"
        description="These requests currently match your selected categories and availability."
      />

      <section className="space-y-3">
        {REQUESTS.map((request) => (
          <Card
            key={request.id}
            variant="muted"
            padding="lg"
            className="space-y-3"
          >
            <div>
              <p className="text-sm font-semibold text-[#333333]">
                {request.title}
              </p>
              <p className="text-xs text-[#7C7373]">
                {request.category} · {request.location}
              </p>
            </div>

            <p className="text-sm text-[#333333]">{request.shortDescription}</p>

            <div className="flex flex-wrap gap-3 text-[11px] text-[#7C7373]">
              <span>{request.createdAt}</span>
              <span>{request.budget}</span>
            </div>

            <Link
              href={`/pro/requests/${request.id}/offer`}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1D4FD8] sm:w-auto"
            >
              View & send offer
            </Link>
          </Card>
        ))}
      </section>
    </div>
  );
}

