import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';
import SettingsForm from './SettingsForm';

export default async function AdminSettingsPage() {
    // Get or create default settings
    let settings = await prisma.platformSettings.findFirst();

    if (!settings) {
        settings = await prisma.platformSettings.create({
            data: {
                clickFee: 10,
                minimumWalletBalance: 200,
                maxOffersPerRequest: 10,
            },
        });
    }

    return (
        <div className="space-y-6">
            <SectionHeading
                eyebrow="Configuration"
                title="Platform Settings"
                description="Manage global platform configuration."
            />

            <div className="max-w-2xl">
                <Card padding="lg">
                    <SettingsForm
                        initialSettings={{
                            clickFee: settings.clickFee,
                            minimumWalletBalance: settings.minimumWalletBalance,
                            maxOffersPerRequest: settings.maxOffersPerRequest,
                            phoneVerificationEnabled: settings.phoneVerificationEnabled,
                        }}
                    />
                </Card>
            </div>
        </div>
    );
}
