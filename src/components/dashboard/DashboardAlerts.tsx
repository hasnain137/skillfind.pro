'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import {
    Briefcase,
    FileCheck,
    ShieldCheck,
    Wallet,
    CheckCircle2,
    Clock,
    Lock,
    ChevronRight,
    Rocket
} from 'lucide-react';

interface Document {
    id: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface DashboardAlertsProps {
    isVerified: boolean;
    qualificationVerified: boolean;
    hasServices: boolean;
    balance: number;
    currency?: string;
    documents?: Document[];
}

type StepStatus = 'complete' | 'current' | 'pending' | 'locked';

interface Step {
    id: string;
    title: string;
    description: string;
    status: StepStatus;
    action?: {
        label: string;
        href: string;
    };
}

export function DashboardAlerts({
    isVerified,
    qualificationVerified,
    hasServices,
    balance,
    currency = 'EUR',
    documents = []
}: DashboardAlertsProps) {
    const t = useTranslations('ProDashboard.Alerts');
    const router = useRouter();

    // Determine document status
    const hasPendingDocs = documents.some(d => d.status === 'PENDING');
    const hasRejectedDocs = documents.some(d => d.status === 'REJECTED');
    const hasUploadedDocs = documents.length > 0;

    // Calculate minimum balance requirement
    const minBalance = 200; // €2.00 in cents
    const hasMinBalance = balance >= minBalance;

    // Build steps array
    const steps: Step[] = [];

    // Step 1: Add Services
    const servicesStatus: StepStatus = hasServices ? 'complete' : 'current';
    steps.push({
        id: 'services',
        title: t('servicesRequired.title'),
        description: hasServices
            ? t('steps.servicesComplete')
            : t('servicesRequired.description'),
        status: servicesStatus,
        action: !hasServices ? {
            label: t('servicesRequired.action'),
            href: '/pro/profile?activeTab=services'
        } : undefined
    });

    // Step 2: Upload & Verify Qualifications
    let qualificationStatus: StepStatus;
    let qualificationDesc: string;

    if (!hasServices) {
        qualificationStatus = 'locked';
        qualificationDesc = t('steps.lockedStep');
    } else if (qualificationVerified) {
        qualificationStatus = 'complete';
        qualificationDesc = t('steps.qualificationsComplete');
    } else if (hasPendingDocs) {
        qualificationStatus = 'pending';
        qualificationDesc = t('steps.qualificationsPending');
    } else if (hasRejectedDocs) {
        qualificationStatus = 'current';
        qualificationDesc = t('steps.qualificationsRejected');
    } else {
        qualificationStatus = 'current';
        qualificationDesc = t('qualificationRequired.description');
    }

    steps.push({
        id: 'qualifications',
        title: t('qualificationRequired.title'),
        description: qualificationDesc,
        status: qualificationStatus,
        action: (qualificationStatus === 'current') ? {
            label: hasRejectedDocs ? t('steps.reuploadAction') : t('qualificationRequired.action'),
            href: '/pro/profile?activeTab=qualifications'
        } : undefined
    });

    // Step 3: Identity Verification
    let verificationStatus: StepStatus;
    let verificationDesc: string;

    if (!qualificationVerified) {
        verificationStatus = 'locked';
        verificationDesc = t('steps.lockedStep');
    } else if (isVerified) {
        verificationStatus = 'complete';
        verificationDesc = t('steps.verificationComplete');
    } else {
        verificationStatus = 'current';
        verificationDesc = t('verificationRequired.description');
    }

    steps.push({
        id: 'verification',
        title: t('verificationRequired.title'),
        description: verificationDesc,
        status: verificationStatus,
        action: (verificationStatus === 'current') ? {
            label: t('verificationRequired.action'),
            href: '/pro/profile?activeTab=verification'
        } : undefined
    });

    // Step 4: Fund Wallet
    let walletStatus: StepStatus;
    let walletDesc: string;

    if (!isVerified) {
        walletStatus = 'locked';
        walletDesc = t('steps.lockedStep');
    } else if (hasMinBalance) {
        walletStatus = 'complete';
        walletDesc = t('steps.walletComplete', {
            amount: new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(balance / 100)
        });
    } else {
        walletStatus = 'current';
        walletDesc = t('lowBalance.description', {
            amount: new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(balance / 100)
        });
    }

    steps.push({
        id: 'wallet',
        title: t('lowBalance.title'),
        description: walletDesc,
        status: walletStatus,
        action: (walletStatus === 'current') ? {
            label: t('lowBalance.action'),
            href: '/pro/wallet'
        } : undefined
    });

    // Check if all steps complete
    const allComplete = steps.every(s => s.status === 'complete');
    const completedCount = steps.filter(s => s.status === 'complete').length;

    // If all complete, show success state
    if (allComplete) {
        return (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 p-3 bg-green-100 rounded-full">
                        <Rocket className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-green-800">{t('readyToSendOffers')}</h3>
                        <p className="text-sm text-green-700 mt-1">{t('readyDescription')}</p>
                    </div>
                    <Button
                        onClick={() => router.push('/pro/requests')}
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {t('browseRequests')} <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    }

    // Render progress stepper
    return (
        <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-2xl p-6 space-y-6">
            {/* Header with Progress */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-[#333333]">{t('requirementsTitle')}</h3>
                    <p className="text-sm text-[#7C7373] mt-1">{t('requirementsDescription')}</p>
                </div>
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200">
                    <span className="text-sm font-semibold text-[#333333]">{completedCount}/{steps.length}</span>
                    <span className="text-xs text-[#7C7373]">{t('stepsComplete')}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(completedCount / steps.length) * 100}%` }}
                />
            </div>

            {/* Steps */}
            <div className="space-y-3">
                {steps.map((step, index) => (
                    <div
                        key={step.id}
                        className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${step.status === 'complete'
                                ? 'bg-green-50 border-green-200'
                                : step.status === 'pending'
                                    ? 'bg-amber-50 border-amber-200'
                                    : step.status === 'current'
                                        ? 'bg-white border-blue-300 shadow-sm'
                                        : 'bg-gray-50 border-gray-200 opacity-60'
                            }`}
                    >
                        {/* Step Icon */}
                        <div className={`flex-shrink-0 p-2 rounded-full ${step.status === 'complete'
                                ? 'bg-green-100'
                                : step.status === 'pending'
                                    ? 'bg-amber-100'
                                    : step.status === 'current'
                                        ? 'bg-blue-100'
                                        : 'bg-gray-100'
                            }`}>
                            {step.status === 'complete' ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : step.status === 'pending' ? (
                                <Clock className="h-5 w-5 text-amber-600 animate-pulse" />
                            ) : step.status === 'locked' ? (
                                <Lock className="h-5 w-5 text-gray-400" />
                            ) : (
                                index === 0 ? <Briefcase className="h-5 w-5 text-blue-600" /> :
                                    index === 1 ? <FileCheck className="h-5 w-5 text-blue-600" /> :
                                        index === 2 ? <ShieldCheck className="h-5 w-5 text-blue-600" /> :
                                            <Wallet className="h-5 w-5 text-blue-600" />
                            )}
                        </div>

                        {/* Step Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h4 className={`font-semibold ${step.status === 'complete' ? 'text-green-800' :
                                        step.status === 'pending' ? 'text-amber-800' :
                                            step.status === 'locked' ? 'text-gray-500' :
                                                'text-[#333333]'
                                    }`}>
                                    {step.title}
                                </h4>
                                {step.status === 'pending' && (
                                    <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                        {t('steps.underReview')}
                                    </span>
                                )}
                            </div>
                            <p className={`text-sm mt-1 ${step.status === 'locked' ? 'text-gray-400' : 'text-[#7C7373]'
                                }`}>
                                {step.description}
                            </p>
                        </div>

                        {/* Action Button */}
                        {step.action && (
                            <Button
                                onClick={() => router.push(step.action!.href)}
                                variant="default"
                                size="sm"
                                className="flex-shrink-0"
                            >
                                {step.action.label}
                            </Button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
