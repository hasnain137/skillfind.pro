'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
        pricingType: 'hourly', // 'hourly' | 'fixed'
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
                    availableTimeSlots: formData.availableTimeSlots ? [formData.availableTimeSlots] : [],
                    // Note: pricingType isn't in the schema yet, assuming hourly for now or handled in message
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send offer');
            }

            // Success! Redirect to requests list
            router.push('/pro/requests');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card padding="lg" className="space-y-4">
                <h2 className="text-sm font-semibold text-[#333333]">Offer details</h2>

                {error && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <div className="grid gap-3 md:grid-cols-2">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
                            Proposed price (€) *
                        </label>
                        <input
                            type="number"
                            required
                            min="1"
                            step="0.01"
                            value={formData.proposedPrice}
                            onChange={(e) => setFormData({ ...formData, proposedPrice: e.target.value })}
                            className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
                            placeholder="e.g. 35"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
                            Pricing type
                        </label>
                        <select
                            value={formData.pricingType}
                            onChange={(e) => setFormData({ ...formData, pricingType: e.target.value })}
                            className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#333333] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
                        >
                            <option value="hourly">Hourly Rate</option>
                            <option value="fixed">Fixed Price</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
                        Message to client *
                    </label>
                    <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
                        placeholder="Introduce yourself, explain how you can help, and mention any relevant experience. (Min 50 chars)"
                    />
                    <p className="mt-1 text-xs text-[#7C7373]">
                        {formData.message.length}/50 characters minimum
                    </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
                            Earliest availability (optional)
                        </label>
                        <input
                            type="text"
                            value={formData.availableTimeSlots}
                            onChange={(e) => setFormData({ ...formData, availableTimeSlots: e.target.value })}
                            className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
                            placeholder="e.g. Next Monday evening"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
                            Estimated duration (optional)
                        </label>
                        <input
                            type="text"
                            value={formData.estimatedDuration}
                            onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                            className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
                            placeholder="e.g. 6 sessions over 3 weeks"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                        {loading ? 'Sending Offer...' : 'Send Offer'}
                    </Button>
                    <p className="mt-2 text-xs text-[#7C7373]">
                        By sending an offer, you agree to our terms of service.
                    </p>
                </div>
            </Card>
        </form>
    );
}
