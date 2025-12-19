'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

interface ClickStats {
    date: string;
    clicks: number;
    impressions: number;
}

interface ClickStatsChartProps {
    days?: number;
}

export function AdClickStatsChart({ days = 7 }: ClickStatsChartProps) {
    const [stats, setStats] = useState<ClickStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [totals, setTotals] = useState({ clicks: 0, impressions: 0, previousClicks: 0 });

    useEffect(() => {
        fetchStats();
    }, [days]);

    async function fetchStats() {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/ads/stats?days=${days}`);
            const json = await res.json();
            if (json.success) {
                setStats(json.data.daily || []);
                setTotals({
                    clicks: json.data.totalClicks || 0,
                    impressions: json.data.totalImpressions || 0,
                    previousClicks: json.data.previousPeriodClicks || 0,
                });
            }
        } catch (error) {
            console.error('Failed to fetch click stats:', error);
        } finally {
            setLoading(false);
        }
    }

    const maxClicks = Math.max(...stats.map(s => s.clicks), 1);
    const clickChange = totals.previousClicks > 0
        ? ((totals.clicks - totals.previousClicks) / totals.previousClicks * 100).toFixed(1)
        : '0';
    const isPositiveChange = parseFloat(clickChange) >= 0;

    if (loading) {
        return (
            <Card padding="lg">
                <Skeleton className="h-6 w-1/3 mb-4" />
                <div className="flex gap-2 items-end h-32">
                    {[...Array(7)].map((_, i) => (
                        <div key={i} className="flex-1 h-full flex items-end">
                            <Skeleton className={`w-full ${i % 2 === 0 ? 'h-2/3' : 'h-1/2'}`} />
                        </div>
                    ))}
                </div>
            </Card>
        );
    }

    return (
        <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-100">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-[#333333]">Click Statistics</h3>
                        <p className="text-xs text-[#7C7373]">Last {days} days</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xl font-bold text-[#333333]">{totals.clicks.toLocaleString()}</p>
                    <div className={`flex items-center gap-1 text-xs ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositiveChange ? (
                            <TrendingUp className="h-3 w-3" />
                        ) : (
                            <TrendingDown className="h-3 w-3" />
                        )}
                        <span>{isPositiveChange ? '+' : ''}{clickChange}%</span>
                    </div>
                </div>
            </div>

            {/* Bar chart */}
            <div className="flex gap-1 items-end h-32">
                {stats.map((stat, i) => {
                    const height = (stat.clicks / maxClicks) * 100;
                    const dayLabel = new Date(stat.date).toLocaleDateString('en', { weekday: 'short' });
                    return (
                        <div key={stat.date} className="flex-1 flex flex-col items-center gap-1">
                            <div className="text-xs font-medium text-[#333333]">{stat.clicks}</div>
                            <div
                                className="w-full rounded-t-md bg-gradient-to-t from-blue-500 to-blue-400 transition-all hover:from-blue-600 hover:to-blue-500"
                                style={{ height: `${Math.max(height, 4)}%` }}
                                title={`${stat.clicks} clicks on ${stat.date}`}
                            />
                            <div className="text-xs text-[#7C7373]">{dayLabel}</div>
                        </div>
                    );
                })}
            </div>

            {/* Summary row */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-[#E5E7EB]">
                <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">{totals.clicks.toLocaleString()}</p>
                    <p className="text-xs text-[#7C7373]">Total Clicks</p>
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold text-[#333333]">{totals.impressions.toLocaleString()}</p>
                    <p className="text-xs text-[#7C7373]">Impressions</p>
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold text-green-600">
                        {totals.impressions > 0 ? ((totals.clicks / totals.impressions) * 100).toFixed(2) : 0}%
                    </p>
                    <p className="text-xs text-[#7C7373]">CTR</p>
                </div>
            </div>
        </Card>
    );
}
