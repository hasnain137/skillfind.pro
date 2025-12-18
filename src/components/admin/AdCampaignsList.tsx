'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Link } from '@/i18n/routing';
import { MousePointer, Eye, Calendar, DollarSign, Trash2, Edit } from 'lucide-react';

interface Campaign {
    id: string;
    name: string;
    status: string;
    budgetEuros: number;
    spentEuros: number;
    impressions: number;
    clicks: number;
    ctr: string;
    startDate: string;
    endDate: string;
    category?: { nameEn: string };
    targetCity?: string;
}

export function AdCampaignsList() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchCampaigns();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    async function fetchCampaigns() {
        setLoading(true);
        try {
            const url = filter
                ? `/api/admin/ads?status=${filter}`
                : '/api/admin/ads';
            const res = await fetch(url);
            const json = await res.json();
            if (json.success) {
                setCampaigns(json.data?.campaigns || []);
            }
        } catch (error) {
            console.error('Failed to fetch campaigns:', error);
        } finally {
            setLoading(false);
        }
    }

    async function deleteCampaign(id: string) {
        if (!confirm('Delete this campaign?')) return;
        try {
            await fetch(`/api/admin/ads/${id}`, { method: 'DELETE' });
            fetchCampaigns();
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    }

    const statusColors: Record<string, 'success' | 'warning' | 'destructive' | 'gray' | 'info'> = {
        ACTIVE: 'success',
        DRAFT: 'gray',
        PENDING_PAYMENT: 'warning',
        PAUSED: 'warning',
        COMPLETED: 'info',
        CANCELLED: 'destructive',
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <Card key={i} level={1}>
                        <CardContent className="p-4">
                            <Skeleton className="h-6 w-1/3 mb-2" />
                            <Skeleton className="h-4 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap">
                {['', 'ACTIVE', 'DRAFT', 'PAUSED', 'COMPLETED'].map(s => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filter === s
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-[#7C7373] hover:bg-gray-200'
                            }`}
                    >
                        {s || 'All'}
                    </button>
                ))}
            </div>

            {campaigns.length === 0 ? (
                <Card level={1} className="py-8 text-center">
                    <p className="text-[#333333] font-medium">No campaigns found</p>
                    <p className="text-sm text-[#7C7373]">Create your first ad campaign to get started.</p>
                </Card>
            ) : (
                campaigns.map(campaign => (
                    <Card key={campaign.id} level={1} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium text-[#333333]">{campaign.name}</h3>
                                        <Badge variant={statusColors[campaign.status] || 'gray'}>
                                            {campaign.status}
                                        </Badge>
                                    </div>
                                    <div className="flex gap-4 mt-1 text-xs text-[#7C7373]">
                                        {campaign.category && <span>📂 {campaign.category.nameEn}</span>}
                                        {campaign.targetCity && <span>📍 {campaign.targetCity}</span>}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Link href={`/admin/ads/${campaign.id}`}>
                                        <Button variant="ghost" size="sm">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteCampaign(campaign.id)}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Eye className="h-4 w-4 text-[#7C7373]" />
                                    <div>
                                        <p className="font-medium">{campaign.impressions.toLocaleString()}</p>
                                        <p className="text-xs text-[#7C7373]">Impressions</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MousePointer className="h-4 w-4 text-blue-500" />
                                    <div>
                                        <p className="font-medium">{campaign.clicks.toLocaleString()}</p>
                                        <p className="text-xs text-[#7C7373]">Clicks ({campaign.ctr})</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-green-500" />
                                    <div>
                                        <p className="font-medium">€{campaign.spentEuros.toFixed(2)}</p>
                                        <p className="text-xs text-[#7C7373]">of €{campaign.budgetEuros.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 col-span-2 sm:col-span-2">
                                    <Calendar className="h-4 w-4 text-[#7C7373]" />
                                    <div>
                                        <p className="text-xs">
                                            {new Date(campaign.startDate).toLocaleDateString()} — {new Date(campaign.endDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
}
