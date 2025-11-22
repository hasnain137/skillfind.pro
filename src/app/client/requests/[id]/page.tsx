// src/app/client/requests/[id]/page.tsx
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";

type RequestDetailPageProps = {
  params: { id: string };
};

const REQUEST_SUMMARY = {
  title: "Math tutor for high school exams",
  category: "Tutoring & Education",
  createdAt: "Nov 18, 2025",
  location: "Berlin · Online",
  budget: "€30-40/hour",
  status: "with_offers",
  description:
    "Looking for a supportive tutor to help my daughter prepare for 11th grade math exams. Two sessions per week, preferably evenings. Needs someone patient who can explain algebra and geometry concepts clearly.",
};

type Offer = {
  id: string;
  professional: string;
  headline: string;
  rating: number;
  reviews: number;
  price: string;
  message: string;
};

const OFFERS: Offer[] = [
  {
    id: "offer-1",
    professional: "Anna Keller",
    headline: "Math & exam prep tutor",
    rating: 4.9,
    reviews: 38,
    price: "€35/hour",
    message:
      "Happy to help! I specialise in preparing students for state exams and can send weekly progress summaries.",
  },
  {
    id: "offer-2",
    professional: "Jonas Weber",
    headline: "STEM coach & university mentor",
    rating: 4.8,
    reviews: 24,
    price: "€32/hour",
    message:
      "We can focus on algebra and geometry with interactive tools. I’m available Tue & Thu evenings.",
  },
];

const STATUS_LABEL: Record<typeof REQUEST_SUMMARY.status, string> = {
  with_offers: "With offers",
};

const STATUS_VARIANT: Record<typeof REQUEST_SUMMARY.status, "success"> = {
  with_offers: "success",
};

export default function ClientRequestDetailPage({
  params,
}: RequestDetailPageProps) {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Request detail"
        title={REQUEST_SUMMARY.title}
        description={`Request ID #${params.id}`}
        actions={
          <Button className="text-xs">Create similar request</Button>
        }
      />

      <Card padding="lg" className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={STATUS_VARIANT[REQUEST_SUMMARY.status]}>
            {STATUS_LABEL[REQUEST_SUMMARY.status]}
          </Badge>
          <p className="text-xs text-[#7C7373]">
            Created on {REQUEST_SUMMARY.createdAt}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoRow label="Category" value={REQUEST_SUMMARY.category} />
          <InfoRow label="Location" value={REQUEST_SUMMARY.location} />
          <InfoRow label="Budget" value={REQUEST_SUMMARY.budget} />
          <InfoRow label="Status" value="Offers received" />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7C7373]">
            Description
          </p>
          <p className="mt-2 text-sm text-[#4B5563]">
            {REQUEST_SUMMARY.description}
          </p>
        </div>
      </Card>

      <section className="space-y-3">
        <SectionHeading
          variant="section"
          title="Offers from professionals"
          description={
            OFFERS.length
              ? "Review each offer carefully and open the professional profile to learn more."
              : "Professionals can submit offers within the first 10 slots."
          }
        />

        {OFFERS.length === 0 ? (
          <Card variant="muted" padding="lg" className="text-sm text-[#7C7373]">
            No offers yet. You can update your request details or share more
            context to attract the right professionals.
          </Card>
        ) : (
          <div className="space-y-3">
            {OFFERS.map((offer) => (
              <Card key={offer.id} padding="lg" className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[#333333]">
                      {offer.professional}
                    </p>
                    <p className="text-xs text-[#7C7373]">{offer.headline}</p>
                  </div>
                  <p className="text-xs font-semibold text-[#2563EB]">
                    {offer.price}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#7C7373]">
                  <span className="font-semibold text-[#333333]">
                    {offer.rating.toFixed(1)} ★
                  </span>
                  <span>({offer.reviews} reviews)</span>
                </div>

                <p className="text-sm text-[#4B5563]">{offer.message}</p>

                <div className="flex flex-wrap gap-2">
                  <Link href="/professionals/1">
                    <Button
                      variant="ghost"
                      className="border border-[#E5E7EB] px-4 py-2 text-xs"
                    >
                      View profile
                    </Button>
                  </Link>
                  <Button className="px-4 py-2 text-xs">Contact</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
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

