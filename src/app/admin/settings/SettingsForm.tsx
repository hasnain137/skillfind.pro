'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface SettingsFormProps {
    initialSettings: {
        clickFee: number;
        minimumWalletBalance: number;
        maxOffersPerRequest: number;
        phoneVerificationEnabled: boolean;
    };
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(initialSettings);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Failed to update settings');

            alert('Settings updated successfully');
            router.refresh();
        } catch (error) {
            alert('Error updating settings');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-[#333333] mb-1">
                        Click Fee (cents)
                    </label>
                    <p className="text-xs text-[#7C7373] mb-2">
                        Amount deducted from professional wallet when profile is viewed.
                    </p>
                    <input
                        type="number"
                        min="0"
                        value={formData.clickFee}
                        onChange={(e) => setFormData({ ...formData, clickFee: Number(e.target.value) })}
                        className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#333333] mb-1">
                        Minimum Wallet Balance (cents)
                    </label>
                    <p className="text-xs text-[#7C7373] mb-2">
                        Minimum balance required to send offers.
                    </p>
                    <input
                        type="number"
                        min="0"
                        value={formData.minimumWalletBalance}
                        onChange={(e) => setFormData({ ...formData, minimumWalletBalance: Number(e.target.value) })}
                        className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#333333] mb-1">
                        Max Offers Per Request
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={formData.maxOffersPerRequest}
                        onChange={(e) => setFormData({ ...formData, maxOffersPerRequest: Number(e.target.value) })}
                        className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="phoneVerification"
                        checked={formData.phoneVerificationEnabled}
                        onChange={(e) => setFormData({ ...formData, phoneVerificationEnabled: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="phoneVerification" className="text-sm font-medium text-[#333333]">
                        Enable Phone Verification Requirement
                    </label>
                </div>
            </div>

            <div className="pt-4 border-t border-[#E5E7EB]">
                <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form>
    );
}
