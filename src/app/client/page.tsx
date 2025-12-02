// src/app/client/page.tsx
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
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


const HERO_HIGHLIGHTS = [
  { label: "Next steps", value: "Review offers", helper: "2 tasks awaiting" },
  { label: "Verification", value: "Phone verified", helper: "Email pending" },
  { label: "Messages", value: "New chat", helper: "1 unread conversation" },
];

export default async function ClientDashboardPage() {
  // Get authenticated user
  const { userId } = await auth();
  if (!userId) {
    redirect('/login');
  }

  // Get user details from Clerk
  const user = await currentUser();
  const firstName = user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'there';

  // Fetch user from database
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      clientProfile: {
        include: {
          requests: {
            include: {
              offers: true,
            },
          },
        },
      },
    },
  });

  // Calculate stats
  const requests = dbUser?.clientProfile?.requests || [];
  const openRequests = requests.filter(r => r.status === 'OPEN').length;
  const requestsWithOffers = requests.filter(r => r.offers.length > 0).length;
  const completedRequests = requests.filter(r => r.status === 'COMPLETED').length;

  const stats = [
    { label: "Open requests", value: openRequests },
    { label: "Requests with offers", value: requestsWithOffers },
    { label: "Completed requests", value: completedRequests },
  ];

  return (
    <div className="space-y-6">
      <DashboardHero
        eyebrow="Client dashboard"
        title={`Welcome back, ${firstName}`}
        description="You're in control of every service request, from posting details to choosing the best professional."
        action={{ label: "New request", href: "/client/requests/new" }}
        highlights={HERO_HIGHLIGHTS}
      />

      <section className="grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
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
