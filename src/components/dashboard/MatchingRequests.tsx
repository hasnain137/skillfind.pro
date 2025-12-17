// src/components/dashboard/MatchingRequests.tsx
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTranslations } from 'next-intl';

interface Request {
  id: string;
  title: string;
  description: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  location: string | null;
  remotePreference: string;
  createdAt: Date;
  categoryId: string;
}

interface MatchingRequestsProps {
  requests: Request[];
}

export function MatchingRequests({ requests }: MatchingRequestsProps) {
  const t = useTranslations('Components.MatchingRequests');

  // Helper to format days ago
  function getDaysAgo(date: Date) {
    const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    return daysAgo;
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={<span className="text-4xl">🔍</span>}
        title={t('emptyTitle')}
        description={t('emptyDesc')}
        action={{
          label: t('updateProfile'),
          href: "/pro/profile",
        }}
      />
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => {
        let budgetDisplay = t('budget.unspecified');
        if (request.budgetMin && request.budgetMax) {
          budgetDisplay = t('budget.range', { min: request.budgetMin, max: request.budgetMax });
        } else if (request.budgetMin) {
          budgetDisplay = t('budget.from', { min: request.budgetMin });
        }

        const daysAgo = getDaysAgo(request.createdAt);
        let timeDisplay = t('time.daysAgo', { count: daysAgo });
        if (daysAgo === 0) timeDisplay = t('time.today');
        if (daysAgo === 1) timeDisplay = t('time.yesterday');

        return (
          <Link key={request.id} href={`/pro/requests/${request.id}/offer`} className="block">
            <Card level={2} interactive className="group relative">
              {/* New Badge */}
              {daysAgo === 0 && (
                <div className="absolute -top-2 -right-2 rounded-full bg-gradient-to-r from-error to-red-600 px-3 py-1 text-[10px] font-bold text-white shadow-soft z-10">
                  🔥 {t('new')}
                </div>
              )}

              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-4">
                  <CardTitle className="text-base group-hover:text-[#2563EB] transition-colors line-clamp-1">
                    {request.title}
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="pb-3">
                {request.description && (
                  <p className="text-xs text-[#7C7373] leading-relaxed line-clamp-2">
                    {request.description}
                  </p>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-3 text-xs mt-3">
                  <span className="flex items-center gap-1 rounded-md bg-[#EFF6FF] px-2 py-1 font-semibold text-[#1d4ed8]">
                    <span>💰</span> {budgetDisplay}
                  </span>

                  {request.location && (
                    <span className="flex items-center gap-1 text-[#7C7373]">
                      <span>📍</span> {request.location}
                    </span>
                  )}

                  {request.remotePreference !== 'NO_REMOTE' && (
                    <span className="flex items-center gap-1 rounded-md bg-success-light px-2 py-1 font-semibold text-success-dark">
                      <span>💻</span> {t('remote')}
                    </span>
                  )}

                  <span className="ml-auto text-[#7C7373]">
                    {timeDisplay}
                  </span>
                </div>
              </CardContent>

              <div className="mx-5 border-t border-[#E5E7EB]/50" />

              <CardFooter className="pt-2 pb-2">
                <div className="flex w-full items-center justify-between">
                  <span className="text-xs font-medium text-[#7C7373]">
                    {t('sendOffer')}
                  </span>
                  <span className="text-[#2563EB] font-bold group-hover:translate-x-1 transition-transform text-sm">
                    →
                  </span>
                </div>
              </CardFooter>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
