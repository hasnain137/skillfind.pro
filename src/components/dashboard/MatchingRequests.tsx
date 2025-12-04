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
            <div className="group relative flex flex-col gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-[#2563EB]/30 transition-all duration-200">
              {/* New Badge */}
              {daysAgo === 0 && (
                <div className="absolute -top-2 -right-2 rounded-full bg-gradient-to-r from-[#EF4444] to-[#DC2626] px-3 py-1 text-[10px] font-bold text-white shadow-md">
                  🔥 NEW
                </div>
              )}

              {/* Title */}
              <h4 className="text-sm font-bold text-[#333333] group-hover:text-[#2563EB] transition-colors pr-12">
                {request.title}
              </h4>

              {/* Description */}
              {request.description && (
                <p className="text-xs text-[#7C7373] leading-relaxed line-clamp-2">
                  {request.description}
                </p>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="flex items-center gap-1 rounded-lg bg-[#EEF2FF] px-2.5 py-1 font-semibold text-[#2563EB]">
                  <span>💰</span> {budgetDisplay}
                </span>

                {request.location && (
                  <span className="flex items-center gap-1 text-[#7C7373]">
                    <span>📍</span> {request.location}
                  </span>
                )}

                {request.remotePreference !== 'NO_REMOTE' && (
                  <span className="flex items-center gap-1 rounded-lg bg-[#DCFCE7] px-2.5 py-1 font-semibold text-[#166534]">
                    <span>💻</span> Remote
                  </span>
                )}

                <span className="ml-auto text-[#B0B0B0]">
                  {timeDisplay}
                </span>
              </div>

              {/* CTA */}
              <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB]">
                <span className="text-xs font-medium text-[#7C7373]">
                  Send your offer
                </span>
                <span className="text-[#2563EB] font-bold group-hover:translate-x-1 transition-transform">
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
