// src/app/pro/page.tsx
import { Card } from "@/components/ui/Card";
import { DashboardHero } from "@/components/ui/DashboardHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatCard } from "@/components/ui/StatCard";

const STATS = [
  { label: "New matching requests", value: 5 },
  { label: "Active jobs", value: 2 },
  { label: "Reviews rating", value: "4.8" },
];

const NEXT_STEPS = [
  "Complete your profile so clients can trust your experience.",
  "Check matching requests and prioritise the freshest ones.",
  "Respond quickly to increase your chances of being selected.",
];

const HERO_HIGHLIGHTS = [
  { label: "Profile completion", value: "78%", helper: "Finish verification" },
  { label: "Wallet balance", value: "€24.40", helper: "Top up for clicks" },
  { label: "New matches today", value: "4", helper: "Respond within 12h" },
];

export default function ProDashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardHero
        eyebrow="Professional dashboard"
        title="Good afternoon, Alex"
        description="See matching requests, send tailored offers, and keep your profile ready for new opportunities."
        action={{ label: "View requests", href: "/pro/requests" }}
        highlights={HERO_HIGHLIGHTS}
      />

      <section className="grid gap-3 sm:grid-cols-3">
        {STATS.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </section>

      <Card variant="muted" padding="lg" className="space-y-3">
        <h2 className="text-sm font-semibold text-[#333333]">Next steps</h2>
        <ul className="space-y-2 text-xs text-[#4B5563]">
          {NEXT_STEPS.map((step) => (
            <li key={step} className="flex items-start gap-2">
              <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-[#2563EB]" />
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
