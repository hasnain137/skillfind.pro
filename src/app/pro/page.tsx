// src/app/pro/page.tsx
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateWallet } from "@/lib/services/wallet";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { DashboardHero } from "@/components/ui/DashboardHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatCard } from "@/components/ui/StatCard";
import { ActionCard } from "@/components/ui/ActionCard";
import { EarningsChart } from "@/components/dashboard/EarningsChart";
import { MatchingRequests } from "@/components/dashboard/MatchingRequests";
import { PerformanceMetrics } from "@/components/dashboard/PerformanceMetrics";
import { ProfileCompletionBanner } from "@/components/dashboard/ProfileCompletionBanner";
import { calculateProfessionalCompletion } from "@/lib/profile-completion";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";

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

  // Get wallet balance
  // We already included wallet in the query above, but keeping getOrCreateWallet for safety if it's missing (though it should be created on signup)
  // Actually, let's rely on the query if possible, but getOrCreateWallet handles creation if missing.
  // For simplicity and to match new types, we'll use the queried wallet if present.
  const balanceEuros = (professional.wallet?.balance || 0) / 100;

  // Calculate profile completion using the shared helper
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

  // Calculate average rating from job reviews
  const allReviews = professional.jobs
    .map((job: any) => job.review)
    .filter((review: any) => review !== null);

  const avgRating = allReviews.length > 0
    ? (allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length).toFixed(1)
    : 'N/A';

  const stats = [
    { label: "New matching requests", value: matchingRequestsToday, icon: "🔍" },
    { label: "Active jobs", value: professional.jobs.length, icon: "💼" },
    { label: "Average rating", value: avgRating, icon: "⭐" },
  ];

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

  // Dynamic next steps based on profile state
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

  // Get earnings data
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

  // Get matching requests
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

  // Get profile views and clicks
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
    responseTime: '< 2 hours', // This would need real calculation
  };

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      {professional.status !== 'ACTIVE' && (
        <Card padding="lg" className={`border-l-4 ${professional.status === 'PENDING_REVIEW' ? 'border-yellow-400 bg-yellow-50' :
          professional.status === 'SUSPENDED' || professional.status === 'BANNED' ? 'border-red-500 bg-red-50' :
            'border-blue-400 bg-blue-50'
          }`}>
          <div className="flex items-start gap-4">
            <div className="text-2xl">
              {professional.status === 'PENDING_REVIEW' ? '⏳' :
                professional.status === 'SUSPENDED' || professional.status === 'BANNED' ? '⛔' : 'ℹ️'}
            </div>
            <div>
              <h3 className={`font-bold ${professional.status === 'PENDING_REVIEW' ? 'text-yellow-800' :
                professional.status === 'SUSPENDED' || professional.status === 'BANNED' ? 'text-red-800' :
                  'text-blue-800'
                }`}>
                {professional.status === 'PENDING_REVIEW' ? 'Account Under Review' :
                  professional.status === 'SUSPENDED' ? 'Account Suspended' :
                    professional.status === 'BANNED' ? 'Account Banned' :
                      'Complete Your Profile'}
              </h3>
              <p className={`mt-1 text-sm ${professional.status === 'PENDING_REVIEW' ? 'text-yellow-700' :
                professional.status === 'SUSPENDED' || professional.status === 'BANNED' ? 'text-red-700' :
                  'text-blue-700'
                }`}>
                {professional.status === 'PENDING_REVIEW'
                  ? "Your profile is currently being reviewed by our team. You can't send offers yet, but you can still update your profile."
                  : professional.status === 'SUSPENDED' || professional.status === 'BANNED'
                    ? "Your account has been deactivated. Please contact support to resolve this issue."
                    : "Please complete your profile details to get verified and start receiving requests."}
              </p>
            </div>
          </div>
        </Card>
      )}

      <DashboardHero
        eyebrow="Professional dashboard"
        title={`Good ${timeOfDay}, ${firstName}`}
        description="See matching requests, send tailored offers, and keep your profile ready for new opportunities."
        action={{ label: "View requests", href: "/pro/requests" }}
        highlights={highlights}
      />

      {/* Profile Completion Banner */}
      <ProfileCompletionBanner
        profileCompletion={profileCompletion}
        userRole="PROFESSIONAL"
        missingSteps={missingSteps}
      />

      {/* Earnings Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <EarningsChart data={earningsData} />
        </div>

        {/* Performance Metrics */}
        <div className="lg:col-span-2">
          <Card variant="default" padding="lg" className="space-y-4 h-full">
            <SectionHeading
              variant="section"
              title="Performance metrics"
              description="Track your success and visibility on the platform."
            />
            <PerformanceMetrics data={metricsData} />
          </Card>
        </div>
      </div>

      {/* Matching Requests */}
      <Card variant="default" padding="lg" className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeading
            variant="section"
            title="Matching requests"
            description="New opportunities that match your services."
          />
          <Link
            href="/pro/requests"
            className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4FD8] transition-colors"
          >
            View all →
          </Link>
        </div>
        <MatchingRequests requests={matchingRequests as any} />
      </Card>

      {/* Quick Actions & Next Steps */}
      <div className="grid gap-6 lg:grid-cols-2">
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

        <Card variant="muted" padding="lg" className="space-y-4">
          <SectionHeading
            variant="section"
            title="Next steps"
            description="Suggested actions to grow your business."
          />
          <ul className="space-y-3">
            {nextSteps.map((step, index) => (
              <li key={index} className="flex items-start gap-3 rounded-lg bg-white p-3 shadow-sm">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#1D4FD8] text-xs font-bold text-white">
                  {index + 1}
                </div>
                <span className="text-sm text-[#333333]">{step}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <WelcomeModal userRole="PROFESSIONAL" firstName={firstName} />
    </div>
  );
}
