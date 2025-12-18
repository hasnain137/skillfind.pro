import { prisma } from '@/lib/prisma';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AdCampaignForm } from '@/components/admin/AdCampaignForm';

export default async function NewAdCampaignPage() {
    const categories = await prisma.category.findMany({
        where: { isActive: true },
        select: { id: true, nameEn: true },
        orderBy: { nameEn: 'asc' },
    });

    return (
        <div className="space-y-6">
            <SectionHeading
                eyebrow="Advertising"
                title="New Campaign"
                description="Create a new advertising campaign with targeting and budget."
            />

            <AdCampaignForm categories={categories} />
        </div>
    );
}
