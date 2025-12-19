'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useTranslations } from 'next-intl';

type OfferFormProps = {
    requestId: string;
    requestTitle: string;
};

export default function OfferForm({ requestId, requestTitle }: OfferFormProps) {
    const t = useTranslations('OfferForm');
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const [formData, setFormData] = useState({
        proposedPrice: '',
        pricingType: 'fixed', // 'hourly' | 'fixed'
        message: '',
        // Structured availability fields
        startType: 'asap', // 'asap', 'tomorrow', 'fewDays', 'specific'
        startDate: '',
        durationValue: '',
        durationUnit: 'days', // 'hours', 'days', 'weeks', 'months'
        // These will be computed from the above on submit
        estimatedDuration: '',
        availableTimeSlots: '',
    });

    // Field validation
    const getFieldError = (name: string): string => {
        switch (name) {
            case 'proposedPrice':
                if (!formData.proposedPrice) return t('validation.invalidPrice');
                if (parseFloat(formData.proposedPrice) < 1) return t('validation.minPrice');
                return '';
            case 'message':
                if (formData.message.length < 50) return t('validation.shortMessage');
                return '';
            case 'durationValue':
                if (formData.durationValue && parseFloat(formData.durationValue) <= 0) return 'Invalid duration';
                return '';
            case 'startDate':
                if (formData.startType === 'specific' && !formData.startDate) return 'Date required';
                return '';
            default:
                return '';
        }
    };

    const priceError = touched.proposedPrice ? getFieldError('proposedPrice') : '';
    const messageError = touched.message ? getFieldError('message') : '';

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Basic validation
        if (!formData.proposedPrice || isNaN(parseFloat(formData.proposedPrice))) {
            setError(t('validation.invalidPrice'));
            setLoading(false);
            return;
        }

        if (parseFloat(formData.proposedPrice) < 1) {
            setError(t('validation.minPrice'));
            setLoading(false);
            return;
        }

        if (formData.message.length < 50) {
            setError(t('validation.shortMessage'));
            setLoading(false);
            return;
        }

        // Format availability data
        let formattedAvailability = '';
        if (formData.startType === 'asap') formattedAvailability = '🚀 ASAP';
        else if (formData.startType === 'tomorrow') formattedAvailability = '📅 Tomorrow';
        else if (formData.startType === 'fewDays') formattedAvailability = '🕒 In a few days';
        else if (formData.startType === 'specific' && formData.startDate) {
            formattedAvailability = `🎯 ${new Date(formData.startDate).toLocaleDateString()}`;
        }

        let formattedDuration = '';
        if (formData.durationValue) {
            formattedDuration = `${formData.durationValue} ${t(`availability.durationUnits.${formData.durationUnit}`)}`;
        }

        try {
            const response = await fetch('/api/offers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    requestId,
                    proposedPrice: parseFloat(formData.proposedPrice),
                    message: formData.message,
                    estimatedDuration: formattedDuration || undefined,
                    availableTimeSlots: formattedAvailability || undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle structured validation errors
                if (data.error?.code === 'VALIDATION_ERROR' && data.error.details) {
                    const validationMessages = data.error.details
                        .map((d: any) => d.message)
                        .join('. ');
                    throw new Error(validationMessages);
                }

                throw new Error(data.message || data.error?.message || t('error.title'));
            }

            // Success! Show toast and redirect
            toast.success(t('success.title'), {
                description: t('success.desc'),
            });
            router.push('/pro/offers');
            router.refresh();
        } catch (err: any) {
            setError(err.message || t('error.generic'));
            toast.error(t('error.title'), {
                description: err.message,
            });
        } finally {
            setLoading(false);
        }
    }

    const priceLabel = formData.pricingType === 'hourly' ? t('pricing.hintHourly') : t('pricing.hintTotal');
    const isFormValid = formData.proposedPrice && parseFloat(formData.proposedPrice) >= 1 && formData.message.length >= 50;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <Card level={1} padding="lg" className="bg-red-50 border-red-200">
                    <p className="text-sm text-red-600 flex items-center gap-2">
                        <span>⚠️</span> {error}
                    </p>
                </Card>
            )}

            <Card padding="lg" className="space-y-6">
                <div>
                    <h2 className="text-base font-bold text-[#333333] flex items-center gap-2 mb-1">
                        <span>💰</span> {t('pricing.title')}
                    </h2>
                    <p className="text-xs text-[#7C7373]">{t('pricing.desc')}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-[#333333]">
                            {t('pricing.proposedPrice')} *
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-[#7C7373]">€</span>
                            <input
                                type="number"
                                required
                                min="1"
                                step="0.01"
                                value={formData.proposedPrice}
                                onChange={(e) => setFormData({ ...formData, proposedPrice: e.target.value })}
                                onBlur={() => setTouched(prev => ({ ...prev, proposedPrice: true }))}
                                className={`w-full rounded-xl border-2 pl-9 pr-4 py-3 text-base font-semibold text-[#333333] placeholder:text-[#B0B0B0] focus:outline-none focus:ring-4 transition-all ${priceError
                                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10 bg-red-50/30'
                                    : 'border-[#E5E7EB] focus:border-[#2563EB] focus:ring-[#2563EB]/10'
                                    }`}
                                placeholder="0.00"
                            />
                        </div>
                        {priceError ? (
                            <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                ⚠ {priceError}
                            </p>
                        ) : (
                            <p className="mt-1.5 text-xs text-[#7C7373] flex items-center gap-1">
                                💡 {t('pricing.hint', { type: priceLabel })}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-[#333333]">
                            {t('pricing.typeLabel')} *
                        </label>
                        <select
                            value={formData.pricingType}
                            onChange={(e) => setFormData({ ...formData, pricingType: e.target.value })}
                            className="w-full rounded-xl border-2 border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#333333] focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 transition-all"
                        >
                            <option value="fixed">{t('pricing.types.fixed')}</option>
                            <option value="hourly">{t('pricing.types.hourly')}</option>
                        </select>
                    </div>
                </div>
            </Card>

            <Card padding="lg" className="space-y-6">
                <div>
                    <h2 className="text-base font-bold text-[#333333] flex items-center gap-2 mb-1">
                        <span>✍️</span> {t('proposal.title')}
                    </h2>
                    <p className="text-xs text-[#7C7373]">{t('proposal.desc')}</p>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-[#333333]">
                        {t('proposal.messageLabel')} *
                    </label>
                    <textarea
                        required
                        rows={8}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        onBlur={() => setTouched(prev => ({ ...prev, message: true }))}
                        className={`w-full rounded-xl border-2 px-4 py-3 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:outline-none focus:ring-4 transition-all ${messageError
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10 bg-red-50/30'
                            : 'border-[#E5E7EB] focus:border-[#2563EB] focus:ring-[#2563EB]/10'
                            }`}
                        placeholder={t('proposal.messagePlaceholder')}
                    />
                    <div className="mt-2 flex items-center justify-between text-xs">
                        <p className={`font-medium ${formData.message.length >= 50 ? 'text-green-600' : messageError ? 'text-red-600' : 'text-[#7C7373]'}`}>
                            {formData.message.length >= 50 ? '✅' : messageError ? '⚠' : '⚠️'} {t('proposal.minChars', { count: formData.message.length })}
                        </p>
                        <p className="text-[#B0B0B0]">{t('proposal.chars', { count: formData.message.length })}</p>
                    </div>
                </div>
            </Card>

            <Card padding="lg" className="space-y-6">
                <div>
                    <h2 className="text-base font-bold text-[#333333] flex items-center gap-2 mb-1">
                        <span>📅</span> {t('availability.title')}
                    </h2>
                    <p className="text-xs text-[#7C7373]">{t('availability.desc')}</p>
                </div>

                <div className="space-y-6">
                    {/* Start Date Selection */}
                    <div>
                        <label className="mb-3 block text-sm font-semibold text-[#333333]">
                            {t('availability.startType.label')}
                        </label>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {(['asap', 'tomorrow', 'fewDays', 'specific'] as const).map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, startType: type })}
                                    className={`px-4 py-3 rounded-xl border-2 text-xs font-semibold transition-all ${formData.startType === type
                                        ? 'border-[#2563EB] bg-blue-50 text-[#2563EB] shadow-sm'
                                        : 'border-[#E5E7EB] text-[#7C7373] hover:border-[#D1D5DB] hover:bg-gray-50'
                                        }`}
                                >
                                    {t(`availability.startType.${type}`)}
                                </button>
                            ))}
                        </div>

                        {formData.startType === 'specific' && (
                            <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                <input
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full rounded-xl border-2 border-[#E5E7EB] px-4 py-2.5 text-sm text-[#333333] focus:border-[#2563EB] focus:outline-none transition-all"
                                />
                            </div>
                        )}
                    </div>

                    {/* Duration Selection */}
                    <div className="pt-2">
                        <label className="mb-2 block text-sm font-semibold text-[#333333]">
                            {t('availability.duration')}
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="number"
                                min="0.5"
                                step="0.5"
                                value={formData.durationValue}
                                onChange={(e) => setFormData({ ...formData, durationValue: e.target.value })}
                                className="flex-1 rounded-xl border-2 border-[#E5E7EB] px-4 py-3 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none transition-all"
                                placeholder="0"
                            />
                            <select
                                value={formData.durationUnit}
                                onChange={(e) => setFormData({ ...formData, durationUnit: e.target.value })}
                                className="w-32 lg:w-40 rounded-xl border-2 border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#333333] focus:border-[#2563EB] focus:outline-none transition-all"
                            >
                                <option value="hours">{t('availability.durationUnits.hours')}</option>
                                <option value="days">{t('availability.durationUnits.days')}</option>
                                <option value="weeks">{t('availability.durationUnits.weeks')}</option>
                                <option value="months">{t('availability.durationUnits.months')}</option>
                            </select>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Tips Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200" padding="lg">
                <h3 className="text-sm font-bold text-[#333333] flex items-center gap-2 mb-3">
                    <span>💡</span> {t('tips.title')}
                </h3>
                <div className="grid gap-2 text-xs text-[#7C7373]">
                    <p>• {t('tips.items.specific')}</p>
                    <p>• {t('tips.items.needs')}</p>
                    <p>• {t('tips.items.approach')}</p>
                    <p>• {t('tips.items.expectations')}</p>
                </div>
            </Card>

            {/* Submit Section */}
            <Card padding="lg" className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🚀</span>
                    <p className="text-sm text-[#7C7373]">
                        {t('actions.ready')}
                    </p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.back()}
                        className="flex-1 sm:flex-none border border-[#E5E7EB] hover:bg-gray-100"
                    >
                        {t('actions.cancel')}
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading || !isFormValid}
                        className="flex-1 sm:flex-none shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? t('actions.sending') : t('actions.send')}
                    </Button>
                </div>
            </Card>

            <p className="text-xs text-center text-[#B0B0B0]">
                {t('actions.legal')}
            </p>
        </form>
    );
}

