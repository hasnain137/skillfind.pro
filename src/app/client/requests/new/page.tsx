// src/app/client/requests/new/page.tsx
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default function NewClientRequestPage() {
  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow="New request"
        title="Describe what you need"
        description="Share enough detail so professionals can respond with accurate offers. You can edit the request later if anything changes."
      />

      <form className="space-y-4">
        <Card className="space-y-4" padding="lg">
          <SectionHeading
            variant="section"
            title="Task basics"
            description="Pick the best matching category and give your request a clear title."
          />
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
                Category
              </label>
              <select className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#333333] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15">
                <option value="">Select a category</option>
                <option value="tutoring">Tutoring & Education</option>
                <option value="tech">Software & Tech</option>
                <option value="design">Design & Creative</option>
                <option value="wellness">Health & Wellness</option>
                <option value="home">Home & Everyday</option>
                <option value="business">Business & Career</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
                What exactly do you need?
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
                placeholder="e.g. Math tutor for 10th grade algebra"
              />
            </div>
          </div>
        </Card>

        <Card className="space-y-3" padding="lg">
          <SectionHeading
            variant="section"
            title="Details"
            description="Add context, goals, expectations or anything else that helps a pro understand the job."
          />
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
              Describe your task
            </label>
            <textarea
              rows={4}
              className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
              placeholder="Add any details that will help professionals understand what you need, your expectations, and any important context."
            />
            <p className="mt-1 text-[11px] text-[#7C7373]">
              Avoid sharing phone numbers or email here. You can exchange
              contacts once you choose a professional.
            </p>
          </div>
        </Card>

        <Card className="space-y-4" padding="lg">
          <SectionHeading
            variant="section"
            title="Location and format"
            description="Tell us where you are and whether online sessions work."
          />
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
                Location (city)
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
                placeholder="e.g. Berlin, Vienna, online only"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
                Preferred format
              </label>
              <select className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#333333] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15">
                <option value="online_or_offline">
                  Online or in person is fine
                </option>
                <option value="online_only">Online only</option>
                <option value="in_person_only">In person only</option>
              </select>
            </div>
          </div>
        </Card>

        <Card className="space-y-3" padding="lg">
          <SectionHeading
            variant="section"
            title="Timing"
            description="Let professionals know when you'd like to start or any time preferences."
          />
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
              When do you need this?
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
              placeholder="e.g. Evenings, weekends, this week, next month"
            />
          </div>
        </Card>

        <Card className="space-y-3" padding="lg">
          <SectionHeading
            variant="section"
            title="Budget (optional)"
            description="Optional, but helpful for professionals to tailor their offer."
          />
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="text"
              className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
              placeholder="e.g. 30 EUR/hour"
            />
            <input
              type="text"
              className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
              placeholder="or total budget e.g. up to 300 EUR"
            />
          </div>
          <p className="text-[11px] text-[#7C7373]">
            Leave blank if you prefer professionals to suggest a price.
          </p>
        </Card>

        <Card variant="dashed" className="text-center" padding="lg">
          <Button className="w-full sm:w-auto" type="submit">
            Publish request
          </Button>
          <p className="mt-1 text-[11px] text-[#7C7373]">
            Once published, matching professionals will start receiving your
            request.
          </p>
        </Card>
      </form>
    </div>
  );
}

