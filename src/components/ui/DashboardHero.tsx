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
    <div className="rounded-3xl bg-gradient-to-r from-[#EFF6FF] via-white to-white p-6 shadow-soft ring-1 ring-[#DBEAFE]/50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#7C7373]">
            {eyebrow}
          </p>
          <h1 className="text-2xl font-semibold text-[#333333]">{title}</h1>
          <p className="text-sm text-[#7C7373]">{description}</p>
        </div>
        {action ? (
          <Link
            href={action.href}
            className="inline-flex items-center justify-center rounded-full bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-[#1d4ed8]"
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
              className="rounded-2xl bg-white/70 p-4 shadow-soft-xs ring-1 ring-black/[0.02] backdrop-blur"
            >
              <p className="text-[11px] text-[#7C7373]">{item.label}</p>
              <p className="text-xl font-semibold text-[#333333]">
                {item.value}
              </p>
              {item.helper ? (
                <p className="text-[11px] text-[#7C7373]">{item.helper}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
