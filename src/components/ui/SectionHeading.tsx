// src/components/ui/SectionHeading.tsx
import { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  variant?: "page" | "section";
  className?: string;
  animate?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  actions,
  variant = "page",
  className = "",
  animate = false,
}: SectionHeadingProps) {
  const TitleTag: "h1" | "h2" = variant === "page" ? "h1" : "h2";
  const animationClass = animate ? "animate-fade-in-up" : "";

  return (
    <div
      className={`flex flex-col gap-3 ${actions ? "sm:flex-row sm:items-end sm:justify-between" : ""
        } ${animationClass} ${className}`}
    >
      <div className="space-y-1">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-surface-500">
            {eyebrow}
          </p>
        ) : null}
        <TitleTag
          className={`font-bold text-surface-900 ${variant === "page" ? "text-xl" : "text-sm"
            }`}
        >
          {title}
        </TitleTag>
        {description ? (
          <p className="text-xs text-surface-500">{description}</p>
        ) : null}
      </div>

      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </div>
  );
}

export default SectionHeading;
