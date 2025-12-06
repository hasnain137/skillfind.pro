'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

type OfferFormProps = {
    requestId: string;
    requestTitle: string;
};

export default function OfferForm({ requestId, requestTitle }: OfferFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        proposedPrice: '',
        pricingType: 'fixed', // 'hourly' | 'fixed'
        message: '',
        estimatedDuration: '',
        availableTimeSlots: '',
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Basic validation
        if (!formData.proposedPrice || isNaN(parseFloat(formData.proposedPrice))) {
            setError('Please enter a valid price');
            setLoading(false);
            return;
        }

        if (parseFloat(formData.proposedPrice) < 1) {
            setError('Price must be at least €1');
            setLoading(false);
            return;
        }

        if (formData.message.length < 50) {
            setError('Please provide a more detailed message (at least 50 characters)');
            setLoading(false);
            return;
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
                    estimatedDuration: formData.estimatedDuration,
                    availableTimeSlots: formData.availableTimeSlots || undefined,
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

                throw new Error(data.message || data.error?.message || 'Failed to send offer');
            }

            // Success! Show toast and redirect
            toast.success('Offer sent successfully!', {
                description: 'The client will be notified of your offer.',
            });
            router.push('/pro/offers');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'An error occurred. Please try again.');
            toast.error('Failed to send offer', {
                description: err.message,
            });
        } finally {
            setLoading(false);
        }
    }

    const priceLabel = formData.pricingType === 'hourly' ? 'per hour' : 'total';
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
                        <span>💰</span> Pricing
                    </h2>
                    <p className="text-xs text-[#7C7373]">Set your price and payment terms</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-[#333333]">
                            Proposed price (€) *
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
                                className="w-full rounded-xl border-2 border-[#E5E7EB] pl-9 pr-4 py-3 text-base font-semibold text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 transition-all"
                                placeholder="0.00"
                            />
                        </div>
                        <p className="mt-1.5 text-xs text-[#7C7373] flex items-center gap-1">
                            💡 The amount you'll receive {priceLabel}
                        </p>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-[#333333]">
                            Pricing type *
                        </label>
                        <select
                            value={formData.pricingType}
                            onChange={(e) => setFormData({ ...formData, pricingType: e.target.value })}
                            className="w-full rounded-xl border-2 border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#333333] focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 transition-all"
                        >
                            <option value="fixed">💼 Fixed Price - One-time payment</option>
                            <option value="hourly">⏱️ Hourly Rate - Per hour of work</option>
                        </select>
                    </div>
                </div>
            </Card>

            <Card padding="lg" className="space-y-6">
                <div>
                    <h2 className="text-base font-bold text-[#333333] flex items-center gap-2 mb-1">
                        <span>✍️</span> Your Proposal
                    </h2>
                    <p className="text-xs text-[#7C7373]">Tell the client why you're the right fit</p>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-[#333333]">
                        Message to client *
                    </label>
                    <textarea
                        required
                        rows={8}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full rounded-xl border-2 border-[#E5E7EB] px-4 py-3 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 transition-all"
                        placeholder="Share your experience and explain how you can help with this request...&#10;&#10;• Why are you a good fit?&#10;• What's your relevant experience?&#10;• How will you approach this project?&#10;• What can the client expect from you?"
                    />
                    <div className="mt-2 flex items-center justify-between text-xs">
                        <p className={`font-medium ${formData.message.length >= 50 ? 'text-green-600' : 'text-[#7C7373]'}`}>
                            {formData.message.length >= 50 ? '✅' : '⚠️'} {formData.message.length}/50 characters minimum
                        </p>
                        <p className="text-[#B0B0B0]">{formData.message.length} characters</p>
                    </div>
                </div>
            </Card>

            <Card padding="lg" className="space-y-6">
                <div>
                    <h2 className="text-base font-bold text-[#333333] flex items-center gap-2 mb-1">
                        <span>📅</span> Availability
                    </h2>
                    <p className="text-xs text-[#7C7373]">Help the client plan ahead (optional)</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-[#333333]">
                            Earliest availability
                        </label>
                        <input
                            type="text"
                            value={formData.availableTimeSlots}
                            onChange={(e) => setFormData({ ...formData, availableTimeSlots: e.target.value })}
                            className="w-full rounded-xl border-2 border-[#E5E7EB] px-4 py-3 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 transition-all"
                            placeholder="e.g. Available from Monday"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-[#333333]">
                            Estimated duration
                        </label>
                        <input
                            type="text"
                            value={formData.estimatedDuration}
                            onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                            className="w-full rounded-xl border-2 border-[#E5E7EB] px-4 py-3 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 transition-all"
                            placeholder="e.g. 2-3 weeks"
                        />
                    </div>
                </div>
            </Card>

            {/* Tips Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200" padding="lg">
                <h3 className="text-sm font-bold text-[#333333] flex items-center gap-2 mb-3">
                    <span>💡</span> Tips for a Great Offer
                </h3>
                <div className="grid gap-2 text-xs text-[#7C7373]">
                    <p>• Be specific about your relevant experience and skills</p>
                    <p>• Show that you understand the client's needs</p>
                    <p>• Explain your approach to solving their problem</p>
                    <p>• Set realistic expectations for timeline and deliverables</p>
                </div>
            </Card>

            {/* Submit Section */}
            <Card padding="lg" className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🚀</span>
                    <p className="text-sm text-[#7C7373]">
                        Ready to send your offer?
                    </p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.back()}
                        className="flex-1 sm:flex-none border border-[#E5E7EB] hover:bg-gray-100"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading || !isFormValid}
                        className="flex-1 sm:flex-none shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? '⏳ Sending...' : '✉️ Send Offer'}
                    </Button>
                </div>
            </Card>

            <p className="text-xs text-center text-[#B0B0B0]">
                By sending an offer, you agree to our terms of service and privacy policy.
            </p>
        </form>
    );
}
