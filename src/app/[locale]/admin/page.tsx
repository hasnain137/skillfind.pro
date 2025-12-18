// src/app/admin/page.tsx
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AdminAnalyticsDashboard } from '@/components/admin/AdminAnalyticsDashboard';
import { getTranslations } from 'next-intl/server';

export default async function AdminDashboardPage() {
    const t = await getTranslations('Components.AdminDashboard');

    return (
        <div className="space-y-6">
            <SectionHeading
                eyebrow={t('eyebrow')}
                title={t('title')}
                description={t('description')}
            />

            <AdminAnalyticsDashboard />
        </div>
    );
}

