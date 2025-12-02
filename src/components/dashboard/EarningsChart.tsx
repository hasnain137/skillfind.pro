// src/components/dashboard/EarningsChart.tsx
'use client';

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
      {/* Main Earnings Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2563EB] via-[#1D4FD8] to-[#1E40AF] p-6 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">
            Total Earnings
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-4xl font-bold">€{data.totalEarnings.toLocaleString()}</h3>
            <span className="text-sm text-blue-200">all time</span>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/20 pt-4">
            <div>
              <p className="text-xs text-blue-200">This Month</p>
              <p className="text-xl font-bold">€{data.thisMonth.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-blue-200">Pending</p>
              <p className="text-xl font-bold">€{data.pendingPayouts.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Indicator */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#7C7373]">Monthly Growth</span>
            <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
              isPositiveGrowth 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              <span>{isPositiveGrowth ? '↗' : '↘'}</span>
              <span>{Math.abs(parseFloat(growthPercent))}%</span>
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-[#333333]">
            €{data.thisMonth - data.lastMonth >= 0 ? '+' : ''}{(data.thisMonth - data.lastMonth).toLocaleString()}
          </p>
          <p className="text-xs text-[#7C7373] mt-1">vs. last month</p>
        </div>

        <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#7C7373]">Completed Jobs</span>
            <div className="text-2xl">✅</div>
          </div>
          <p className="mt-2 text-2xl font-bold text-[#333333]">
            {data.completedJobs}
          </p>
          <p className="text-xs text-[#7C7373] mt-1">Total completed</p>
        </div>
      </div>
    </div>
  );
}
