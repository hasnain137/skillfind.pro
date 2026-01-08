// src/components/ui/ActionCard.tsx
import { Link } from '@/i18n/routing';
import { ArrowRight } from 'lucide-react';

type ActionCardProps = {
  title: string;
  description: string;
  href: string;
  cta: string;
  icon?: React.ReactNode;
};

export function ActionCard({ title, description, href, cta, icon }: ActionCardProps) {
  return (
    <Link
      href={href}
      className="group block h-full rounded-3xl border border-white/40 bg-white/70 backdrop-blur-xl p-6 transition-all duration-300 hover:scale-[1.02] hover:bg-white/80 hover:shadow-lg hover:border-[#3B4D9D]/20"
    >
      <div className="flex items-start gap-4">
        {icon && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3B4D9D]/10 text-[#3B4D9D] transition-colors group-hover:bg-[#3B4D9D]/20 group-hover:text-[#304090] ring-1 ring-[#3B4D9D]/10">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0 pt-1">
          <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#304090] transition-colors uppercase tracking-wide">
            {title}
          </h3>
          <p className="text-xs font-medium text-gray-500 mt-2 leading-relaxed">{description}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center text-xs font-bold text-[#3B4D9D] group-hover:text-[#304090] uppercase tracking-wider">
        {cta}
        <ArrowRight className="ml-2 w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}


