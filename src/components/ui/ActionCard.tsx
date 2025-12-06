// src/components/ui/ActionCard.tsx
import Link from "next/link";
import { Card, CardContent } from "./Card";

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
      level={2}
      interactive
      className="group flex h-full flex-col gap-2 transition-all duration-200 border border-transparent hover:border-primary-100"
    >
      <CardContent className="h-full flex flex-col pt-6">
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
          className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-colors mt-auto pt-4"
        >
          {cta} →
        </Link>
      </CardContent>
    </Card>
  );
}

export default ActionCard;
