// src/components/dashboard/MatchingRequests.tsx
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge"; // Assuming we have Badge, if not use default span
import { formatDistanceToNow } from "date-fns"; // Standardizing date if available, else manual is fine. Manual for now.

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
          <Link key={request.id} href={`/pro/requests/${request.id}/offer`} className="block">
            <Card level={2} interactive className="group relative">
              {/* New Badge */}
              {daysAgo === 0 && (
                <div className="absolute -top-2 -right-2 rounded-full bg-gradient-to-r from-error to-red-600 px-3 py-1 text-[10px] font-bold text-white shadow-soft z-10">
                  🔥 NEW
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
                      <span>💻</span> Remote
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
                    Send your offer
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
