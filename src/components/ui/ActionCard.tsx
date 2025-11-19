// src/components/ui/ActionCard.tsx
import Link from "next/link";
import { Card } from "./Card";

type ActionCardProps = {
  title: string;
  description: string;
  href: string;
  cta: string;
};

export function ActionCard({ title, description, href, cta }: ActionCardProps) {
  return (
    <Card
      className="flex h-full flex-col gap-2 transition hover:border-[#2563EB]/40 hover:bg-white"
      variant="muted"
      padding="lg"
    >
      <div>
        <p className="text-sm font-semibold text-[#333333]">{title}</p>
        <p className="text-xs text-[#7C7373]">{description}</p>
      </div>
      <Link
        href={href}
        className="text-xs font-semibold text-[#2563EB] hover:underline"
      >
        {cta} &rarr;
      </Link>
    </Card>
  );
}

