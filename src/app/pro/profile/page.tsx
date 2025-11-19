// src/app/pro/profile/page.tsx
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default function ProProfilePage() {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Profile"
        title="Keep your professional profile updated"
        description="Clients want to understand your expertise, services, and availability before sending work."
      />

      <form className="space-y-4">
        <Card className="space-y-3" padding="lg">
          <h2 className="text-sm font-semibold text-[#333333]">Basic info</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
                Full name
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
                placeholder="Alex Mayer"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
                Headline
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
                placeholder="Math & exam prep tutor"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
              Location (city, country)
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
              placeholder="Vienna, Austria"
            />
          </div>
        </Card>

        <Card className="space-y-3" padding="lg">
          <h2 className="text-sm font-semibold text-[#333333]">About</h2>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
              Short bio
            </label>
            <textarea
              rows={4}
              className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
              placeholder="Describe your experience, certifications, and what clients can expect when working with you."
            />
          </div>
        </Card>

        <Card className="space-y-3" padding="lg">
          <h2 className="text-sm font-semibold text-[#333333]">Services</h2>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
              Services offered
            </label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
              placeholder="List your core services, packages, or coaching focuses."
            />
          </div>
        </Card>

        <Card className="space-y-3" padding="lg">
          <h2 className="text-sm font-semibold text-[#333333]">
            Pricing overview
          </h2>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
              Typical hourly rate
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
              placeholder="e.g. €45/hour"
            />
          </div>
        </Card>

        <Card className="space-y-3" padding="lg">
          <h2 className="text-sm font-semibold text-[#333333]">
            Online / In-person preference
          </h2>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
              Availability
            </label>
            <select className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#333333] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15">
              <option value="both">Online or in person</option>
              <option value="online">Online only</option>
              <option value="in_person">In-person only</option>
            </select>
          </div>
        </Card>

        <div className="pt-2">
          <Button type="button" className="w-full sm:w-auto">
            Save profile
          </Button>
        </div>
      </form>
    </div>
  );
}

