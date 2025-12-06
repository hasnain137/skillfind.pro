// src/components/dashboard/EarningsChart.tsx
'use client';

import { Card, CardContent } from "@/components/ui/Card";

interface EarningsData {
  totalEarnings: number;
  thisMonth: number;
  lastMonth: number;
  pendingPayouts: number;
  completedJobs: number;
}

interface EarningsChartProps {
  data: EarningsData;
}

export function EarningsChart({ data }: EarningsChartProps) {
  const growthPercent = data.lastMonth > 0
    ? ((data.thisMonth - data.lastMonth) / data.lastMonth * 100).toFixed(1)
    : '0';
  const isPositiveGrowth = parseFloat(growthPercent) >= 0;

  return (
    <div className="space-y-6">
      {/* Main Earnings Card - Primary gradient remains prominent */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-6 text-white shadow-float transition-transform hover:scale-[1.02] duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-200">
            Total Earnings
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-4xl font-bold tracking-tight">€{data.totalEarnings.toLocaleString()}</h3>
            <span className="text-sm text-primary-200">all time</span>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/20 pt-4">
            <div>
              <p className="text-xs text-primary-200">This Month</p>
              <p className="text-xl font-bold">€{data.thisMonth.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-primary-200">Pending</p>
              <p className="text-xl font-bold">€{data.pendingPayouts.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Indicator - Subtle shadow cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card level={2}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-surface-500">Monthly Growth</span>
              <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${isPositiveGrowth
                ? 'bg-success-light text-success-dark'
                : 'bg-error-light text-error-dark'
                }`}>
                <span>{isPositiveGrowth ? '↗' : '↘'}</span>
                <span>{Math.abs(parseFloat(growthPercent))}%</span>
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-surface-900 tracking-tight">
              €{data.thisMonth - data.lastMonth >= 0 ? '+' : ''}{(data.thisMonth - data.lastMonth).toLocaleString()}
            </p>
            <p className="text-xs text-surface-400 mt-1">vs. last month</p>
          </CardContent>
        </Card>

        <Card level={2}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-surface-500">Completed Jobs</span>
              <div className="text-2xl">✅</div>
            </div>
            <p className="mt-2 text-2xl font-bold text-surface-900 tracking-tight">
              {data.completedJobs}
            </p>
            <p className="text-xs text-surface-400 mt-1">Total completed</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
