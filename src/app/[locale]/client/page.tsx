// src/app/client/page.tsx
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ActionCard } from "@/components/ui/ActionCard";
import { Card } from "@/components/ui/Card";
import { DashboardHero } from "@/components/ui/DashboardHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { RequestTimeline } from "@/components/dashboard/RequestTimeline";
import { ProfileCompletionBanner } from "@/components/dashboard/ProfileCompletionBanner";
import { calculateClientCompletion } from "@/lib/profile-completion";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { ClientDashboardTour } from "@/components/onboarding/ClientDashboardTour";
import { getTranslations } from 'next-intl/server';
import { PlusCircle, FileText } from 'lucide-react';

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

  // Build dynamic highlights based on actual user state (Removed as per simplification)
  // const heroHighlights = ... (Removed)

  // const stats = ... (Removed)

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
      icon: <PlusCircle className="w-5 h-5" />,
    },
    {
      title: t('actions.reviewTitle'),
      description: t('actions.reviewDesc'),
      href: "/client/requests",
      cta: t('actions.reviewCta'),
      icon: <FileText className="w-5 h-5" />,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <DashboardHero
        eyebrow={t('eyebrow')}
        title={t('welcome', { name: firstName })}
        description={t('description')}
        action={{ label: t('actions.createCta'), href: "/client/requests/new" }}
      />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-8">

          {/* Request Timeline / Active Requests */}
          <div className="space-y-4">
            <SectionHeading
              title={t('sections.yourRequests')}
              description={t('sections.yourRequestsDesc')}
            />
            <Card className="glass-card shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300" padding="none">
              <div className="p-6">
                <RequestTimeline requests={timelineRequests} />
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="space-y-4">
            <SectionHeading
              title={t('sections.recentActivity')}
              description={t('sections.recentActivityDesc')}
            />
            <Card className="glass-card shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300" padding="none">
              <div className="p-6">
                <ActivityFeed activities={activities} />
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-8">

          {/* Profile Completion */}
          <ProfileCompletionBanner
            profileCompletion={completion}
            userRole="CLIENT"
            missingSteps={missingSteps}
          />

          {/* Quick Actions */}
          <div className="space-y-4">
            <SectionHeading
              title={t('sections.quickActions')}
              description={t('sections.quickActionsDesc')}
            />
            <div className="grid gap-3">
              {QUICK_ACTIONS.map((action) => (
                <ActionCard key={action.href} {...action} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <WelcomeModal userRole="CLIENT" firstName={firstName} />
      <ClientDashboardTour />
    </div>
  );
}
