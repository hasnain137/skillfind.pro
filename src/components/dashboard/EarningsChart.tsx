// src/components/dashboard/EarningsChart.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTranslations } from 'next-intl';

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

const chartData = [
  { name: "Jan", value: 2400 },
  { name: "Feb", value: 1398 },
  { name: "Mar", value: 9800 },
  { name: "Apr", value: 3908 },
  { name: "May", value: 4800 },
  { name: "Jun", value: 3800 },
  { name: "Jul", value: 4300 },
];

export function EarningsChart({ data }: EarningsChartProps) {
  const t = useTranslations('Dashboard.EarningsChart');

  const growth = data.lastMonth > 0
    ? Math.round(((data.thisMonth - data.lastMonth) / data.lastMonth) * 100)
    : 100;

  return (
    <div className="glass-card rounded-2xl p-6 h-full" data-tour="earnings-chart">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="icon-badge icon-badge-blue">💰</div>
          <div>
            <p className="text-stat-label">{t('totalEarnings')}</p>
            <p className="text-stat-value mt-1">
              €{data.totalEarnings.toLocaleString()}
            </p>
          </div>
        </div>
        <span className="text-xs text-[#2563EB] font-semibold cursor-pointer hover:underline">
          {t('viewHistory')}
        </span>
      </div>

      {/* Growth Indicator */}
      <div className="mb-4">
        <span className={`
          inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold
          ${growth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
        `}>
          {growth >= 0 ? '↑' : '↓'} {Math.abs(growth)}%
        </span>
        <span className="ml-2 text-xs text-gray-500">{t('fromLastMonth')}</span>
      </div>

      {/* Chart */}
      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              stroke="#9CA3AF"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `€${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
              itemStyle={{ color: '#2563EB', fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#2563EB"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
        <div>
          <p className="text-stat-label">{t('thisMonth')}</p>
          <p className="mt-1 text-xl font-bold text-[#111827]">
            €{data.thisMonth.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-stat-label">{t('pending')}</p>
          <p className="mt-1 text-xl font-bold text-[#111827]">
            €{data.pendingPayouts.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
