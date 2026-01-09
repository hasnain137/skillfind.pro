// src/components/dashboard/RequestTimeline.tsx
import { Link } from '@/i18n/routing';

interface TimelineRequest {
  id: string;
  title: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  offerCount: number;
  createdAt: Date;
  budget?: number;
}

interface RequestTimelineTranslations {
  emptyTitle: string;
  emptyDesc: string;
  createRequest: string;
  offers: string;
  budget: string;
  status: {
    open: string;
    inProgress: string;
    completed: string;
    cancelled: string;
  };
}

interface RequestTimelineProps {
  requests: TimelineRequest[];
  translations?: RequestTimelineTranslations;
}

import { EmptyState } from "@/components/ui/EmptyState";
import { Circle, Clock, CheckCircle, XCircle } from 'lucide-react';

export function RequestTimeline({ requests, translations }: RequestTimelineProps) {
  // Default translations fallback
  const t = translations || {
    emptyTitle: "No requests yet",
    emptyDesc: "Create your first request to get started and receive offers from professionals.",
    createRequest: "Create Request",
    offers: "offers",
    budget: "budget",
    status: {
      open: "Open",
      inProgress: "In Progress",
      completed: "Completed",
      cancelled: "Cancelled"
    }
  };

  const STATUS_CONFIG = {
    OPEN: {
      label: t.status.open,
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: <Circle className="w-4 h-4 fill-current" />,
    },
    IN_PROGRESS: {
      label: t.status.inProgress,
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      icon: <Clock className="w-4 h-4" />,
    },
    COMPLETED: {
      label: t.status.completed,
      color: 'bg-green-100 text-green-700 border-green-200',
      icon: <CheckCircle className="w-4 h-4" />,
    },
    CANCELLED: {
      label: t.status.cancelled,
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      icon: <XCircle className="w-4 h-4" />,
    },
  };

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={<span className="text-4xl">📋</span>}
        title={t.emptyTitle}
        description={t.emptyDesc}
        action={{
          label: t.createRequest,
          href: "/client/requests/new",
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request, index) => (
        <Link key={request.id} href={`/client/requests/${request.id}`}>
          <div className="group relative flex items-start gap-4 rounded-xl border border-white/40 bg-white/70 backdrop-blur-xl p-4 shadow-sm hover:shadow-md hover:border-[#3B4D9D]/20 hover:-translate-y-0.5 transition-all duration-200">
            {/* Timeline Line */}
            {index < requests.length - 1 && (
              <div className="absolute left-7 top-12 h-[calc(100%+1rem)] w-0.5 bg-gradient-to-b from-[#2563EB] to-transparent" />
            )}

            {/* Timeline Dot */}
            <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#1D4FD8] text-sm shadow-md ring-2 ring-white">
              {STATUS_CONFIG[request.status].icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-semibold text-[#333333] group-hover:text-[#2563EB] transition-colors line-clamp-1">
                  {request.title}
                </h4>
                <span className={`shrink-0 rounded-lg border px-2 py-0.5 text-[10px] font-semibold ${STATUS_CONFIG[request.status].color}`}>
                  {STATUS_CONFIG[request.status].label}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#7C7373]">
                <span className="flex items-center gap-1">
                  <span>📬</span>
                  <span className="font-semibold text-[#333333]">{request.offerCount}</span> {t.offers}
                </span>
                {request.budget && (
                  <span className="flex items-center gap-1">
                    <span>💰</span>
                    <span className="font-semibold text-[#333333]">€{request.budget}</span> {t.budget}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <span>📅</span>
                  {request.createdAt.toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center text-[#2563EB] opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-lg">→</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

