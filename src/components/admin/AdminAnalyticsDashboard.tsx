'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
    TrendingUp,
    TrendingDown,
    Users,
    Briefcase,
    Star,
    DollarSign,
    Activity,
    AlertCircle,
    CheckCircle,
    Clock,
    FileText,
    Download
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

interface AnalyticsData {
    period: { days: number };
    users: {
        total: number;
        active: number;
        clients: number;
        professionals: number;
        newInPeriod: number;
    };
    requests: {
        total: number;
        open: number;
        closed: number;
        newInPeriod: number;
    };
    offers: {
        total: number;
        pending: number;
        accepted: number;
        newInPeriod: number;
    };
    jobs: {
        total: number;
        completed: number;
        inProgress: number;
        newInPeriod: number;
    };
    reviews: {
        total: number;
        pending: number;
        approved: number;
        newInPeriod: number;
    };
    financial: {
        totalTransactions: number;
        totalRevenue: { euros: number };
        clicks: {
            total: number;
            inPeriod: number;
            revenue: { euros: number };
        };
    };
    disputes: {
        total: number;
        open: number;
    };
    conversions: {
        requestToOfferRate: string;
        offerAcceptanceRate: string;
        jobCompletionRate: string;
    };
    topProfessionals: Array<{
        id: string;
        name: string;
        averageRating: number;
        totalReviews: number;
        totalJobs: number;
    }>;
    topCategories: Array<{
        categoryId: string;
        name: string;
        count: number;
    }>;
}

function MetricCard({
    label,
    value,
    change,
    icon: Icon,
    trend
}: {
    label: string;
    value: string | number;
    change?: string;
    icon: React.ElementType;
    trend?: 'up' | 'down' | 'neutral';
}) {
    return (
        <Card level={1}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-xs font-medium text-[#7C7373] uppercase tracking-wide">{label}</p>
                        <p className="text-2xl font-bold text-[#333333] mt-1">{value}</p>
                        {change && (
                            <div className="flex items-center gap-1 mt-1">
                                {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                                {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                                <span className={`text-xs ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-[#7C7373]'}`}>
                                    {change}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function MiniBarChart({ data, label }: { data: number[]; label: string }) {
    const max = Math.max(...data, 1);
    return (
        <div>
            <p className="text-xs text-[#7C7373] mb-2">{label}</p>
            <div className="flex items-end gap-1 h-12">
                {data.map((value, i) => (
                    <div
                        key={i}
                        className="flex-1 bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                        style={{ height: `${(value / max) * 100}%`, minHeight: '4px' }}
                        title={`${value}`}
                    />
                ))}
            </div>
        </div>
    );
}

export function AdminAnalyticsDashboard() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState(30);

    useEffect(() => {
        async function fetchAnalytics() {
            setLoading(true);
            try {
                const res = await fetch(`/api/admin/analytics?days=${period}`);
                const json = await res.json();
                if (json.success) {
                    setData(json.data);
                }
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchAnalytics();
    }, [period]);

    const handleExportCSV = () => {
        if (!data) return;

        const csvContent = [
            ['Metric', 'Value'],
            ['Total Users', data.users.total],
            ['Active Users', data.users.active],
            ['Professionals', data.users.professionals],
            ['Clients', data.users.clients],
            ['Total Requests', data.requests.total],
            ['Open Requests', data.requests.open],
            ['Total Jobs', data.jobs.total],
            ['Completed Jobs', data.jobs.completed],
            ['Total Reviews', data.reviews.total],
            ['Revenue (EUR)', data.financial.totalRevenue.euros],
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => (
                        <Card key={i} level={1}>
                            <CardContent className="p-4">
                                <Skeleton className="h-4 w-20 mb-2" />
                                <Skeleton className="h-8 w-16" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <Card level={1}>
                <CardContent className="py-8 text-center">
                    <AlertCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
                    <p className="text-[#7C7373]">Failed to load analytics</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Period Selector & Export */}
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    {[7, 30, 90].map(days => (
                        <button
                            key={days}
                            onClick={() => setPeriod(days)}
                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${period === days
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-[#7C7373] hover:bg-gray-200'
                                }`}
                        >
                            {days}d
                        </button>
                    ))}
                </div>
                <Button variant="secondary" onClick={handleExportCSV} className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    label="Total Users"
                    value={data.users.total}
                    change={`+${data.users.newInPeriod} this period`}
                    icon={Users}
                    trend="up"
                />
                <MetricCard
                    label="Active Jobs"
                    value={data.jobs.inProgress}
                    change={`${data.jobs.newInPeriod} new`}
                    icon={Briefcase}
                    trend="neutral"
                />
                <MetricCard
                    label="Pending Reviews"
                    value={data.reviews.pending}
                    change="needs moderation"
                    icon={Star}
                    trend="neutral"
                />
                <MetricCard
                    label="Revenue"
                    value={`€${data.financial.totalRevenue.euros.toFixed(2)}`}
                    change={`${data.financial.clicks.inPeriod} clicks`}
                    icon={DollarSign}
                    trend="up"
                />
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Conversion Rates */}
                <Card level={1}>
                    <CardHeader>
                        <CardTitle className="text-sm">Conversion Rates</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-[#7C7373]">Request → Offer</span>
                                <span className="font-medium">{data.conversions.requestToOfferRate}x</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${Math.min(parseFloat(data.conversions.requestToOfferRate) * 20, 100)}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-[#7C7373]">Offer Acceptance</span>
                                <span className="font-medium">{data.conversions.offerAcceptanceRate}</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 rounded-full"
                                    style={{ width: data.conversions.offerAcceptanceRate }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-[#7C7373]">Job Completion</span>
                                <span className="font-medium">{data.conversions.jobCompletionRate}</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-purple-500 rounded-full"
                                    style={{ width: data.conversions.jobCompletionRate }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Top Categories */}
                <Card level={1}>
                    <CardHeader>
                        <CardTitle className="text-sm">Top Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.topCategories.map((cat, i) => (
                                <div key={cat.categoryId} className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-[#7C7373] w-4">{i + 1}</span>
                                    <span className="flex-1 text-sm truncate">{cat.name}</span>
                                    <span className="text-sm font-medium text-[#333333]">{cat.count}</span>
                                </div>
                            ))}
                            {data.topCategories.length === 0 && (
                                <p className="text-sm text-[#7C7373]">No data yet</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card level={1}>
                    <CardHeader>
                        <CardTitle className="text-sm">Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-[#7C7373]">Open Disputes</span>
                            <span className={`text-sm font-medium ${data.disputes.open > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                {data.disputes.open}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-[#7C7373]">Open Requests</span>
                            <span className="text-sm font-medium">{data.requests.open}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-[#7C7373]">Pending Offers</span>
                            <span className="text-sm font-medium">{data.offers.pending}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-[#7C7373]">Total Clicks</span>
                            <span className="text-sm font-medium">{data.financial.clicks.total}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Professionals */}
            <Card level={1}>
                <CardHeader>
                    <CardTitle className="text-sm">Top Rated Professionals</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[#E5E7EB]">
                                    <th className="text-left py-2 font-medium text-[#7C7373]">Professional</th>
                                    <th className="text-center py-2 font-medium text-[#7C7373]">Rating</th>
                                    <th className="text-center py-2 font-medium text-[#7C7373]">Reviews</th>
                                    <th className="text-center py-2 font-medium text-[#7C7373]">Jobs</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.topProfessionals.map((pro) => (
                                    <tr key={pro.id} className="border-b border-[#E5E7EB] last:border-0">
                                        <td className="py-2">{pro.name}</td>
                                        <td className="py-2 text-center">
                                            <span className="inline-flex items-center gap-1">
                                                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                                {pro.averageRating?.toFixed(1) || '-'}
                                            </span>
                                        </td>
                                        <td className="py-2 text-center">{pro.totalReviews}</td>
                                        <td className="py-2 text-center">{pro.totalJobs}</td>
                                    </tr>
                                ))}
                                {data.topProfessionals.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-4 text-center text-[#7C7373]">
                                            No professionals with reviews yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
