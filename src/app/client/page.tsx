// src/app/client/page.tsx
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ActionCard } from "@/components/ui/ActionCard";
import { Card } from "@/components/ui/Card";
import { DashboardHero } from "@/components/ui/DashboardHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatCard } from "@/components/ui/StatCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { RequestTimeline } from "@/components/dashboard/RequestTimeline";
import { ProfileCompletionBanner } from "@/components/dashboard/ProfileCompletionBanner";
import { calculateClientCompletion } from "@/lib/profile-completion";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";

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
  const requestsWithOffers = requests.filter(r => r.offers.length > 0);
  const pendingOffers = requestsWithOffers.reduce((sum, r) =>
    sum + r.offers.filter(o => o.status === 'PENDING').length, 0
  );
  const completedRequests = requests.filter(r => r.status === 'COMPLETED').length;
  const totalOffers = requests.reduce((sum, r) => sum + r.offers.length, 0);

  // Build dynamic highlights based on actual user state
  const heroHighlights = [
    {
      label: "Next steps",
      value: pendingOffers > 0 ? "Review offers" : openRequests > 0 ? "Waiting for offers" : "Create a request",
      helper: pendingOffers > 0
        ? `${pendingOffers} offer${pendingOffers > 1 ? 's' : ''} to review`
        : openRequests > 0
          ? `${openRequests} open request${openRequests > 1 ? 's' : ''}`
          : "Get started now"
    },
    {
      label: "Verification",
      value: user?.emailAddresses[0]?.verification?.status === 'verified' ? "Email verified" : "Email pending",
      helper: user?.phoneNumbers?.[0]?.verification?.status === 'verified' ? "Phone verified ✓" : "Add phone for trust"
    },
    {
      label: "Activity",
      value: `${totalOffers} offer${totalOffers !== 1 ? 's' : ''}`,
      helper: completedRequests > 0 ? `${completedRequests} completed` : "No jobs yet"
    },
  ];

  const stats = [
    { label: "Open requests", value: openRequests },
    { label: "Total offers received", value: totalOffers },
    { label: "Completed requests", value: completedRequests },
  ];

  // Calculate profile completion
  // Calculate profile completion
  const { percentage: completion, missingSteps } = calculateClientCompletion(
    dbUser!,
    dbUser?.clientProfile || null
  );

  // Generate activity feed
  const activities = requests.flatMap(request => {
    const items: any[] = [];

    // Request created
    items.push({
      id: `request-${request.id}`,
      type: 'request_created' as const,
      title: 'Request created',
      description: request.title,
      timestamp: request.createdAt,
      href: `/client/requests/${request.id}`,
    });

    // Offers received
    if (request.offers.length > 0) {
      items.push({
        id: `offers-${request.id}`,
        type: 'offer_received' as const,
        title: `${request.offers.length} offer${request.offers.length > 1 ? 's' : ''} received`,
        description: `Professionals are interested in: ${request.title}`,
        timestamp: request.offers[0].createdAt,
        href: `/client/requests/${request.id}`,
      });
    }

    return items;
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5);

  // Format requests for timeline
  const timelineRequests = requests
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map(r => ({
      id: r.id,
      title: r.title,
      status: r.status as any,
      offerCount: r.offers.length,
      createdAt: r.createdAt,
      budget: r.budgetMax || undefined,
    }));

  return (
    <div className="space-y-6">
      <DashboardHero
        eyebrow="Client dashboard"
        title={`Welcome back, ${firstName}`}
        description="You're in control of every service request, from posting details to choosing the best professional."
        action={{ label: "New request", href: "/client/requests/new" }}
        highlights={heroHighlights}
      />

      {/* Profile Completion Banner */}
      <ProfileCompletionBanner
        profileCompletion={completion}
        userRole="CLIENT"
        missingSteps={missingSteps}
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card variant="muted" padding="lg" className="space-y-4">
          <SectionHeading
            variant="section"
            title="Quick actions"
            description="Shortcuts to the most common tasks."
          />
          <div className="space-y-3">
            {QUICK_ACTIONS.map((action) => (
              <ActionCard key={action.href} {...action} />
            ))}
          </div>
        </Card>

        {/* Activity Feed */}
        <Card variant="default" padding="lg" className="space-y-4">
          <SectionHeading
            variant="section"
            title="Recent activity"
            description="Your latest updates and notifications."
          />
          <ActivityFeed activities={activities} />
        </Card>
      </div>

      {/* Request Timeline */}
      <Card variant="default" padding="lg" className="space-y-4">
        <SectionHeading
          variant="section"
          title="Your requests"
          description="Track the progress of all your service requests."
        />
        <RequestTimeline requests={timelineRequests} />
      </Card>

      <WelcomeModal userRole="CLIENT" firstName={firstName} />
    </div>
  );
}
