'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useTranslations } from 'next-intl';

type OfferFormProps = {
    requestId: string;
    requestTitle: string;
    clientName: string;
    requestDetails: {
        budgetMin: number | null;
        budgetMax: number | null;
        description: string | null;
        city: string | null;
        locationType: string;
        createdAt: Date;
        categoryName: string;
    };
};

export default function OfferForm({ requestId, requestTitle, clientName, requestDetails }: OfferFormProps) {
    const t = useTranslations('OfferForm');
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // ... existing state ...
    const [formData, setFormData] = useState({
        proposedPrice: '',
        pricingType: 'fixed',
        message: '',
        startType: 'asap',
        startDate: '',
        durationValue: '',
        durationUnit: 'days',
        estimatedDuration: '',
        availableTimeSlots: '',
    });

    // ... existing validation ...
    const getFieldError = (name: string): string => {
        switch (name) {
            case 'proposedPrice':
                if (!formData.proposedPrice) return t('validation.invalidPrice');
                if (parseFloat(formData.proposedPrice) < 1) return t('validation.minPrice');
                return '';
            case 'message':
                if (formData.message.length < 50) return t('validation.shortMessage');
                return '';
            // ...
            default: return '';
        }
    };

    const priceError = touched.proposedPrice ? getFieldError('proposedPrice') : '';
    const messageError = touched.message ? getFieldError('message') : '';

    // ... handleSubmit ...
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // preparing the payload
            const payload = {
                requestId,
                proposedPrice: parseFloat(formData.proposedPrice),
                message: formData.message,
                estimatedDuration: `${formData.durationValue} ${formData.durationUnit}`,
                availableTimeSlots: formData.startType === 'specific'
                    ? `Starting from ${formData.startDate}`
                    : t(`availability.startType.${formData.startType}` as any)
            };

            const response = await fetch('/api/offers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                // Parse standardized API error structure
                const errorMessage = data.error?.message || data.error || data.message || t('error.generic');
                throw new Error(errorMessage);
            }

            toast.success(t('success.title'), {
                description: t('success.desc')
            });

            // Redirect to dashboard or offers list
            router.push('/pro');
            router.refresh();

        } catch (err: any) {
            console.error('Error submitting offer:', err);
            setError(err.message || t('error.generic'));
            toast.error(t('error.title'), {
                description: err.message || t('error.generic')
            });
        } finally {
            setLoading(false);
        }
    }

    // Actually, I'll split this. First update props.
    // Then update return.

    // But I can't split easily if I change the component signature in one go.
    // I will use replace_file_content on the top part.

    const priceLabel = formData.pricingType === 'hourly' ? t('pricing.hintHourly') : t('pricing.hintTotal');
    const isFormValid = formData.proposedPrice && parseFloat(formData.proposedPrice) >= 1 && formData.message.length >= 50;

    return (
        <div className="grid md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-2 space-y-4">
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
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-[#333333]">
                                    {t('proposal.messageLabel')} *
                                </label>
                                <select
                                    onChange={(e) => {
                                        if (!e.target.value) return;
                                        const template = t(`proposal.templates.${e.target.value}.text` as any)
                                            .replace('{name}', clientName)
                                            .replace('{category}', requestDetails.categoryName)
                                            .replace('{availability}', formData.startType === 'specific' ? formData.startDate || 'soon' : t(`availability.startType.${formData.startType}` as any));

                                        setFormData(prev => ({ ...prev, message: template }));
                                        setTouched(prev => ({ ...prev, message: true }));
                                        e.target.value = ''; // Reset select
                                    }}
                                    className="text-xs border-none bg-blue-50 text-blue-600 font-medium rounded-lg px-2 py-1 cursor-pointer hover:bg-blue-100 focus:outline-none"
                                >
                                    <option value="">{t('proposal.templates.label')}</option>
                                    <option value="quick">{t('proposal.templates.quick.label')}</option>
                                    <option value="detailed">{t('proposal.templates.detailed.label')}</option>
                                    <option value="questions">{t('proposal.templates.questions.label')}</option>
                                </select>
                            </div>
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
            </div>

            {/* Request Summary Sidebar */}
            <div className="space-y-6">
                <Card padding="lg" className="bg-gradient-to-br from-gray-50 to-white sticky top-24">
                    <h3 className="text-sm font-bold text-[#333333] mb-4 flex items-center gap-2">
                        <span>📋</span> {t('summary.title')}
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-[#7C7373] mb-1">{requestTitle}</p>
                            <div className="flex items-center gap-2 text-sm font-medium text-[#333333]">
                                <span className="p-1 bg-blue-100 text-blue-700 rounded text-xs">{requestDetails.categoryName}</span>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-gray-100">
                            <p className="text-xs text-[#7C7373] mb-1">{t('summary.budget')}</p>
                            <p className="text-sm font-bold text-[#2563EB]">
                                {requestDetails.budgetMin ? `€${requestDetails.budgetMin}` : ''}
                                {requestDetails.budgetMin && requestDetails.budgetMax ? ' - ' : ''}
                                {requestDetails.budgetMax ? `€${requestDetails.budgetMax}` : ''}
                                {!requestDetails.budgetMin && !requestDetails.budgetMax ? 'TBD' : ''}
                            </p>
                        </div>

                        <div className="pt-3 border-t border-gray-100">
                            <p className="text-xs text-[#7C7373] mb-1">{t('summary.location')}</p>
                            <p className="text-sm text-[#333333]">
                                {requestDetails.city ? `📍 ${requestDetails.city}` : (requestDetails.locationType === 'REMOTE' ? '💻 Remote' : '📍 On-site')}
                            </p>
                        </div>

                        <div className="pt-3 border-t border-gray-100">
                            <p className="text-xs text-[#7C7373] mb-1">{t('summary.posted', { date: new Date(requestDetails.createdAt).toLocaleDateString() })}</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

