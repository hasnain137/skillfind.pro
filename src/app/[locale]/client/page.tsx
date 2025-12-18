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
import { ClientDashboardTour } from "@/components/onboarding/ClientDashboardTour";
import { getTranslations } from 'next-intl/server';

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

  const t = await getTranslations('ClientDashboard');

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
      label: t('highlights.nextSteps'),
      value: pendingOffers > 0 ? t('highlights.reviewOffers') : openRequests > 0 ? t('highlights.waitingForOffers') : t('highlights.createRequest'),
      helper: pendingOffers > 0
        ? t('highlights.offersToReview', { count: pendingOffers, s: pendingOffers > 1 ? 's' : '' })
        : openRequests > 0
          ? t('highlights.openRequests', { count: openRequests, s: openRequests > 1 ? 's' : '' })
          : t('highlights.getStarted')
    },
    {
      label: t('highlights.verification'),
      value: user?.emailAddresses[0]?.verification?.status === 'verified' ? t('highlights.emailVerified') : t('highlights.emailPending'),
      helper: user?.phoneNumbers?.[0]?.verification?.status === 'verified' ? t('highlights.phoneVerified') : t('highlights.addPhone')
    },
    {
      label: t('highlights.activity'),
      value: t('highlights.offersCount', { count: totalOffers, s: totalOffers !== 1 ? 's' : '' }),
      helper: completedRequests > 0 ? t('highlights.completedRequests', { count: completedRequests }) : t('highlights.noJobs')
    },
  ];

  const stats = [
    { label: t('stats.openRequests'), value: openRequests, icon: "📝" },
    { label: t('stats.totalOffers'), value: totalOffers, icon: "📬" },
    { label: t('stats.completedRequests'), value: completedRequests, icon: "✅" },
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
      title: t('activity.requestCreated'),
      description: request.title,
      timestamp: request.createdAt,
      href: `/client/requests/${request.id}`,
    });

    // Offers received
    if (request.offers.length > 0) {
      items.push({
        id: `offers-${request.id}`,
        type: 'offer_received' as const,
        title: t('activity.offerReceivedTitle', { count: request.offers.length }),
        description: t('activity.offerInterest', { title: request.title }),
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

  const QUICK_ACTIONS = [
    {
      title: t('actions.createTitle'),
      description: t('actions.createDesc'),
      href: "/client/requests/new",
      cta: t('actions.createCta'),
    },
    {
      title: t('actions.reviewTitle'),
      description: t('actions.reviewDesc'),
      href: "/client/requests",
      cta: t('actions.reviewCta'),
    },
  ];

  return (
    <div className="space-y-6">
      <DashboardHero
        eyebrow={t('eyebrow')}
        title={t('welcome', { name: firstName })}
        description={t('description')}
        action={{ label: t('actions.createCta'), href: "/client/requests/new" }}
        highlights={heroHighlights}
      />

      {/* Profile Completion Banner */}
      <ProfileCompletionBanner
        profileCompletion={completion}
        userRole="CLIENT"
        missingSteps={missingSteps}
      />

      <section className="grid gap-3 sm:grid-cols-3" data-tour="stats">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card level={2} padding="lg" className="space-y-4" data-tour="quick-actions">
          <SectionHeading
            variant="section"
            title={t('sections.quickActions')}
            description={t('sections.quickActionsDesc')}
          />
          <div className="space-y-3">
            {QUICK_ACTIONS.map((action) => (
              <ActionCard key={action.href} {...action} />
            ))}
          </div>
        </Card>

        {/* Activity Feed */}
        <Card level={1} padding="lg" className="space-y-4" data-tour="activity">
          <SectionHeading
            variant="section"
            title={t('sections.recentActivity')}
            description={t('sections.recentActivityDesc')}
          />
          <ActivityFeed activities={activities} />
        </Card>
      </div>

      {/* Request Timeline */}
      <Card level={1} padding="lg" className="space-y-4">
        <SectionHeading
          variant="section"
          title={t('sections.yourRequests')}
          description={t('sections.yourRequestsDesc')}
        />
        <RequestTimeline requests={timelineRequests} />
      </Card>

      <WelcomeModal userRole="CLIENT" firstName={firstName} />
      <ClientDashboardTour />
    </div>
  );
}
