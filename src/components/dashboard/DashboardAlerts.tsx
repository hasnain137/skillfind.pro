'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { AlertCircle, Wallet, ShieldAlert } from 'lucide-react';

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
    // State 1: Qualification Required (for all professionals with services)
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

    // State 2: Identity Verification Required (only show if qualifications are OK or not needed)
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

    // Warning: Low Balance
    // Minimum requirement is typically ~2 EUR for a few leads, warning at < 5 EUR is good practice
    // Or match the exact logic: "can send offers" check usually requires just enough for one lead (~2 EUR)
    if (balance < 200) { // Assuming balance is in cents, so 200 = 2.00 EUR
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

    if (alerts.length === 0) return null;

    return (
        <div className="space-y-4">
            {alerts.map((alert) => (
                <div
                    key={alert.id}
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border p-4 ${alert.type === 'critical'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-amber-50 border-amber-200'
                        }`}
                >
                    <div className="flex items-start gap-4">
                        <div className={`mt-1 sm:mt-0 rounded-full p-2 ${alert.type === 'critical' ? 'bg-red-100' : 'bg-amber-100'
                            }`}>
                            {alert.icon}
                        </div>
                        <div>
                            <h3 className={`font-semibold ${alert.type === 'critical' ? 'text-red-900' : 'text-amber-900'
                                }`}>
                                {alert.title}
                            </h3>
                            <p className={`text-sm ${alert.type === 'critical' ? 'text-red-700' : 'text-amber-700'
                                }`}>
                                {alert.description}
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={alert.action.onClick}
                        variant={alert.type === 'critical' ? 'destructive' : 'outline'}
                        className={`w-full sm:w-auto shrink-0 ${alert.type === 'warning' ? 'border-amber-300 text-amber-800 hover:bg-amber-100' : ''
                            }`}
                    >
                        {alert.action.label}
                    </Button>
                </div>
            ))}
        </div>
    );
}
