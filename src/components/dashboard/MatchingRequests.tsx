// src/components/dashboard/MatchingRequests.tsx
import Link from "next/link";

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

import { EmptyState } from "@/components/ui/EmptyState";

export function MatchingRequests({ requests }: MatchingRequestsProps) {
  if (requests.length === 0) {
    return (
      <EmptyState
        icon={<span className="text-4xl">🔍</span>}
        title="No matching requests"
        description="Complete your profile and add more services to get matched with clients."
        action={{
          label: "Update Profile",
          href: "/pro/profile",
        }}
      />
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => {
        const budgetDisplay = request.budgetMin && request.budgetMax
          ? `€${request.budgetMin}-${request.budgetMax}`
          : request.budgetMin
            ? `From €${request.budgetMin}`
            : 'Budget not specified';

        const daysAgo = Math.floor((Date.now() - request.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        const timeDisplay = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`;

        return (
          <Link key={request.id} href={`/pro/requests/${request.id}/offer`}>
            <div className="group relative flex flex-col gap-3 rounded-xl bg-white p-4 shadow-soft ring-1 ring-black/[0.03] hover:shadow-soft-md hover:-translate-y-0.5 hover:ring-primary-500/20 transition-all duration-200">
              {/* New Badge */}
              {daysAgo === 0 && (
                <div className="absolute -top-2 -right-2 rounded-full bg-gradient-to-r from-error to-red-600 px-3 py-1 text-[10px] font-bold text-white shadow-soft">
                  🔥 NEW
                </div>
              )}

              {/* Title */}
              <h4 className="text-sm font-bold text-surface-900 group-hover:text-primary-600 transition-colors pr-12">
                {request.title}
              </h4>

              {/* Description */}
              {request.description && (
                <p className="text-xs text-surface-500 leading-relaxed line-clamp-2">
                  {request.description}
                </p>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="flex items-center gap-1 rounded-lg bg-primary-50 px-2.5 py-1 font-semibold text-primary-600">
                  <span>💰</span> {budgetDisplay}
                </span>

                {request.location && (
                  <span className="flex items-center gap-1 text-surface-500">
                    <span>📍</span> {request.location}
                  </span>
                )}

                {request.remotePreference !== 'NO_REMOTE' && (
                  <span className="flex items-center gap-1 rounded-lg bg-success-light px-2.5 py-1 font-semibold text-success-dark">
                    <span>💻</span> Remote
                  </span>
                )}

                <span className="ml-auto text-surface-400">
                  {timeDisplay}
                </span>
              </div>

              {/* CTA */}
              <div className="flex items-center justify-between pt-2 border-t border-surface-100">
                <span className="text-xs font-medium text-surface-500">
                  Send your offer
                </span>
                <span className="text-primary-600 font-bold group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
