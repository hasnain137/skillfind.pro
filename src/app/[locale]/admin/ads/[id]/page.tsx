import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AdCampaignForm } from '@/components/admin/AdCampaignForm';

export default async function EditAdCampaignPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const [campaign, categories] = await Promise.all([
        prisma.adCampaign.findUnique({ where: { id } }),
        prisma.category.findMany({
            where: { isActive: true },
            select: { id: true, nameEn: true },
            orderBy: { nameEn: 'asc' },
        }),
    ]);

    if (!campaign) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <SectionHeading
                eyebrow="Advertising"
                title="Edit Campaign"
                description={`Editing: ${campaign.name}`}
            />

            <AdCampaignForm
                categories={categories}
                initialData={{
                    ...campaign,
                    startDate: campaign.startDate.toISOString(),
                    endDate: campaign.endDate.toISOString(),
                }}
                isEditing
            />
        </div>
    );
}
