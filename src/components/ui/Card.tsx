// src/components/ui/Card.tsx
import { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "muted" | "dashed";
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
};

const VARIANTS: Record<NonNullable<CardProps["variant"]>, string> = {
  default: "border-solid border-[#E5E7EB] bg-white shadow-sm",
  muted: "border-solid border-[#E5E7EB] bg-[#F9FAFB]",
  dashed: "border-dashed border-[#D1D5DB] bg-[#F9FAFB]",
};

const PADDING: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

export function Card({
  variant = "default",
  padding = "md",
  interactive = false,
  className = "",
  ...props
}: CardProps) {
  const interactiveStyles = interactive
    ? "cursor-pointer transition-all duration-200 hover:border-[#2563EB] hover:shadow-md active:scale-[0.99]"
    : "";

  return (
    <div
      className={`rounded-2xl border ${VARIANTS[variant]} ${PADDING[padding]} ${interactiveStyles} ${className}`}
      {...props}
    />
  );
}
