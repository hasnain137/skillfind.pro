'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FileText, Target, DollarSign, Settings } from 'lucide-react';

interface Category {
    id: string;
    nameEn: string;
}

interface AdCampaignFormProps {
    categories: Category[];
    initialData?: any;
    isEditing?: boolean;
}

export function AdCampaignForm({ categories, initialData, isEditing }: AdCampaignFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        imageUrl: initialData?.imageUrl || '',
        linkUrl: initialData?.linkUrl || '',
        categoryId: initialData?.categoryId || '',
        targetCity: initialData?.targetCity || '',
        targetCountry: initialData?.targetCountry || 'FR',
        budgetCents: initialData?.budgetCents || 1000,
        costPerClick: initialData?.costPerClick || 10,
        startDate: initialData?.startDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        endDate: initialData?.endDate?.split('T')[0] || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: initialData?.status || 'DRAFT',
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const url = isEditing
                ? `/api/admin/ads/${initialData.id}`
                : '/api/admin/ads';
            const method = isEditing ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    categoryId: formData.categoryId || null,
                }),
            });

            const json = await res.json();
            if (!json.success) {
                throw new Error(json.message || 'Failed to save');
            }

            router.push('/admin/ads');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>
            )}

            <Card padding="lg">
                <h3 className="text-lg font-bold text-[#333333] mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Campaign Details
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-[#333333] mb-1">Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-[#333333] mb-1">Description</label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#333333] mb-1">Image URL</label>
                        <input
                            type="url"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com/ad-image.jpg"
                        />
                        {formData.imageUrl && (
                            <div className="mt-2 rounded-lg overflow-hidden border border-[#E5E7EB] bg-gray-50">
                                <img
                                    src={formData.imageUrl}
                                    alt="Ad preview"
                                    className="w-full h-32 object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#333333] mb-1">Link URL</label>
                        <input
                            type="url"
                            value={formData.linkUrl}
                            onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com/landing-page"
                        />
                    </div>
                </div>
            </Card>

            <Card padding="lg">
                <h3 className="text-lg font-bold text-[#333333] mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-500" />
                    Targeting
                </h3>
                <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                        <label className="block text-sm font-medium text-[#333333] mb-1">Category</label>
                        <select
                            value={formData.categoryId}
                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.nameEn}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#333333] mb-1">City</label>
                        <input
                            type="text"
                            value={formData.targetCity}
                            onChange={(e) => setFormData({ ...formData, targetCity: e.target.value })}
                            placeholder="e.g., Paris"
                            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#333333] mb-1">Country</label>
                        <select
                            value={formData.targetCountry}
                            onChange={(e) => setFormData({ ...formData, targetCountry: e.target.value })}
                            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All countries</option>
                            <option value="FR">France</option>
                            <option value="BE">Belgium</option>
                            <option value="CH">Switzerland</option>
                            <option value="CA">Canada</option>
                        </select>
                    </div>
                </div>
            </Card>

            <Card padding="lg">
                <h3 className="text-lg font-bold text-[#333333] mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-yellow-500" />
                    Budget & Duration
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-[#333333] mb-1">Budget (€)</label>
                        <input
                            type="number"
                            min="0"
                            step="1"
                            value={formData.budgetCents / 100}
                            onChange={(e) => setFormData({ ...formData, budgetCents: Math.round(parseFloat(e.target.value) * 100) })}
                            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-[#7C7373] mt-1">0 = unlimited budget</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#333333] mb-1">Cost Per Click (cents)</label>
                        <input
                            type="number"
                            min="1"
                            step="1"
                            value={formData.costPerClick}
                            onChange={(e) => setFormData({ ...formData, costPerClick: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#333333] mb-1">Start Date *</label>
                        <input
                            type="date"
                            required
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#333333] mb-1">End Date *</label>
                        <input
                            type="date"
                            required
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </Card>

            <Card padding="lg">
                <h3 className="text-lg font-bold text-[#333333] mb-4 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-gray-500" />
                    Status
                </h3>
                <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="PAUSED">Paused</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            </Card>

            <div className="flex gap-3">
                <Button type="submit" isLoading={loading}>
                    {isEditing ? 'Update Campaign' : 'Create Campaign'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => router.back()}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}
