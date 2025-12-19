// src/components/dashboard/MatchingRequests.tsx
'use client';

import { Link } from '@/i18n/routing';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTranslations } from 'next-intl';
import { MapPin, Banknote, Laptop, Clock, ArrowRight, Sparkles } from 'lucide-react';

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
  const t = useTranslations('Dashboard.MatchingRequests');

  // Helper to format currency
  const formatBudget = (min: number | null, max: number | null) => {
    if (min && max) return `€${min}-${max}`;
    if (min) return `From €${min}`;
    return t('budgetNotSpecified');
  };

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
    <div className="space-y-4">
      {requests.map((request, index) => {
        const daysAgo = Math.floor((Date.now() - new Date(request.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        const timeDisplay = daysAgo === 0 ? t('today') : daysAgo === 1 ? t('yesterday') : t('daysAgo', { count: daysAgo });
        const budgetDisplay = formatBudget(request.budgetMin, request.budgetMax);

        return (
          <Link key={request.id} href={`/pro/requests/${request.id}/offer`} className="block group">
            <div className="relative rounded-3xl border border-white/40 bg-white/70 backdrop-blur-xl p-6 transition-all duration-300 hover:scale-[1.01] hover:bg-white/80 hover:shadow-lg hover:border-blue-200">
              {/* New Badge */}
              {daysAgo === 0 && (
                <div className="absolute top-5 right-5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 ring-1 ring-blue-600/10 px-3 py-1 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  New
                </div>
              )}

              <div className="mb-3 pr-20 flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  {index + 1}
                </div>
                <h3 className="font-bold text-lg text-[#333333] group-hover:text-blue-600 transition-colors line-clamp-1">
                  {request.title}
                </h3>
              </div>


              {request.description && (
                <p className="text-sm font-medium text-gray-500 leading-relaxed line-clamp-2 mb-5">
                  {request.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-600">
                <div className="flex items-center gap-2 bg-gray-50/80 px-3 py-1.5 rounded-xl border border-gray-100/50">
                  <Banknote className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-[#333333]">{budgetDisplay}</span>
                </div>

                {request.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>{request.location}</span>
                  </div>
                )}

                {request.remotePreference !== 'NO_REMOTE' && (
                  <div className="flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5 text-gray-400" />
                    <span>{t('remote')}</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 ml-auto text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-medium">{timeDisplay}</span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}

      <div className="pt-4 flex justify-center">
        <Link href="/pro/requests" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors px-6 py-3 rounded-xl hover:bg-blue-50/50">
          {t('viewAll')}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
