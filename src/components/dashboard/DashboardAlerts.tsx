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
            },
            completed: false
        });
    }

    // Step 2: Identity Verification Required (only show if qualifications are OK or not needed)
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
            },
            completed: false
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
            },
            completed: false
        });
    }

    // Show completed checkmarks for completed steps
    const completedSteps = [];
    if (hasServices && qualificationVerified) {
        completedSteps.push({
            id: 'qualification-complete',
            title: t('qualificationRequired.title'),
            completed: true
        });
    }
    if (isVerified) {
        completedSteps.push({
            id: 'verification-complete',
            title: t('verificationRequired.title'),
            completed: true
        });
    }
    if (balance >= 200) {
        completedSteps.push({
            id: 'balance-complete',
            title: t('lowBalance.title'),
            completed: true
        });
    }

    // Don't show section if everything is complete
    if (alerts.length === 0 && completedSteps.length === 0) return null;

    return (
                    >
        { alert.action.label }
                    </Button >
                </div >
            ))
}
        </div >
    );
}
