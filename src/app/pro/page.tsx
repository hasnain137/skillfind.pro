// src/app/pro/page.tsx
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateWallet } from "@/lib/services/wallet";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DashboardHero } from "@/components/ui/DashboardHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ActionCard } from "@/components/ui/ActionCard";
import { StatusBanner, getProfessionalStatusBanner } from "@/components/ui/StatusBanner";
import { EarningsChart } from "@/components/dashboard/EarningsChart";
import { MatchingRequests } from "@/components/dashboard/MatchingRequests";
import { PerformanceMetrics } from "@/components/dashboard/PerformanceMetrics";
import { ProfileCompletionBanner } from "@/components/dashboard/ProfileCompletionBanner";
import { calculateProfessionalCompletion } from "@/lib/profile-completion";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { ProDashboardTour } from "@/components/onboarding/ProDashboardTour";
import { FadeIn } from "@/components/ui/motion/FadeIn";

const QUICK_ACTIONS = [
  {
    title: "Browse matching requests",
    description: "See new opportunities that match your services and skills.",
    href: "/pro/requests",
    cta: "View requests",
  },
  {
    title: "Manage your offers",
    description: "Track pending offers and see which ones got accepted.",
    href: "/pro/offers",
    cta: "View offers",
  },
  {
    title: "Active jobs",
    description: "Start work and mark jobs complete when finished.",
    href: "/pro/jobs",
    cta: "View jobs",
  },
  {
    title: "Update profile",
    description: "Keep your bio, services, and portfolio up to date.",
    href: "/pro/profile",
    cta: "Edit profile",
  },
];

export default async function ProDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  const user = await currentUser();
  const firstName = user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'there';

  // Get database user first to get the internal ID
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!dbUser) {
    redirect('/auth-redirect');
  }

  // Now fetch professional profile using the internal user ID
  const professional: any = await prisma.professional.findUnique({
    where: { userId: dbUser.id },
    include: {
      user: true,
      profile: true,
      wallet: true,
      services: {
        include: {
          subcategory: {
            include: {
              category: true,
            },
          },
        },
      },
      offers: {
        where: {
          status: 'PENDING',
        },
      },
      jobs: {
        where: {
          status: {
            in: ['ACCEPTED', 'IN_PROGRESS'],
          },
        },
        include: {
          review: true,
        },
      },
    },
  });

  if (!professional) {
    redirect('/auth-redirect');
  }

  const balanceEuros = (professional.wallet?.balance || 0) / 100;
  const { percentage: profileCompletion, missingSteps } = calculateProfessionalCompletion(professional);

  // Get matching requests count (today)
  const serviceCategoryIds = professional.services.map((s: any) => s.subcategory.category.id);
  const uniqueCategoryIds = [...new Set(serviceCategoryIds)];

  const matchingRequestsToday = await prisma.request.count({
    where: {
      status: 'OPEN',
      categoryId: {
        in: uniqueCategoryIds as string[],
      },
      createdAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    },
  });

  const allReviews = professional.jobs
    .map((job: any) => job.review)
    .filter((review: any) => review !== null);

  const avgRating = allReviews.length > 0
    ? (allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length).toFixed(1)
    : 'N/A';

  const highlights = [
    {
      label: "Profile completion",
      value: `${profileCompletion}%`,
      helper: profileCompletion < 100 ? "Complete your profile" : "All done!"
    },
    {
      label: "Wallet balance",
      value: `€${balanceEuros.toFixed(2)}`,
      helper: balanceEuros < 5 ? "Top up recommended" : "Good balance"
    },
    {
      label: "Pending offers",
      value: `${professional.offers.length}`,
      helper: professional.offers.length > 0 ? "Awaiting response" : "Send more offers"
    },
  ];

  const nextSteps = [];
  if (profileCompletion < 100) {
    nextSteps.push("Complete your profile to win more jobs");
  }
  if (professional.services.length === 0) {
    nextSteps.push("Add services to see matching requests");
  }
  if (matchingRequestsToday > 0) {
    nextSteps.push(`${matchingRequestsToday} new matching requests today - respond quickly!`);
  }
  if (professional.offers.length > 0) {
    nextSteps.push(`${professional.offers.length} pending offers awaiting client decision`);
  }
  if (professional.jobs.length > 0) {
    nextSteps.push(`${professional.jobs.length} active jobs need your attention`);
  }
  if (nextSteps.length === 0) {
    nextSteps.push("Browse matching requests and send offers to get hired");
  }

  const timeOfDay = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening';

  const completedJobs = await prisma.job.findMany({
    where: {
      professionalId: professional.id,
      status: 'COMPLETED',
    },
    include: {
      request: true,
    },
  });

  const totalEarnings = completedJobs.reduce((sum, job) => {
    const amount = job.request.budgetMax || job.request.budgetMin || 0;
    return sum + amount;
  }, 0);

  const thisMonth = new Date();
  const lastMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 1, 1);

  const thisMonthEarnings = completedJobs
    .filter(job => job.completedAt && job.completedAt >= new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1))
    .reduce((sum, job) => sum + (job.request.budgetMax || job.request.budgetMin || 0), 0);

  const lastMonthEarnings = completedJobs
    .filter(job => job.completedAt && job.completedAt >= lastMonth && job.completedAt < new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1))
    .reduce((sum, job) => sum + (job.request.budgetMax || job.request.budgetMin || 0), 0);

  const earningsData = {
    totalEarnings,
    thisMonth: thisMonthEarnings,
    lastMonth: lastMonthEarnings,
    pendingPayouts: balanceEuros,
    completedJobs: completedJobs.length,
  };

  const matchingRequests = await prisma.request.findMany({
    where: {
      status: 'OPEN',
      categoryId: {
        in: uniqueCategoryIds as string[],
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  });

  const profileViews = await prisma.clickEvent.count({
    where: {
      professionalId: professional.id,
    },
  });

  const allOffers = await prisma.offer.findMany({
    where: {
      professionalId: professional.id,
    },
  });

  const acceptedOffers = allOffers.filter(o => o.status === 'ACCEPTED').length;
  const acceptanceRate = allOffers.length > 0 ? Math.round((acceptedOffers / allOffers.length) * 100) : 0;

  const metricsData = {
    profileViews,
    offersSent: allOffers.length,
    acceptanceRate,
    averageRating: professional.averageRating,
    totalReviews: professional.totalReviews,
    responseTime: '< 2 hours',
  };

  const statusBannerProps = professional.status !== 'ACTIVE'
    ? getProfessionalStatusBanner(professional.status)
    : null;

  return (
    <div className="space-y-6">
      {statusBannerProps && (
        <StatusBanner {...statusBannerProps} />
      )}

      <DashboardHero
        eyebrow="Professional dashboard"
        title={`Good ${timeOfDay}, ${firstName}`}
        description="See matching requests, send tailored offers, and keep your profile ready for new opportunities."
        action={{ label: "View requests", href: "/pro/requests" }}
        highlights={highlights}
      />

      <ProfileCompletionBanner
        profileCompletion={profileCompletion}
        userRole="PROFESSIONAL"
        missingSteps={missingSteps}
      />

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3" data-tour="earnings">
        {/* Earnings */}
        <div className="lg:col-span-1">
          <EarningsChart data={earningsData} />
        </div>

        {/* Performance Metrics */}
        <div className="lg:col-span-2" data-tour="stats">
          <Card level={1} className="space-y-4 h-full">
            <CardHeader>
              <SectionHeading
                variant="section"
                title="Performance metrics"
                description="Track your success and visibility on the platform."
              />
            </CardHeader>
            <CardContent>
              <PerformanceMetrics data={metricsData} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Matching Requests */}
      <Card level={1} className="space-y-4" data-tour="matching-requests">
        <CardHeader className="flex flex-row items-center justify-between">
          <SectionHeading
            variant="section"
            title="Matching requests"
            description="New opportunities that match your services."
          />
          <Link
            href="/pro/requests"
            className="text-xs font-semibold text-[#2563EB] hover:text-[#1d4ed8] transition-colors"
          >
            View all →
          </Link>
        </CardHeader>
        <CardContent>
          <MatchingRequests requests={matchingRequests as any} />
        </CardContent>
      </Card>

      {/* Quick Actions & Next Steps */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card level={1} className="space-y-4">
          <CardHeader>
            <SectionHeading
              variant="section"
              title="Quick actions"
              description="Shortcuts to the most common tasks."
            />
          </CardHeader>
          <CardContent className="space-y-3">
            {QUICK_ACTIONS.map((action) => (
              <ActionCard key={action.href} {...action} />
            ))}
          </CardContent>
        </Card>

        <Card level={1} className="space-y-4">
          <CardHeader>
            <SectionHeading
              variant="section"
              title="Next steps"
              description="Suggested actions to grow your business."
            />
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-3 rounded-lg bg-[#FAFAFA] p-3 shadow-sm border border-[#E5E7EB]">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white">
                    {index + 1}
                  </div>
                  <span className="text-sm text-[#333333]">{step}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      <WelcomeModal userRole="PROFESSIONAL" firstName={firstName} />
      <ProDashboardTour />
    </div>
  );
}
