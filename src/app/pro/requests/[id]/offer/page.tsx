// src/app/pro/requests/[id]/offer/page.tsx
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";

const MOCK_REQUEST = {
  title: "Algebra tutor for 11th grade",
  category: "Tutoring & Education",
  location: "Vienna · Online",
  description:
    "Student needs structured help twice a week before the semester exams. Prefers evening sessions and actionable homework.",
};

export default function ProOfferPage() {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Send offer"
        title="Reply to this client request"
        description="Share your proposed price, timing and a friendly message. Clients see the first 10 qualified offers."
      />

      <Card padding="lg" className="space-y-3" variant="muted">
        <p className="text-sm font-semibold text-[#333333]">
          {MOCK_REQUEST.title}
        </p>
        <p className="text-xs text-[#7C7373]">
          {MOCK_REQUEST.category} · {MOCK_REQUEST.location}
        </p>
        <p className="text-sm text-[#333333]">{MOCK_REQUEST.description}</p>
      </Card>

      <Card padding="lg" className="space-y-4">
        <h2 className="text-sm font-semibold text-[#333333]">Offer details</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
              Proposed price
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
              placeholder="e.g. €35/hour"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
              Pricing type
            </label>
            <select className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#333333] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15">
              <option value="hourly">Hourly</option>
              <option value="fixed">Fixed price</option>
              <option value="discussion">Needs discussion</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
            Message to client
          </label>
          <textarea
            rows={5}
            className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
            placeholder="Introduce yourself, explain how you can help, and mention any relevant experience."
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
              Earliest availability (optional)
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
              placeholder="e.g. Next Monday evening"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
              Estimated duration or sessions (optional)
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
              placeholder="e.g. 6 sessions over 3 weeks"
            />
          </div>
        </div>

        <Button type="button" className="w-full sm:w-auto">
          Send offer
        </Button>
      </Card>
    </div>
  );
}

