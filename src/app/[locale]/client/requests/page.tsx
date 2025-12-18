import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import Link from "next/link";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";

type RequestStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export default async function ClientRequestsPage() {
  // Get authenticated user
  const { userId } = await auth();
  const t = await getTranslations('ClientRequests');
  const tCommon = await getTranslations('Common');

  if (!userId) {
    redirect('/login');
  }

  // Fetch user and their requests
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      clientProfile: {
        include: {
          requests: {
            include: {
              category: true,
              offers: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      },
    },
  });

  const requests = dbUser?.clientProfile?.requests || [];

  // Categorize requests
  const openRequests = requests.filter(r => r.status === 'OPEN');
  const activeRequests = requests.filter(r => r.status === 'IN_PROGRESS');
  const completedRequests = requests.filter(r => r.status === 'COMPLETED');

  // Status Config with Translations
  const STATUS_CONFIG = {
    OPEN: {
      variant: "primary" as BadgeVariant,
      label: t('status.open'),
      icon: "🔵",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    IN_PROGRESS: {
      variant: "warning" as BadgeVariant,
      label: t('status.inProgress'),
      icon: "🟡",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    COMPLETED: {
      variant: "success" as BadgeVariant,
      label: t('status.completed'),
      icon: "🟢",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    CANCELLED: {
      variant: "gray" as BadgeVariant,
      label: t('status.cancelled'),
      icon: "⚫",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
        actions={
          <Link
            href="/client/requests/new"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#1D4FD8] hover:shadow-lg"
          >
            <span>+</span> {t('create')}
          </Link>
        }
      />

      {/* Stats Overview */}
      {requests.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-4">
          <Card padding="lg" className="text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <p className="text-2xl font-bold text-blue-600">{openRequests.length}</p>
            <p className="text-xs text-blue-700 font-medium">{t('stats.open')}</p>
          </Card>
          <Card padding="lg" className="text-center bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <p className="text-2xl font-bold text-yellow-600">{activeRequests.length}</p>
            <p className="text-xs text-yellow-700 font-medium">{t('stats.inProgress')}</p>
          </Card>
          <Card padding="lg" className="text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <p className="text-2xl font-bold text-green-600">{completedRequests.length}</p>
            <p className="text-xs text-green-700 font-medium">{t('stats.completed')}</p>
          </Card>
          <Card padding="lg" className="text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <p className="text-2xl font-bold text-purple-600">{requests.reduce((sum, r) => sum + r.offers.length, 0)}</p>
            <p className="text-xs text-purple-700 font-medium">{t('stats.totalOffers')}</p>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {requests.length === 0 ? (
        <Card level={1} padding="lg" className="text-center py-12 border-dashed">
          <div className="text-5xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-[#333333] mb-2">{t('empty.title')}</h3>
          <p className="text-sm text-[#7C7373] mb-6 max-w-md mx-auto">
            {t('empty.desc')}
          </p>
          <Link
            href="/client/requests/new"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#1D4FD8] hover:shadow-lg"
          >
            <span>+</span> {t('createFirst')}
          </Link>
        </Card>
      ) : (
        <section className="space-y-4">
          {/* Open Requests */}
          {openRequests.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-[#333333] flex items-center gap-2">
                <span className="text-lg">🔵</span> {t('stats.open')} ({openRequests.length})
              </h2>
              {openRequests.map((req) => (
                <RequestCard key={req.id} request={req} config={STATUS_CONFIG[req.status as RequestStatus]} t={t} />
              ))}
            </div>
          )}

          {/* Active Requests */}
          {activeRequests.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-[#333333] flex items-center gap-2">
                <span className="text-lg">🟡</span> {t('stats.inProgress')} ({activeRequests.length})
              </h2>
              {activeRequests.map((req) => (
                <RequestCard key={req.id} request={req} config={STATUS_CONFIG[req.status as RequestStatus]} t={t} />
              ))}
            </div>
          )}

          {/* Completed Requests */}
          {completedRequests.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-[#333333] flex items-center gap-2">
                <span className="text-lg">🟢</span> {t('stats.completed')} ({completedRequests.length})
              </h2>
              {completedRequests.map((req) => (
                <RequestCard key={req.id} request={req} config={STATUS_CONFIG[req.status as RequestStatus]} t={t} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function RequestCard({ request, config, t }: { request: any, config: any, t: any }) {
  const hasOffers = request.offers.length > 0;
  const isNew = (Date.now() - new Date(request.createdAt).getTime()) < 24 * 60 * 60 * 1000; // Less than 24 hours

  return (
    <Link key={request.id} href={`/client/requests/${request.id}`}>
      <Card className="group relative overflow-hidden hover:border-[#2563EB] hover:shadow-md transition-all duration-200 cursor-pointer" padding="lg">
        {/* New Badge */}
        {isNew && (
          <div className="absolute -top-1 -right-1 bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-md">
            {t('card.new')}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-[#333333] group-hover:text-[#2563EB] transition-colors truncate">
                {request.title}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-[#7C7373]">
                <span className="flex items-center gap-1">
                  📂 {request.category.nameEn}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  📅 {t('card.posted', { date: new Date(request.createdAt).toLocaleDateString() })}
                </span>
              </div>
            </div>
            <Badge variant={config.variant}>
              <span className="mr-1">{config.icon}</span>
              {config.label}
            </Badge>
          </div>

          {/* Description Preview */}
          {request.description && (
            <p className="text-sm text-[#7C7373] line-clamp-2">
              {request.description}
            </p>
          )}

          {/* Stats Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
            <div className="flex items-center gap-4 text-xs">
              <span className={`flex items-center gap-1 font-semibold ${hasOffers ? 'text-green-600' : 'text-[#7C7373]'}`}>
                <span>📬</span>
                {t('card.offers', { count: request.offers.length })}
              </span>
              {request.budgetMax && (
                <span className="flex items-center gap-1 text-[#7C7373]">
                  <span>💰</span>
                  {t('card.budget', { amount: request.budgetMax })}
                </span>
              )}
            </div>
            <span className="text-xs font-semibold text-[#2563EB] group-hover:translate-x-1 transition-transform">
              {t('card.viewDetails')} →
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
