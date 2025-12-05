// src/components/ui/ActionCard.tsx
import Link from "next/link";
import { Card } from "./Card";

type ActionCardProps = {
  title: string;
  description: string;
  href: string;
  cta: string;
  icon?: React.ReactNode;
};

export function ActionCard({ title, description, href, cta, icon }: ActionCardProps) {
  return (
    <Card
      className="group flex h-full flex-col gap-2 hover:bg-white transition-all duration-200"
      variant="muted"
      padding="lg"
      hoverEffect="border"
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600 text-sm">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-surface-900 group-hover:text-primary-600 transition-colors">
            {title}
          </p>
          <p className="text-xs text-surface-500 mt-0.5">{description}</p>
        </div>
      </div>
      <Link
        href={href}
        className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-colors mt-auto"
      >
        {cta} →
      </Link>
    </Card>
  );
}

export default ActionCard;
