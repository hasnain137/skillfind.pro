import { SectionHeading } from '@/components/ui/SectionHeading';
import { DisputesList } from '@/components/admin/DisputesList';

export default function AdminDisputesPage() {
    return (
        <div className="space-y-6">
            <SectionHeading
                eyebrow="Resolution Center"
                title="Dispute Management"
                description="Review and resolve disputes between clients and professionals."
            />

            <DisputesList />
        </div>
    );
}
