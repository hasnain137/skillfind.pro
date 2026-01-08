// src/components/dashboard/EarningsChart.tsx
'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Banknote, ArrowRight, TrendingUp, TrendingDown, Clock, Calendar, Wallet } from 'lucide-react';

interface EarningsData {
  totalEarnings: number;
  thisMonth: number;
  lastMonth: number;
  pendingPayouts: number;
  completedJobs: number;
  chartData: Array<{ name: string; value: number }>;
}

interface EarningsChartProps {
  data: EarningsData;
}

export function EarningsChart({ data }: EarningsChartProps) {
  const t = useTranslations('Dashboard.EarningsChart');

  // Use passed data or fallback to empty array safely
  const chartValues = data.chartData && data.chartData.length > 0 ? data.chartData : [];

  const growth = data.lastMonth > 0
    ? Math.round(((data.thisMonth - data.lastMonth) / data.lastMonth) * 100)
    : 0; // Default to 0 if no last month data

  const isPositiveGrowth = growth >= 0;

  return (
    <Card level={1} className="border border-white/40 shadow-lg" data-tour="earnings-chart">
      <CardHeader className="pb-2 border-b border-gray-100/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{t('totalEarnings')}</p>
              <p className="text-2xl font-bold text-[#333333] leading-none mt-1">€{data.totalEarnings.toLocaleString()}</p>
            </div>
          </div>
          <Link href="/pro/jobs" className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-gray-400 hover:bg-[#3B4D9D]/10 hover:text-[#3B4D9D] transition-all">
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="pt-6 flex flex-col">
        {/* Growth Indicator */}
        <div className="flex items-center gap-3 mb-6">
          <span className={`
              inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
              ${isPositiveGrowth ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20' : 'bg-red-50 text-red-700 ring-1 ring-red-600/20'}
            `}>
            {isPositiveGrowth ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(growth)}%
          </span>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('fromLastMonth')}</span>
        </div>

        {/* Chart */}
        <div className="h-[180px] w-full -ml-2 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartValues}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B4D9D" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3B4D9D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                stroke="#9CA3AF"
                fontSize={10}
                fontWeight={500}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={10}
                fontWeight={500}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `€${value}`}
                dx={-10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#333333'
                }}
                itemStyle={{ color: '#3B4D9D' }}
                cursor={{ stroke: '#E5E7EB', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3B4D9D"
                strokeWidth={3}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#3B4D9D' }}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mt-auto pt-6 border-t border-gray-100/50">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              <p className="text-xs font-bold uppercase tracking-wider">{t('thisMonth')}</p>
            </div>
            <p className="text-xl font-bold text-[#333333] tracking-tight">
              €{data.thisMonth.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1 pl-4 border-l border-gray-100">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              <p className="text-xs font-bold uppercase tracking-wider">{t('pending')}</p>
            </div>
            <p className="text-xl font-bold text-[#333333] tracking-tight">
              €{data.pendingPayouts.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
