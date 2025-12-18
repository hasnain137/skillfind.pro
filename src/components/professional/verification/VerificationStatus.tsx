'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { ProfessionalStatus } from '@prisma/client';
import { useTranslations } from 'next-intl';

interface VerificationStatusProps {
    status: ProfessionalStatus;
}

export function VerificationStatus({ status }: VerificationStatusProps) {
    const t = useTranslations('Verification.status');

    if (status === 'ACTIVE') {
        return (
            <Card className="bg-green-50 border-green-200" padding="lg">
                <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-2 rounded-full text-green-600">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-green-900">{t('active.title')}</h3>
                            <Badge className="bg-green-200 text-green-800 hover:bg-green-300">{t('active.badge')}</Badge>
                        </div>
                        <p className="text-green-700 mt-1">
                            {t('active.desc')}
                        </p>
                    </div>
                </div>
            </Card>
        );
    }

    if (status === 'PENDING_REVIEW') {
        return (
            <Card className="bg-yellow-50 border-yellow-200" padding="lg">
                <div className="flex items-start gap-4">
                    <div className="bg-yellow-100 p-2 rounded-full text-yellow-600">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-yellow-900">{t('pending.title')}</h3>
                        <p className="text-yellow-700 mt-1">
                            {t('pending.desc')}
                        </p>
                    </div>
                </div>
            </Card>
        );
    }

    if (status === 'SUSPENDED') {
        return (
            <Card className="bg-yellow-50 border-yellow-200" padding="lg">
                <div className="flex items-start gap-4">
                    <div className="bg-yellow-100 p-2 rounded-full text-yellow-600">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-yellow-900">{t('rejected.title')}</h3>
                        <p className="text-yellow-700 mt-1">
                            {t('rejected.desc')}
                        </p>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="bg-gray-50 border-gray-200" padding="lg">
            <div className="flex items-start gap-4">
                <div className="bg-gray-200 p-2 rounded-full text-gray-500">
                    <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">{t('notVerified.title')}</h3>
                    <p className="text-gray-600 mt-1">
                        {t('notVerified.desc')}
                    </p>
                </div>
            </div>
        </Card>
    );
}
