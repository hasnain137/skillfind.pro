// src/app/client/jobs/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { Link } from '@/i18n/routing';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import ClientJobsList from '@/components/client/ClientJobsList';

export default async function ClientJobsPage() {
  const { userId } = await auth();
  const t = await getTranslations('ClientJobs');

  if (!userId) {
    redirect('/login');
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      clientProfile: {
        include: {
          requests: {
            include: {
              job: {
                include: {
                  professional: {
                    include: {
                      user: true,
                    },
                  },
                  review: {
                    select: {
                      id: true,
                    },
                  },
                  request: {
                    include: {
                      category: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const jobs = dbUser?.clientProfile?.requests
    .map(r => r.job)
    .filter((j): j is NonNullable<typeof j> => j !== null) || [];

  const activeJobs = jobs.filter(j => (j.status as string) === 'PENDING' || (j.status as string) === 'IN_PROGRESS');
  const completedJobs = jobs.filter(j => (j.status as string) === 'COMPLETED');
  const totalSpent = jobs.reduce((sum, j) => sum + (j.agreedPrice || 0), 0);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />

      {/* Stats Overview */}
      {jobs.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-4">
          <Card padding="lg" className="text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <p className="text-2xl font-bold text-blue-600">{activeJobs.length}</p>
            <p className="text-xs text-blue-700 font-medium">{t('stats.active')}</p>
          </Card>
          <Card padding="lg" className="text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <p className="text-2xl font-bold text-green-600">{completedJobs.length}</p>
            <p className="text-xs text-green-700 font-medium">{t('stats.completed')}</p>
          </Card>
          <Card padding="lg" className="text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <p className="text-2xl font-bold text-purple-600">{jobs.length}</p>
            <p className="text-xs text-purple-700 font-medium">{t('stats.total')}</p>
          </Card>
          <Card padding="lg" className="text-center bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <p className="text-2xl font-bold text-orange-600">€{totalSpent.toFixed(0)}</p>
            <p className="text-xs text-orange-700 font-medium">{t('stats.spent')}</p>
          </Card>
        </div>
      )}

      {jobs.length === 0 ? (
        <Card level={1} padding="lg" className="text-center py-12 border-dashed">
          <div className="text-5xl mb-4">💼</div>
          <h3 className="text-lg font-semibold text-[#333333] mb-2">{t('empty.title')}</h3>
          <p className="text-sm text-[#7C7373] mb-6 max-w-md mx-auto">
            {t('empty.desc')}
          </p>
          <Link href="/client/requests">
            <Button className="shadow-md hover:shadow-lg">
              {t('empty.button')} →
            </Button>
          </Link>
        </Card>
      ) : (
        <ClientJobsList activeJobs={activeJobs as any} completedJobs={completedJobs as any} />
      )}
    </div>
  );
}
