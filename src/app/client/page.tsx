// src/app/client/page.tsx
import { ActionCard } from "@/components/ui/ActionCard";
import { Card } from "@/components/ui/Card";
import { DashboardHero } from "@/components/ui/DashboardHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatCard } from "@/components/ui/StatCard";

const QUICK_ACTIONS = [
  {
    title: "Create a new request",
    description:
      "Describe what you need so professionals can send tailored offers.",
    href: "/client/requests/new",
    cta: "Start request",
  },
  {
    title: "Review your requests",
    description: "Check statuses, compare offers and keep work organised.",
    href: "/client/requests",
    cta: "View requests",
  },
];

const STATS = [
  { label: "Open requests", value: 2 },
  { label: "Requests with offers", value: 1 },
  { label: "Completed requests", value: 0 },
];

const HERO_HIGHLIGHTS = [
  { label: "Next steps", value: "Review offers", helper: "2 tasks awaiting" },
  { label: "Verification", value: "Phone verified", helper: "Email pending" },
  { label: "Messages", value: "New chat", helper: "1 unread conversation" },
];

export default function ClientDashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardHero
        eyebrow="Client dashboard"
        title="Welcome back, Sofia"
        description="You're in control of every service request, from posting details to choosing the best professional."
        action={{ label: "New request", href: "/client/requests/new" }}
        highlights={HERO_HIGHLIGHTS}
      />

      <section className="grid gap-3 sm:grid-cols-3">
        {STATS.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
          />
        ))}
      </section>

      <Card variant="muted" padding="lg" className="space-y-4">
        <SectionHeading
          variant="section"
          title="Quick actions"
          description="Shortcuts to the most common tasks."
        />
        <div className="grid gap-3 md:grid-cols-2">
          {QUICK_ACTIONS.map((action) => (
            <ActionCard key={action.href} {...action} />
          ))}
        </div>
      </Card>
    </div>
  );
}
