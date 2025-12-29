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
import { ProfileCompletionBanner } from "@/components/dashboard/ProfileCompletionBanner";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
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

  // Check if professional has any services requiring qualification
  const hasRegulatedServices = professional.services.some(
    (service: any) => service.subcategory.requiresQualification
  );

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

  const earningsData = {
    totalEarnings,
    thisMonth: thisMonthEarnings,
    lastMonth: lastMonthEarnings,
    pendingPayouts: balanceEuros,
    completedJobs: completedJobs.length,
    chartData,
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



  return (
    <div className="space-y-6">
      {statusBannerProps && (
        <StatusBanner
          status={statusBannerProps.status}
          title={tRoot(statusBannerProps.title)}
          description={tRoot(statusBannerProps.description)}
        />
      )}

      {/* Simplified Hero */}
      <DashboardHero
        eyebrow={t('eyebrow')}
        title={t('welcome', { period: t(`periods.${timeOfDay}`), name: firstName })}
        description={t('description')}
        action={{ label: t('Actions.browseCta'), href: "/pro/requests" }}
      />



      <DashboardAlerts
        isVerified={professional.isVerified}
        qualificationVerified={professional.qualificationVerified}
        hasRegulatedServices={hasRegulatedServices}
        balance={professional.wallet?.balance || 0}
      />

      <ProfileCompletionBanner
        profileCompletion={profileCompletion}
        userRole="PROFESSIONAL"
        missingSteps={missingSteps}
      />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column - Matching Requests (Span 2) */}
        <div className="lg:col-span-2 space-y-8">

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

          {/* Earnings Chart */}
          <EarningsChart data={earningsData} />
        </div>

        {/* Right Column - Sidebar (Span 1) */}
        <div className="space-y-6">

          {/* Status Card */}
          <StatusCard
            status={professional.status}
            isVerified={professional.isVerified}
            verificationMethod={professional.verificationMethod}
          />

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="px-1">
              <SectionHeading
                variant="section"
                title={t('quickActionsTitle')}
                description={t('quickActionsDesc')}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {quickActions.map((action) => (
                <ActionCard key={action.href} {...action} />
              ))}
            </div>
          </div>
        </div>
      </div>





      <WelcomeModal userRole="PROFESSIONAL" firstName={firstName} />
      <ProDashboardTour />
    </div >
  );
}
