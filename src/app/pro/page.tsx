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

  const professional = await prisma.professional.findUnique({
    where: { userId },
    include: {
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
    redirect('/complete-profile');
  }

  // Get wallet balance
  const wallet = await getOrCreateWallet(professional.id);
  const balanceEuros = wallet.balance / 100;

  // Calculate profile completion
  let profileCompletion = 0;
  if (professional.bio) profileCompletion += 30;
  if (professional.services.length > 0) profileCompletion += 30;
  if (professional.city) profileCompletion += 20;
  if (professional.isVerified) profileCompletion += 20;

  // Get matching requests count (today)
  const serviceCategoryIds = professional.services.map(s => s.subcategory.category.id);
  const uniqueCategoryIds = [...new Set(serviceCategoryIds)];
  
  const matchingRequestsToday = await prisma.request.count({
    where: {
      status: 'OPEN',
      categoryId: {
        in: uniqueCategoryIds,
      },
      createdAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    },
  });

  // Calculate average rating from job reviews
  const allReviews = professional.jobs
    .map(job => job.review)
    .filter(review => review !== null);
  
  const avgRating = allReviews.length > 0
    ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
    : 'N/A';

  const stats = [
    { label: "New matching requests", value: matchingRequestsToday },
    { label: "Active jobs", value: professional.jobs.length },
    { label: "Average rating", value: avgRating },
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
        in: uniqueCategoryIds,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  });

  // Get profile views and clicks
  const profileViews = await prisma.professionalClick.count({
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
      <DashboardHero
        eyebrow="Professional dashboard"
        title={`Good ${timeOfDay}, ${firstName}`}
        description="See matching requests, send tailored offers, and keep your profile ready for new opportunities."
        action={{ label: "View requests", href: "/pro/requests" }}
        highlights={highlights}
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
    </div>
  );
}
