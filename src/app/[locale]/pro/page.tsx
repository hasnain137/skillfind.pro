// src/app/pro/page.tsx
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateWallet } from "@/lib/services/wallet";
import { Link } from '@/i18n/routing';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DashboardHero } from "@/components/ui/DashboardHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ActionCard } from "@/components/ui/ActionCard";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { getProfessionalStatusBanner } from "@/lib/professional-status";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { EarningsChart } from "@/components/dashboard/EarningsChart";
import { MatchingRequests } from "@/components/dashboard/MatchingRequests";
import { PerformanceMetrics } from "@/components/dashboard/PerformanceMetrics";
import { ProfileCompletionBanner } from "@/components/dashboard/ProfileCompletionBanner";
import { calculateProfessionalCompletion } from "@/lib/profile-completion";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { ProDashboardTour } from "@/components/onboarding/ProDashboardTour";
import { FadeIn } from "@/components/ui/motion/FadeIn";
import { getTranslations } from 'next-intl/server';

export default async function ProDashboardPage() {
  const { userId } = await auth();
  const t = await getTranslations('ProDashboard');
  const tRoot = await getTranslations();

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

  const completedJobs = await prisma.job.findMany({
    where: {
      professionalId: professional.id,
      status: 'COMPLETED',
    },
    include: {
      request: true,
    },
  });

  const matchingRequests = await prisma.request.findMany({
    where: {
      status: 'OPEN',
      categoryId: {
        in: uniqueCategoryIds as string[],
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      category: true,
      subcategory: true,
    }
  });

  const allOffers = await prisma.offer.findMany({
    where: { professionalId: professional.id }
  });

  const activeJobs = await prisma.job.count({
    where: {
      professionalId: professional.id,
      status: 'IN_PROGRESS',
    }
  });

  const thisMonth = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);


  const highlights = [
    {
      label: t('Highlights.profile'),
      value: `${profileCompletion}%`,
      helper: profileCompletion < 100 ? t('Steps.profile') : t('Highlights.allDone')
    },
    {
      label: t('Highlights.wallet'),
      value: `€${balanceEuros.toFixed(2)}`,
      helper: balanceEuros < 5 ? t('Highlights.topUp') : t('Highlights.goodBalance')
    },
    {
      label: t('Highlights.pending'),
      value: `${professional.offers.length}`,
      helper: professional.offers.length > 0 ? t('Highlights.awaitingResponse') : t('Highlights.sendOffers')
    },
  ];

  const nextSteps = [];
  if (profileCompletion < 100) {
    nextSteps.push(t('Steps.profile'));
  }
  if (professional.services.length === 0) {
    nextSteps.push(t('Steps.services'));
  }
  if (matchingRequestsToday > 0) {
    nextSteps.push(t('Steps.matching', { count: matchingRequestsToday }));
  }
  if (professional.offers.length > 0) {
    nextSteps.push(t('Steps.offers', { count: professional.offers.length }));
  }
  if (professional.jobs.length > 0) {
    nextSteps.push(t('Steps.jobs', { count: professional.jobs.length }));
  }
  if (nextSteps.length === 0) {
    nextSteps.push(t('Steps.default'));
  }

  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

  const profileViews = 0; // Not tracked in schema yet
  const acceptanceRate = allOffers.length > 0
    ? Math.round((allOffers.filter(o => o.status === 'ACCEPTED').length / allOffers.length) * 100)
    : 0;


  const totalEarnings = completedJobs.reduce((sum, job) => {
    const amount = job.request.budgetMax || job.request.budgetMin || 0;
    return sum + amount;
  }, 0);

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

  const metricsData = {
    profileViews,
    offersSent: allOffers.length,
    acceptanceRate,
    averageRating: professional.averageRating,
    totalReviews: professional.totalReviews,
    responseTime: t('Metrics.responseTimeValue'),
  };

  const statusBannerProps = getProfessionalStatusBanner(professional.status);

  const quickActionKeys = ['browse', 'offers', 'jobs', 'profile'];
  const quickActions = quickActionKeys.map(key => ({
    title: t(`Actions.${key}Title`),
    description: t(`Actions.${key}Desc`),
    href: key === 'browse' ? '/pro/requests' : key === 'offers' ? '/pro/offers' : key === 'jobs' ? '/pro/jobs' : '/pro/profile',
    cta: t(`Actions.${key}Cta`)
  }));

  return (
    <div className="space-y-6">
      {statusBannerProps && (
        <StatusBanner
          status={statusBannerProps.status}
          title={tRoot(statusBannerProps.title)}
          description={tRoot(statusBannerProps.description)}
        />
      )}

      <DashboardHero
        eyebrow={t('eyebrow')}
        title={t('welcome', { period: t(`periods.${timeOfDay}`), name: firstName })}
        description={t('description')}
        action={{ label: t('Actions.browseCta'), href: "/pro/requests" }}
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
        <div className="lg:col-span-1 space-y-6">
          <StatusCard
            status={professional.status}
            isVerified={professional.isVerified}
            verificationMethod={professional.verificationMethod}
          />
          <EarningsChart data={earningsData} />
        </div>

        {/* Performance Metrics */}
        <div className="lg:col-span-2" data-tour="stats">
          <Card level={1} className="space-y-4 h-full">
            <CardHeader>
              <SectionHeading
                variant="section"
                title={t('metricsTitle')}
                description={t('metricsDesc')}
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
            title={t('requestsTitle')}
            description={t('requestsDesc')}
          />
          <Link
            href="/pro/requests"
            className="text-xs font-semibold text-[#2563EB] hover:text-[#1d4ed8] transition-colors"
          >
            {t('viewAll')} →
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
              title={t('quickActionsTitle')}
              description={t('quickActionsDesc')}
            />
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <ActionCard key={action.href} {...action} />
            ))}
          </CardContent>
        </Card>

        <Card level={1} className="space-y-4">
          <CardHeader>
            <SectionHeading
              variant="section"
              title={t('nextStepsTitle')}
              description={t('nextStepsDesc')}
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
