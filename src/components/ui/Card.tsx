// src/components/ui/Card.tsx
import { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "muted" | "dashed";
  padding?: "none" | "sm" | "md" | "lg";
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
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-2xl border ${VARIANTS[variant]} ${PADDING[padding]} ${className}`}
      {...props}
    />
  );
}

