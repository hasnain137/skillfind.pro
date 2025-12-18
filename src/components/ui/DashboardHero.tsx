// src/components/ui/DashboardHero.tsx
import { Link } from '@/i18n/routing';

type Highlight = {
  label: string;
  value: string;
  helper?: string;
};

type DashboardHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  highlights?: Highlight[];
};

export function DashboardHero({
  eyebrow,
  title,
  description,
  action,
  highlights = [],
}: DashboardHeroProps) {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-[#EFF6FF] to-white p-8 shadow-sm border border-[#E5E7EB] text-[#1F2937] relative overflow-hidden">

      {/* Abstract Background Shapes - lighter for this variant */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-[#3B4D9D]">
            Overview
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#111827]">{title}</h1>
          <p className="text-[#6B7280] text-lg leading-relaxed max-w-lg">{description}</p>
        </div>
        {action ? (
          <Link
            href={action.href}
            className="inline-flex items-center justify-center rounded-xl bg-[#3B4D9D] text-white px-6 py-3 text-sm font-bold shadow-lg transition transform hover:scale-105 hover:bg-[#2a3a7a]"
          >
            <span className="leading-none">{action.label}</span>
          </Link>
        ) : null}
      </div>

      {highlights.length ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-3 relative z-10">
          {highlights.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl bg-white/60 backdrop-blur-md p-5 shadow-sm border border-white/40 hover:scale-105 transition-all duration-300"
            >
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{item.label}</p>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold text-gray-900">
                  {item.value}
                </p>
              </div>

              {item.helper ? (
                <p className="text-xs font-medium text-gray-400 mt-2">{item.helper}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
