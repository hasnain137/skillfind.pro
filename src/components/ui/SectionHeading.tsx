// src/components/ui/SectionHeading.tsx
import { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  variant?: "page" | "section";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  actions,
  variant = "page",
  className = "",
}: SectionHeadingProps) {
  const TitleTag = (variant === "page" ? "h1" : "h2") as const;

  return (
    <div
      className={`flex flex-col gap-3 ${
        actions ? "sm:flex-row sm:items-end sm:justify-between" : ""
      } ${className}`}
    >
      <div className="space-y-1">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7C7373]">
            {eyebrow}
          </p>
        ) : null}
        <TitleTag
          className={`font-semibold text-[#333333] ${
            variant === "page" ? "text-xl" : "text-sm"
          }`}
        >
          {title}
        </TitleTag>
        {description ? (
          <p className="text-xs text-[#7C7373]">{description}</p>
        ) : null}
      </div>

      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </div>
  );
}

