// src/components/dashboard/ActivityFeed.tsx
import Link from "next/link";

interface Activity {
  id: string;
  type: 'offer_received' | 'request_created' | 'job_completed' | 'review_left';
  title: string;
  description: string;
  timestamp: Date;
  href?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const ACTIVITY_ICONS = {
  offer_received: '📬',
  request_created: '📝',
  job_completed: '✅',
  review_left: '⭐',
};

const ACTIVITY_COLORS = {
  offer_received: 'from-blue-50 to-blue-100 border-blue-200',
  request_created: 'from-green-50 to-green-100 border-green-200',
  job_completed: 'from-purple-50 to-purple-100 border-purple-200',
  review_left: 'from-yellow-50 to-yellow-100 border-yellow-200',
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

import { EmptyState } from "@/components/ui/EmptyState";

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <EmptyState
        icon={<span className="text-4xl">📭</span>}
        title="No recent activity"
        description="Your activity will appear here once you start interacting with requests and offers."
      />
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const Content = (
          <div className={`group flex items-start gap-4 rounded-xl border bg-gradient-to-br p-4 transition-all duration-200 ${ACTIVITY_COLORS[activity.type]} ${activity.href ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : ''}`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm text-xl">
              {ACTIVITY_ICONS[activity.type]}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-[#333333] group-hover:text-[#2563EB] transition-colors">
                {activity.title}
              </h4>
              <p className="text-xs text-[#7C7373] mt-1 line-clamp-2">
                {activity.description}
              </p>
              <p className="text-[10px] text-[#B0B0B0] mt-2 font-medium">
                {formatTimeAgo(activity.timestamp)}
              </p>
            </div>
            {activity.href && (
              <div className="flex items-center text-[#2563EB] opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm">→</span>
              </div>
            )}
          </div>
        );

        return activity.href ? (
          <Link key={activity.id} href={activity.href}>
            {Content}
          </Link>
        ) : (
          <div key={activity.id}>{Content}</div>
        );
      })}
    </div>
  );
}
