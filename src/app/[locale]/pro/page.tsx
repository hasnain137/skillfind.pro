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
import { Search, Send, Briefcase, User } from 'lucide-react';

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

  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

  const thisMonth = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);


  // Calculate Chart Data (Last 6 Months)
  const chartData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthName = d.toLocaleString('default', { month: 'short' });
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);

    const monthlyTotal = completedJobs
      .filter(job => job.completedAt && job.completedAt >= monthStart && job.completedAt <= monthEnd)
      .reduce((sum, job) => sum + (job.request.budgetMax || job.request.budgetMin || 0), 0);

    chartData.push({ name: monthName, value: monthlyTotal });
  }

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



  const profileViews = 0; // Not tracked in schema yet
  const acceptanceRate = allOffers.length > 0
    ? Math.round((allOffers.filter(o => o.status === 'ACCEPTED').length / allOffers.length) * 100)
    : 0;

  const earningsData = {
    totalEarnings,
    thisMonth: thisMonthEarnings,
    lastMonth: lastMonthEarnings,
    pendingPayouts: balanceEuros,
    completedJobs: completedJobs.length,
    chartData, // Pass the real data
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

  const quickActions = [
    {
      key: 'browse',
      href: '/pro/requests',
      icon: <Search className="w-5 h-5" />
    },
    {
      key: 'offers',
      href: '/pro/offers',
      icon: <Send className="w-5 h-5" />
    },
    {
      key: 'jobs',
      href: '/pro/jobs',
      icon: <Briefcase className="w-5 h-5" />
    },
    {
      key: 'profile',
      href: '/pro/profile',
      icon: <User className="w-5 h-5" />
    }
  ].map(action => ({
    title: t(`Actions.${action.key}Title`),
    description: t(`Actions.${action.key}Desc`),
    href: action.href,
    cta: t(`Actions.${action.key}Cta`),
    icon: action.icon
  }));

  const nextSteps = [];
  if (profileCompletion < 100) {
    nextSteps.push({ label: t('Steps.profile'), href: '/pro/profile' });
  }
  if (professional.services.length === 0) {
    nextSteps.push({ label: t('Steps.services'), href: '/pro/profile' });
  }
  if (matchingRequestsToday > 0) {
    nextSteps.push({ label: t('Steps.matching', { count: matchingRequestsToday }), href: '/pro/requests' });
  }
  if (professional.offers.length > 0) {
    nextSteps.push({ label: t('Steps.offers', { count: professional.offers.length }), href: '/pro/offers' });
  }
  if (professional.jobs.length > 0) {
    nextSteps.push({ label: t('Steps.jobs', { count: professional.jobs.length }), href: '/pro/jobs' });
  }
  if (nextSteps.length === 0) {
    nextSteps.push({ label: t('Steps.default'), href: '/pro/requests' });
  }



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

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column - Main Content (Span 2) */}
        <div className="lg:col-span-2 space-y-8">

          {/* Performance Metrics */}
          <div className="space-y-4">
            <SectionHeading
              title={t('metricsTitle')}
              description={t('metricsDesc')}
            />
            <Card className="glass-card shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300" padding="none">
              <div className="p-6">
                <PerformanceMetrics data={metricsData} />
              </div>
            </Card>
          </div>

          {/* Matching Requests */}
          <div className="space-y-4">
            <SectionHeading
              title={t('requestsTitle')}
              description={t('requestsDesc')}
              actions={
                <Link
                  href="/pro/requests"
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors tracking-wide uppercase"
                >
                  {t('viewAll')} →
                </Link>
              }
            />
            <Card className="glass-card shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300" padding="none">
              <div className="p-6">
                <MatchingRequests requests={matchingRequests as any} />
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <SectionHeading
              title={t('quickActionsTitle')}
              description={t('quickActionsDesc')}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {quickActions.map((action) => (
                <ActionCard key={action.href} {...action} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar (Span 1) */}
        <div className="space-y-8">
          {/* Earnings (Top Priority for Pro) */}
          <EarningsChart data={earningsData} />

          {/* Status Card */}
          <StatusCard
            status={professional.status}
            isVerified={professional.isVerified}
            verificationMethod={professional.verificationMethod}
          />

          {/* Next Steps */}
          <div className="space-y-4">
            <SectionHeading
              title={t('nextStepsTitle')}
              description={t('nextStepsDesc')}
            />
            <Card className="glass-card shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300" padding="none">
              <div className="p-6">
                <ul className="space-y-3">
                  {nextSteps.map((step, index) => (
                    <li key={index}>
                      <Link href={step.href} className="glass-card flex items-start gap-4 p-4 rounded-xl hover:bg-white/90 transition-colors group cursor-pointer block">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white shadow-md ring-2 ring-primary-100 group-hover:scale-110 transition-transform">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium text-slate-700 pt-0.5 leading-snug group-hover:text-primary-700 transition-colors">
                          {step.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <WelcomeModal userRole="PROFESSIONAL" firstName={firstName} />
      <ProDashboardTour />
    </div>
  );
}
