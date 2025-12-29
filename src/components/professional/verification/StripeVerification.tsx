'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';

interface StripeVerificationProps {
    isVerified: boolean;
    verificationMethod?: string;
}

export function StripeVerification({ isVerified, verificationMethod }: StripeVerificationProps) {
    const t = useTranslations('ProProfile.tabs.identity');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleVerification = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/verification/create-session', {
                method: 'POST',
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.error?.message || data.message || 'Failed to start verification';
                const error = new Error(errorMessage);
                (error as any).code = data.error?.code;
                throw error;
            }

            if (data.data?.url) {
                window.location.href = data.data.url;
            } else {
                throw new Error('No verification URL returned');
            }
        } catch (err: any) {
            // Check for specific error code or message
            if (
                err.code === 'ALREADY_VERIFIED' ||
                err.message === 'Professional is already verified.' ||
                err.message === 'Professional is already verified'
            ) {
                // If backend says verified but frontend didn't know yet, refresh to update state
                router.refresh();
                return;
            }
            setError(err.message);
            setLoading(false);
        }
    };

    if (isVerified) {
        return (
            <Card padding="lg" className="border-green-200 bg-green-50">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl">
                        ✅
                    </div>
                    <div>
                        <h3 className="font-semibold text-green-900">{t('verified')}</h3>
                        <p className="text-sm text-green-700">
                            {verificationMethod === 'STRIPE_IDENTITY'
                                ? 'Verified via Stripe Identity'
                                : 'Identity verified successfully'}
                        </p>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card padding="lg" className="border-[#2563EB] bg-blue-50/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="font-semibold text-[#333333] flex items-center gap-2">
                        {t('title')}
                        <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Recommended</Badge>
                    </h3>
                    <p className="text-sm text-[#4B5563]">
                        {t('description')}
                    </p>
                    <p className="text-xs text-[#7C7373] mt-1">
                        🔒 {t('secureNote')}
                    </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <Button
                        onClick={handleVerification}
                        disabled={loading}
                        className="w-full md:w-auto bg-[#635BFF] hover:bg-[#534be0] text-white" // Stripe blurple-ish
                    >
                        {loading ? 'Redirecting...' : t('button')}
                    </Button>
                    {error && <p className="text-xs text-red-600">{error}</p>}
                </div>
            </div>
        </Card>
    );
}
