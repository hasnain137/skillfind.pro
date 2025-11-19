// src/components/ui/DashboardHero.tsx
import Link from "next/link";

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
    <div className="rounded-3xl border border-[#DDE7FF] bg-gradient-to-r from-[#EEF2FF] via-white to-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#7C7373]">
            {eyebrow}
          </p>
          <h1 className="text-2xl font-semibold text-[#1F2937]">{title}</h1>
          <p className="text-sm text-[#4B5563]">{description}</p>
        </div>
        {action ? (
          <Link
            href={action.href}
            className="inline-flex items-center justify-center rounded-full bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1D4FD8]"
          >
            <span className="leading-none">{action.label}</span>
          </Link>
        ) : null}
      </div>

      {highlights.length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/70 bg-white/60 p-4 shadow-[0_1px_3px_rgba(15,23,42,0.08)] backdrop-blur"
            >
              <p className="text-[11px] text-[#7C7373]">{item.label}</p>
              <p className="text-xl font-semibold text-[#1F2937]">
                {item.value}
              </p>
              {item.helper ? (
                <p className="text-[11px] text-[#9CA3AF]">{item.helper}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
