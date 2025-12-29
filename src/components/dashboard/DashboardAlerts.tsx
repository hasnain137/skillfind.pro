'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { AlertCircle, Wallet, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface DashboardAlertsProps {
    isVerified: boolean;
    qualificationVerified: boolean;
    hasServices: boolean;
    balance: number;
    currency?: string;
}

export function DashboardAlerts({
    isVerified,
    qualificationVerified,
    hasServices,
    balance,
    currency = 'EUR'
}: DashboardAlertsProps) {
    const t = useTranslations('ProDashboard.Alerts');
    const router = useRouter();

    const alerts = [];

    // SEQUENTIAL VERIFICATION LOGIC
    // Step 1: Qualification Required (for all professionals with services)
    if (hasServices && !qualificationVerified) {
        alerts.push({
            id: 'qualification',
            type: 'critical',
            icon: <AlertCircle className="h-5 w-5 text-red-600" />,
            title: t('qualificationRequired.title'),
            description: t('qualificationRequired.description'),
            action: {
                label: t('qualificationRequired.action'),
                onClick: () => router.push('/pro/profile?activeTab=qualifications')
            }
        });
    }

    // Step 2: Identity Verification Required (only show if qualifications are OK)
    if (qualificationVerified && !isVerified) {
        alerts.push({
            id: 'verification',
            type: 'critical',
            icon: <ShieldAlert className="h-5 w-5 text-red-600" />,
            title: t('verificationRequired.title'),
            description: t('verificationRequired.description'),
            action: {
                label: t('verificationRequired.action'),
                onClick: () => router.push('/pro/profile?activeTab=verification')
            }
        });
    }

    // Step 3: Minimum Balance Warning
    if (balance < 200) { // 200 cents = €2.00
        alerts.push({
            id: 'balance',
            type: 'warning',
            icon: <Wallet className="h-5 w-5 text-amber-600" />,
            title: t('lowBalance.title'),
            description: t('lowBalance.description', {
                amount: new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(balance / 100)
            }),
            action: {
                label: t('lowBalance.action'),
                onClick: () => router.push('/pro/wallet')
            }
        });
    }

    // Show completed checkmarks for completed steps
    const completedSteps = [];
    if (hasServices && qualificationVerified) {
        completedSteps.push({
            id: 'qualification-complete',
            title: t('qualificationRequired.title')
        });
    }
    if (isVerified) {
        completedSteps.push({
            id: 'verification-complete',
            title: t('verificationRequired.title')
        });
    }
    if (balance >= 200) {
        completedSteps.push({
            id: 'balance-complete',
            title: t('lowBalance.title')
        });
    }

    // Don't show section if everything is complete
    if (alerts.length === 0 && completedSteps.length === 0) return null;

    return (
        <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-xl p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
                <div className="mt-1">
                    <AlertCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#333333]">{t('requirementsTitle')}</h3>
                    <p className="text-sm text-[#7C7373] mt-1">{t('requirementsDescription')}</p>
                </div>
            </div>

            {/* Completed Steps */}
            {completedSteps.length > 0 && (
                <div className="space-y-2">
                    {completedSteps.map((step) => (
                        <div
                            key={step.id}
                            className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                        >
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                            <span className="text-sm font-medium text-green-800">{step.title}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Pending Requirements */}
            {alerts.length > 0 && (
                <div className="space-y-3">
                    {alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border p-4 ${alert.type === 'critical'
                                ? 'bg-red-50 border-red-200'
                                : 'bg-amber-50 border-amber-200'
                                }`}
                        >
                            <div className="flex items-start gap-4 flex-1">
                                <div className={`mt-1 sm:mt-0 rounded-full p-2 ${alert.type === 'critical' ? 'bg-red-100' : 'bg-amber-100'
                                    }`}>
                                    {alert.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-semibold ${alert.type === 'critical' ? 'text-red-900' : 'text-amber-900'
                                        }`}>
                                        {alert.title}
                                    </h3>
                                    <p className={`text-sm mt-1 ${alert.type === 'critical' ? 'text-red-700' : 'text-amber-700'
                                        }`}>
                                        {alert.description}
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={alert.action.onClick}
                                variant={alert.type === 'critical' ? 'default' : 'secondary'}
                                size="sm"
                                className="whitespace-nowrap"
                            >
                                {alert.action.label}
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
