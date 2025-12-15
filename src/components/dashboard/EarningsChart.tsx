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
    <Card level={1} className="h-full" data-tour="earnings-chart">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-[#7C7373]">
          {t('totalEarnings')}
        </CardTitle>
        <span className="text-xs text-[#2563EB] font-medium cursor-pointer hover:underline">
          {t('viewHistory')}
        </span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-[#333333]">
          €{data.totalEarnings.toLocaleString()}
        </div>
        <p className="text-xs text-[#7C7373] mt-1">
          <span className={growth >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
            {growth > 0 ? "+" : ""}{growth}%
          </span>{" "}
          {t('fromLastMonth')}
        </p>

        <div className="h-[200px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                stroke="#B0B0B0"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#B0B0B0"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `€${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                itemStyle={{ color: '#2563EB', fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#2563EB"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#E5E7EB]">
          <div>
            <p className="text-xs font-medium text-[#7C7373]">{t('thisMonth')}</p>
            <p className="text-lg font-semibold text-[#333333]">
              €{data.thisMonth.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#7C7373]">{t('pending')}</p>
            <p className="text-lg font-semibold text-[#333333]">
              €{data.pendingPayouts.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
