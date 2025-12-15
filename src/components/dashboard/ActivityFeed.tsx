// src/components/dashboard/ActivityFeed.tsx
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { EmptyState } from "@/components/ui/EmptyState";

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
  offer_received: 'from-[#EFF6FF] to-[#DBEAFE]',
  request_created: 'from-green-50 to-green-100',
  job_completed: 'from-purple-50 to-purple-100',
  review_left: 'from-yellow-50 to-yellow-100',
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const t = useTranslations('Dashboard.ActivityFeed');

  function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('justNow');
    if (diffMins < 60) return t('minAgo', { count: diffMins });
    if (diffHours < 24) return t('hoursAgo', { count: diffHours }); // Note: I used 'hoursAgo' for plural in JSON, 'hourAgo' for singular. 
    // Logic refinement: 
    if (diffHours === 1) return t('hourAgo', { count: 1 });
    if (diffHours < 24) return t('hoursAgo', { count: diffHours });

    if (diffDays === 1) return t('dayAgo', { count: 1 });
    if (diffDays < 7) return t('daysAgo', { count: diffDays });

    return date.toLocaleDateString();
  }

  if (activities.length === 0) {
    return (
      <EmptyState
        icon={<span className="text-4xl">📭</span>}
        title={t('emptyTitle')}
        description={t('emptyDesc')}
      />
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const Content = (
          <div className={`group flex items-start gap-4 rounded-xl bg-gradient-to-br p-4 shadow-soft-xs ring-1 ring-black/[0.02] transition-all duration-200 ${ACTIVITY_COLORS[activity.type]} ${activity.href ? 'hover:shadow-soft hover:-translate-y-0.5 cursor-pointer' : ''}`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-soft-xs text-xl">
              {ACTIVITY_ICONS[activity.type]}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-[#333333] group-hover:text-[#2563EB] transition-colors">
                {activity.title}
              </h4>
              <p className="text-xs text-[#7C7373] mt-1 line-clamp-2">
                {activity.description}
              </p>
              <p className="text-[10px] text-[#7C7373] mt-2 font-medium">
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
